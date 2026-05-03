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
}

export interface MarketingAnalysisResult {
    summary: string;
    totalApplicants: number;
    bestChoice: ApplicantAnalysis | null;
    analysis: ApplicantAnalysis[];
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
    try {
        summary = await generateAISummary(opp, results);
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
        opportunityTitle: opp.title,
        opportunityCategory: opp.category,
        opportunityBudget: opp.budget?.amount || 0,
        generatedAt: new Date(),
    };
};

// ─── Gemini AI Summary ──────────────────────────────────────────────────────

async function generateAISummary(opp: any, results: ApplicantAnalysis[]): Promise<string> {
    const model = getGeminiModel();
    if (!model) {
        return generateFallbackSummary(results);
    }

    const top3 = results.slice(0, 3);
    const profitableCount = results.filter(r => r.profitable).length;

    const prompt = `
You are a marketing analyst for an advertising collaboration platform. 
Analyze these advertiser applicants for a campaign and provide a clear, concise business recommendation.

Campaign Details:
- Title: ${opp.title}
- Category: ${opp.category}
- Budget: ${opp.budget?.amount || 'N/A'} ${opp.budget?.currency || 'ETB'}

Applicant Summary:
- Total applicants: ${results.length}
- Profitable applicants: ${profitableCount} out of ${results.length}

Top 3 Applicants by Profitability:
${top3.map((r, i) => `${i + 1}. ${r.advertiserName} — ${r.followers.toLocaleString()} followers, ${r.engagementRate}% engagement, Cost: ${r.cost} ${r.currency}, Profit: ${r.profit.toFixed(2)} ${r.currency} (${r.profitPercentage.toFixed(1)}% ROI), Niche: ${r.niche}`).join('\n')}

Please provide:
1. A brief overview of the applicant pool quality
2. Which advertiser(s) offer the best value and why
3. Which advertiser should be selected and your reasoning
4. Any risks or concerns

Keep the response under 200 words. Be direct and business-focused.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text;
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
