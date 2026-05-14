import Opportunity from '../../database/models/Opportunity';
import Application from '../../database/models/Application';
import User from '../../database/models/User';
import { getGeminiModel } from '../../config/gemini';
import logger from '../../utils/logger';

// ─── Profile Data Helper ─────────────────────────────────────────────────────

/**
 * Parse numeric values that may be stored as strings with K/M/B suffixes
 */
const parseNum = (val: any): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const cleaned = val.toUpperCase().replace(/[^0-9.KMB]/g, '');
        let multiplier = 1;
        if (cleaned.endsWith('K')) multiplier = 1000;
        else if (cleaned.endsWith('M')) multiplier = 1000000;
        else if (cleaned.endsWith('B')) multiplier = 1000000000;
        const num = parseFloat(cleaned.replace(/[KMB]/g, ''));
        return isNaN(num) ? 0 : num * multiplier;
    }
    return 0;
};

/**
 * Extract the best social media metrics from the nested profileData.
 * Database schema: profileData.tiktok.{followers, engagementRate, niche, ...}
 *                  profileData.instagram.{followers, engagementRate, niche, ...}
 */
export const extractMetrics = (profileData: any) => {
    if (!profileData) return { followers: 0, engagementRate: 0, niche: 'General', platforms: [] as string[] };

    let bestFollowers = 0;
    let bestEngagement = 0;
    let niches: string[] = [];
    const platforms: string[] = [];

    // Helper: compute ER from raw metrics if engagementRate is not stored
    const computeER = (platform: any): number => {
        // If engagementRate is already stored and valid, use it (but cap at 100)
        const storedER = parseNum(platform.engagementRate);
        if (storedER > 0 && storedER <= 100) return storedER;

        // Otherwise compute from raw metrics: (likes + comments + shares) / followers * 100
        const f = parseNum(platform.followers);
        const likes = parseNum(platform.totalLikes);
        const comments = parseNum(platform.avgComments);
        const shares = parseNum(platform.avgShares);
        const views = parseNum(platform.avgViews);

        if (f <= 0) return 0;

        // Validate: likes should not exceed views (if both exist)
        if (likes > 0 && views > 0 && likes > views) {
            logger.warn(`[extractMetrics] Invalid metrics: likes (${likes}) > views (${views}). Skipping ER computation.`);
            return 0;
        }

        const rawER = ((likes + comments + shares) / f) * 100;
        return Math.min(rawER, 100); // Cap at 100%
    };

    // 1. Check Nested Platforms
    if (profileData.tiktok) {
        const t = profileData.tiktok;
        const f = parseNum(t.followers);
        const e = computeER(t);
        if (f > 0) platforms.push('tiktok');
        if (f > bestFollowers) bestFollowers = f;
        if (e > bestEngagement) bestEngagement = e;
        if (t.niche) {
            if (typeof t.niche === 'string') niches.push(t.niche);
            else if (Array.isArray(t.niche)) niches.push(...t.niche);
            else if (typeof t.niche === 'object') niches.push(...Object.values(t.niche).filter(Boolean) as string[]);
        }
    }

    if (profileData.instagram) {
        const ig = profileData.instagram;
        const f = parseNum(ig.followers);
        const e = computeER(ig);
        if (f > 0) platforms.push('instagram');
        if (f > bestFollowers) bestFollowers = f;
        if (e > bestEngagement) bestEngagement = e;
        if (ig.niche) {
            if (typeof ig.niche === 'string') niches.push(ig.niche);
            else if (Array.isArray(ig.niche)) niches.push(...ig.niche);
            else if (typeof ig.niche === 'object') niches.push(...Object.values(ig.niche).filter(Boolean) as string[]);
        }
    }

    // 2. Flat field fallback (legacy or business profiles)
    if (bestFollowers === 0 && profileData.followers) bestFollowers = parseNum(profileData.followers);
    if (bestEngagement === 0 && profileData.engagementRate) {
        bestEngagement = Math.min(parseNum(profileData.engagementRate), 100); // Cap legacy values too
    }
    
    // Niche fallbacks
    if (niches.length === 0) {
        if (profileData.category) niches.push(profileData.category);
        if (profileData.industry) niches.push(profileData.industry);
        if (Array.isArray(profileData.targetAudienceTags)) niches.push(...profileData.targetAudienceTags);
    }

    return {
        followers: bestFollowers,
        engagementRate: bestEngagement,
        niche: [...new Set(niches.filter(Boolean))][0] || 'General',
        allNiches: [...new Set(niches.filter(Boolean))],
        platforms,
    };
};

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

    // 1. Load the opportunity with populated business owner
    const opp = await Opportunity.findById(opportunityId).populate('businessOwner', 'firstName lastName profileData');
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

        // Extract REAL metrics from nested profileData (tiktok/instagram)
        const advProfile = adv.profileData || {};
        const metrics = extractMetrics(advProfile);
        const followers = metrics.followers;
        const engagementRate = metrics.engagementRate;
        const niche = metrics.niche;
        const cost = app.proposedRate?.amount || 0;
        const currency = app.proposedRate?.currency || 'ETB';

        logger.info(`[MarketingAnalysis] Advertiser ${adv.username}: followers=${followers}, engagement=${engagementRate}%, niche=${niche}, cost=${cost}`);

        // Dynamic rates based on advertiser quality (heuristic fallback)
        const effectiveReachFactor = 0.30 + (followers < 50000 ? 0.05 : 0); // Smaller creators get slight reach boost
        const effectiveConvRate = conversionRate !== 0.02 
            ? conversionRate 
            : Math.min(0.05, Math.max(0.005, (engagementRate / 100) * 0.4));

        // Profitability calculations
        const reach = followers * effectiveReachFactor;
        const engagement = reach * (engagementRate / 100);
        const conversions = engagement * effectiveConvRate;
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
You are a senior marketing strategist. Analyze these advertiser applicants for a specific campaign and provide high-value business insights.

