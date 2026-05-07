import Opportunity from '../../database/models/Opportunity';
import Application from '../../database/models/Application';
import User from '../../database/models/User';
import { getGeminiModel } from '../../config/gemini';
import logger from '../../utils/logger';

/**
 * Marketing Analysis Service
 *
 * Calculates profitability metrics for each applicant on an opportunity,
 * then optionally generates a Gemini AI summary explaining which
 * advertisers are the best choice.
 *
 * Formulas:
 *   reach           = followers × 0.30
 *   engagement       = reach × (engagementRate / 100)
 *   conversions      = engagement × conversionRate (default 2%)
 *   revenue          = conversions × avgProductPrice
 *   profit           = revenue − proposedRate
 *   profitPercentage = (profit / proposedRate) × 100
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApplicantAnalysis {
    advertiserId: string;
    advertiserName: string;
    profilePicture?: string;
    followers: number;
    engagementRate: number;
    niche: string;
    cost: number;
    currency: string;
    estimatedReach: number;
    estimatedEngagement: number;
    estimatedConversions: number;
    estimatedRevenue: number;
    profit: number;
    profitPercentage: number;
    profitable: boolean;
    aiInsight?: string;
    aiMatchScore?: number;
}

export interface MarketingAnalysisResult {
    summary: string; // The full AI text response
    totalApplicants: number;
    bestChoice: ApplicantAnalysis | null;
    analysis: ApplicantAnalysis[];
    aiInsights: {
        poolQuality: string;
        selectionReasoning: string;
        risks: string[];
        strategicAdvice: string;
        suggestedNextSteps: string;
        marketFitScore: number; // 0-100
    } | null;
    opportunityTitle: string;
    opportunityCategory: string;
    opportunityBudget: number;
    generatedAt: Date;
}

// ─── Core Analysis ──────────────────────────────────────────────────────────

/**
 * Run marketing profitability analysis for all applicants of an opportunity.
 * @param opportunityId - The opportunity's MongoDB ObjectId
 * @param conversionRate - Optional conversion rate override (default 0.02 = 2%)
 * @param avgProductPrice - Optional product price override (default: opportunity budget / 10 or 50)
 */
export const runMarketingAnalysis = async (
    opportunityId: string,
    conversionRate: number = 0.02,
    avgProductPrice?: number
): Promise<MarketingAnalysisResult> => {

    // 1. Load the opportunity
    const opp = await Opportunity.findById(opportunityId);
    if (!opp) throw new Error('Opportunity not found');

    // 2. Load all applications with populated advertiser data
    const applications = await Application.find({ opportunity: opportunityId })
        .populate('advertiser', 'firstName lastName username profilePicture location profileData');

    if (!applications.length) {
        throw new Error('No applicants found for this opportunity');
    }

    // Determine average product price
    const productPrice = avgProductPrice ?? (opp.budget?.amount ? Math.round(opp.budget.amount / 10) : 50);

    // 3. Calculate profitability for each applicant
    const results: ApplicantAnalysis[] = [];

    for (const app of applications) {
        const adv = app.advertiser as any;
        if (!adv) continue;

        const advProfile = adv.profileData || {};
        const followers = advProfile.followers || 0;
        const engagementRate = advProfile.engagementRate || 0;
        const niche = advProfile.category || advProfile.niche || 'General';
        const cost = app.proposedRate?.amount || 0;
        const currency = app.proposedRate?.currency || 'ETB';

        // Profitability calculations
        const reach = followers * 0.3;
        const engagement = reach * (engagementRate / 100);
        const conversions = engagement * conversionRate;
        const revenue = conversions * productPrice;
        const profit = revenue - cost;
        const profitPercentage = cost > 0 ? (profit / cost) * 100 : 0;

        results.push({
            advertiserId: (adv._id as any).toString(),
            advertiserName: `${adv.firstName || ''} ${adv.lastName || ''}`.trim() || adv.username || 'Unknown',
            profilePicture: adv.profilePicture,
            followers,
            engagementRate,
            niche,
            cost,
            currency,
            estimatedReach: Math.round(reach),
            estimatedEngagement: Math.round(engagement),
            estimatedConversions: Math.round(conversions),
            estimatedRevenue: Number(revenue.toFixed(2)),
            profit: Number(profit.toFixed(2)),
            profitPercentage: Number(profitPercentage.toFixed(2)),
            profitable: profit > 0,
        });
    }

    // 4. Sort by profitability (highest first)
    results.sort((a, b) => b.profitPercentage - a.profitPercentage);

    // 5. Generate Gemini AI summary
    let summary = '';
    let aiInsights: any = null;

    try {
        const aiResponse = await generateAISummary(opp, results);
        summary = aiResponse.summary;
        aiInsights = aiResponse.insights;
        
        // Merge per-applicant AI insights back into the results
        if (aiResponse.applicantInsights) {
            results.forEach(res => {
                const insight = aiResponse.applicantInsights.find((ai: any) => ai.advertiserId === res.advertiserId);
                if (insight) {
                    res.aiInsight = insight.insight;
                    res.aiMatchScore = insight.matchScore;
                }
            });
        }
    } catch (err: any) {
        logger.warn(`[MarketingAnalysis] Gemini summary failed: ${err.message}`);
        summary = generateFallbackSummary(results);
    }

    logger.info(
        `[MarketingAnalysis] Generated analysis for opportunity ${opportunityId}: ${results.length} applicants`
    );

    return {
        summary,
        totalApplicants: results.length,
        bestChoice: results[0] || null,
        analysis: results,
        aiInsights,
        opportunityTitle: opp.title,
        opportunityCategory: opp.category,
        opportunityBudget: opp.budget?.amount || 0,
        generatedAt: new Date(),
    };
};