Campaign Details:
- Title: ${opp.title}
- Description: ${opp.description || 'No description provided'}
- Category: ${opp.category}
- Budget: ${opp.budget?.amount || 'N/A'} ${opp.budget?.currency || 'ETB'}
- Requirements: ${opp.requirements?.minFollowers || 0}+ followers, Niches: ${opp.requirements?.preferredNiches?.join(', ') || 'Any'}
- Business Owner Industry: ${(opp.businessOwner as any)?.profileData?.industry || 'General'}

Applicant List (Top 10):
${forAnalysis.map((r, i) => `${i + 1}. ID: ${r.advertiserId}, Name: ${r.advertiserName}, Followers: ${r.followers.toLocaleString()}, Engagement: ${r.engagementRate}%, ROI: ${r.profitPercentage}%, Niche: ${r.niche}`).join('\n')}

Analysis Tasks:
1. Evaluate the "Brand Fit" between the campaign category (${opp.category}) and each advertiser's niche.
2. Consider the budget constraints and ROI.
3. Identify the "Safe Choice" vs the "High Growth" choice.
4. Provide a summarized pool quality assessment.

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

    // 2. Extract REAL metrics from nested profileData (tiktok/instagram)
    const advMetrics = extractMetrics(advProfile);
    const followers = advMetrics.followers;
    const engagementRate = advMetrics.engagementRate;
    const avgProductPrice = ownerProfile.monthlyBudget ? Math.round(ownerProfile.monthlyBudget / 50) : 50;

    // 3. Generate AI Match Insight & Metrics with Smart Fallbacks
    let aiInsight = "Based on your niche, this creator offers strong growth potential.";
    
    // Heuristic Fallback: Use engagement rate as a proxy for conversion quality
    // Typically conversion rate is 1/10th to 1/20th of engagement rate
    let dynamicConvRate = Math.min(0.05, Math.max(0.005, (engagementRate / 100) * 0.4)); 
    
    // Reach factor depends on platforms and followers (smaller creators often have higher reach relative to size)
    let dynamicReachFactor = followers > 100000 ? 0.25 : 0.35;

    try {
        const model = getGeminiModel();
        if (model) {
            const prompt = `
                Analyze the potential brand partnership match between Business Owner "${owner.firstName}" and Advertiser "${adv.firstName}".
                Owner Details:
                - Industry: ${ownerProfile.industry || ownerProfile.category || 'General'}
                - Target Audience: ${ownerProfile.targetAudienceTags?.join(', ') || 'N/A'}
                
                Advertiser Details:
                - Niche: ${advMetrics.allNiches?.join(', ') || advMetrics.niche}
                - Followers: ${followers.toLocaleString()}
                - Engagement: ${engagementRate}%
                - Platforms: ${advMetrics.platforms.join(', ')}
                
                Based on this synergy, suggest:
                1. A realistic "Conversion Rate" (as a decimal, e.g., 0.015 for 1.5%). High fit = higher rate.
                2. A "Reach Factor" (how much of their audience will actually see the post, e.g., 0.25 for 25%).
                3. A 2-sentence "Match Insight" about the synergy.

                Return your response in strict JSON format:
                {
                  "conversionRate": 0.025,
                  "reachFactor": 0.35,
                  "insight": "..."
                }
            `;
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });
            const parsed = JSON.parse(result.response.text());
            aiInsight = parsed.insight || aiInsight;
            dynamicConvRate = parsed.conversionRate || dynamicConvRate;
            dynamicReachFactor = parsed.reachFactor || dynamicReachFactor;
        }
    } catch (err) {
        logger.warn(`[MarketingAnalysis] Predictive AI insight failed: ${err}`);
    }

    // 4. Generate 6-month projection data using dynamic metrics
    const months = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
    const projections = months.map((month, i) => {
        const growthFactor = 1 + (i * 0.15); // Assume 15% monthly growth
        const reach = followers * dynamicReachFactor * growthFactor;
        const conversions = reach * (engagementRate / 100) * dynamicConvRate;
        const revenue = conversions * avgProductPrice;

        return {
            month,
            reach: Math.round(reach),
            conversions: Math.round(conversions),
            revenue: Math.round(revenue),
        };
    });

    return {
        advertiserName: `${adv.firstName} ${adv.lastName}`.trim(),
        aiInsight,
        projections,
        metrics: {
            reach: Math.round(followers * dynamicReachFactor),
            conversionRate: `${(dynamicConvRate * 100).toFixed(1)}%`,
            reachFactor: `${(dynamicReachFactor * 100).toFixed(0)}%`,
            avgProductPrice,
        }
    };
};