// ─── Gemini AI Summary ──────────────────────────────────────────────────────

async function generateAISummary(opp: any, results: ApplicantAnalysis[]): Promise<{ summary: string; insights: any; applicantInsights: any[] }> {
    const model = getGeminiModel();
    if (!model) {
        return { summary: generateFallbackSummary(results), insights: null, applicantInsights: [] };
    }

    const profitableCount = results.filter(r => r.profitable).length;
    // Limit to top 10 for AI analysis to avoid huge prompts
    const forAnalysis = results.slice(0, 10);

    const prompt = `
You are a senior marketing strategist. Analyze these advertiser applicants for a campaign.

Campaign Details:
- Title: ${opp.title}
- Category: ${opp.category}
- Budget: ${opp.budget?.amount || 'N/A'} ${opp.budget?.currency || 'ETB'}

Applicant List:
${forAnalysis.map((r, i) => `${i + 1}. ID: ${r.advertiserId}, Name: ${r.advertiserName}, Followers: ${r.followers}, Engagement: ${r.engagementRate}%, ROI: ${r.profitPercentage}%, Niche: ${r.niche}`).join('\n')}

Return your response in strict JSON format:
{
  "summary": "A 150-word business summary of the applicant pool.",
  "insights": {
    "poolQuality": "Overview of quality",
    "selectionReasoning": "Why the top choices stand out",
    "risks": ["Risk 1", "Risk 2"],
    "strategicAdvice": "Strategic direction",
    "suggestedNextSteps": "Immediate actions",
    "marketFitScore": 85
  },
  "applicantInsights": [
    {
      "advertiserId": "ID from list",
      "matchScore": 95,
      "insight": "One sentence about why this creator is a good or bad fit."
    }
  ]
}
`;

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    try {
        const text = result.response.text();
        const parsed = JSON.parse(text);
        return {
            summary: parsed.summary || generateFallbackSummary(results),
            insights: parsed.insights || null,
            applicantInsights: parsed.applicantInsights || []
        };
    } catch (e) {
        logger.error(`[MarketingAnalysis] Failed to parse AI JSON: ${e}`);
        return { summary: generateFallbackSummary(results), insights: null, applicantInsights: [] };
    }
}

function generateFallbackSummary(results: ApplicantAnalysis[]): string {
    const profitableCount = results.filter(r => r.profitable).length;
    const best = results[0];

    if (!best) return 'No applicants to analyze.';

    let summary = `Out of ${results.length} applicant(s), ${profitableCount} show positive ROI potential. `;

    if (best.profitable) {
        summary += `The top candidate is ${best.advertiserName} with ${best.followers.toLocaleString()} followers and ${best.engagementRate}% engagement rate, `;
        summary += `projecting a ${best.profitPercentage.toFixed(1)}% return on investment. `;
        summary += `Estimated reach: ${best.estimatedReach.toLocaleString()}, with ~${best.estimatedConversions} potential conversions.`;
    } else {
        summary += `Currently, none of the applicants show positive ROI at the proposed rates. Consider negotiating lower rates or targeting advertisers with higher engagement.`;
    }

    return summary;
}
/**
 * Predict potential ROI for a match between a Business Owner and an Advertiser.
 * Used for the "Discover" page to show potential before hiring.
 */
export const predictAdvertiserROI = async (
    businessOwnerId: string,
    advertiserId: string
): Promise<any> => {
    // 1. Load profiles
    const owner = await User.findById(businessOwnerId);
    const adv = await User.findById(advertiserId);

    if (!owner || !adv) throw new Error('User not found');

    const advProfile = adv.profileData || {};
    const ownerProfile = owner.profileData || {};

    // 2. Base metrics
    const followers = advProfile.followers || 10000;
    const engagementRate = advProfile.engagementRate || 3;
    const avgProductPrice = ownerProfile.monthlyBudget ? Math.round(ownerProfile.monthlyBudget / 50) : 50;

    // 3. Generate 6-month projection data
    const months = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
    const projections = months.map((month, i) => {
        const growthFactor = 1 + (i * 0.15); // Assume 15% monthly growth
        const reach = followers * 0.3 * growthFactor;
        const conversions = reach * (engagementRate / 100) * 0.02;
        const revenue = conversions * avgProductPrice;

        return {
            month,
            reach: Math.round(reach),
            conversions: Math.round(conversions),
            revenue: Math.round(revenue),
        };
    });

    // 4. Generate AI Match Insight
    let aiInsight = "Based on your niche, this creator offers strong growth potential.";
    try {
        const model = getGeminiModel();
        if (model) {
            const prompt = `
                Analyze the potential match between Business Owner "${owner.firstName}" and Advertiser "${adv.firstName}".
                Owner Industry: ${ownerProfile.industry || 'General'}
                Advertiser Niche: ${advProfile.category || 'Lifestyle'}
                Followers: ${followers}
                Engagement: ${engagementRate}%
                
                Provide a 2-sentence "Match Insight" about why this collaboration is promising or what to watch out for.
                Return only the text.
            `;
            const result = await model.generateContent(prompt);
            aiInsight = result.response.text().trim();
        }
    } catch (err) {
        logger.warn(`[MarketingAnalysis] Predictive AI insight failed: ${err}`);
    }

    return {
        advertiserName: `${adv.firstName} ${adv.lastName}`.trim(),
        aiInsight,
        projections,
        metrics: {
            reach: Math.round(followers * 0.3),
            conversionRate: '2%',
            avgProductPrice,
        }
    };
};
