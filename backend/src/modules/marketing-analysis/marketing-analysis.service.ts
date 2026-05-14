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
export const extractMetrics = (profileData: any): {
    followers: number;
    engagementRate: number;
    totalLikes: number;
    avgViews: number;
    avgComments: number;
    avgShares: number;
    niche: string;
    allNiches: string[];
    platforms: string[];
    isMultiPlatform: boolean;
    audienceInfo: any;
} => {
    if (!profileData) return { followers: 0, engagementRate: 0, niche: 'General', platforms: [] as string[], allNiches: [], totalLikes: 0, avgViews: 0, avgComments: 0, avgShares: 0, isMultiPlatform: false, audienceInfo: {} };

    // Helper: compute ER from raw metrics if engagementRate is not stored
    const computeER = (platform: any): number => {
        const storedER = parseNum(platform.engagementRate);
        if (storedER > 0 && storedER <= 100) return storedER;

        const f = parseNum(platform.followers);
        const likes = parseNum(platform.totalLikes);
        const comments = parseNum(platform.avgComments);
        const shares = parseNum(platform.avgShares);
        const views = parseNum(platform.avgViews);

        if (f <= 0) return 0;

        if (likes > 0 && views > 0 && likes > views) {
            logger.warn(`[extractMetrics] Invalid metrics: likes (${likes}) > views (${views}). Skipping ER computation.`);
            return 0;
        }

        const rawER = ((likes + comments + shares) / f) * 100;
        return Math.min(rawER, 100); // Cap at 100%
    };

    let totalFollowers = 0;
    let totalLikes = 0;
    let totalAvgViews = 0;
    let totalAvgComments = 0;
    let totalAvgShares = 0;
    let maxEngagement = 0;
    const platforms: string[] = [];
    const niches: string[] = [];
    const audienceInfo: any = {};

    // 1. Check TikTok
    if (profileData.tiktok) {
        const t = profileData.tiktok;
        const f = parseNum(t.followers);
        if (t.username || f > 0) {
            platforms.push('tiktok');
            totalFollowers += f;
            totalLikes += parseNum(t.totalLikes);
            totalAvgViews += parseNum(t.avgViews);
            totalAvgComments += parseNum(t.avgComments);
            totalAvgShares += parseNum(t.avgShares);
            
            const e = computeER(t);
            if (e > maxEngagement) maxEngagement = e;

            if (t.niche) {
                if (typeof t.niche === 'string') niches.push(t.niche);
                else if (Array.isArray(t.niche)) niches.push(...t.niche);
                else if (typeof t.niche === 'object') niches.push(...Object.values(t.niche).filter(Boolean) as string[]);
            }
            if (t.audienceTopCountry) audienceInfo.topCountry = t.audienceTopCountry;
            if (t.audienceAgeRange) audienceInfo.ageRange = t.audienceAgeRange;
            if (t.audienceGender) audienceInfo.gender = t.audienceGender;
        }
    }

    // 2. Check Instagram
    if (profileData.instagram) {
        const ig = profileData.instagram;
        const f = parseNum(ig.followers);
        if (ig.username || f > 0) {
            platforms.push('instagram');
            totalFollowers += f;
            totalLikes += parseNum(ig.totalLikes);
            totalAvgViews += parseNum(ig.avgViews);
            totalAvgComments += parseNum(ig.avgComments);
            totalAvgShares += parseNum(ig.avgShares);
            
            const e = computeER(ig);
            if (e > maxEngagement) maxEngagement = e;

            if (ig.niche) {
                if (typeof ig.niche === 'string') niches.push(ig.niche);
                else if (Array.isArray(ig.niche)) niches.push(...ig.niche);
                else if (typeof ig.niche === 'object') niches.push(...Object.values(ig.niche).filter(Boolean) as string[]);
            }
            if (ig.audienceTopCountry) audienceInfo.topCountry = ig.audienceTopCountry;
            if (ig.audienceAgeRange) audienceInfo.ageRange = ig.audienceAgeRange;
            if (ig.audienceGender) audienceInfo.gender = ig.audienceGender;
        }
    }

    const isMultiPlatform = platforms.length > 1;

    // 3. Fallbacks for legacy/flat data
    if (totalFollowers === 0 && profileData.followers) totalFollowers = parseNum(profileData.followers);
    if (maxEngagement === 0 && profileData.engagementRate) {
        maxEngagement = Math.min(parseNum(profileData.engagementRate), 100);
    }

    if (niches.length === 0) {
        if (profileData.category) niches.push(profileData.category);
        if (profileData.industry) niches.push(profileData.industry);
        if (Array.isArray(profileData.targetAudienceTags)) niches.push(...profileData.targetAudienceTags);
    }

    return {
        followers: totalFollowers,
        engagementRate: maxEngagement,
        totalLikes,
        avgViews: totalAvgViews,
        avgComments: totalAvgComments,
        avgShares: totalAvgShares,
        niche: [...new Set(niches.filter(Boolean))][0] || 'General',
        allNiches: [...new Set(niches.filter(Boolean))],
        platforms,
        isMultiPlatform,
        audienceInfo
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
    // Advanced Metrics
    platforms: string[];
    avgViews: number;
    totalLikes: number;
    avgComments: number;
    avgShares: number;
    audienceCountry?: string;
    audienceAgeRange?: string;
    audienceGender?: string;
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

        // Apply Multi-platform bonus to ROI (e.g., 10% boost in estimated value)
        const finalRevenue = metrics.isMultiPlatform ? revenue * 1.1 : revenue;
        const profit = finalRevenue - cost;
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
            platforms: metrics.platforms,
            avgViews: metrics.avgViews,
            totalLikes: metrics.totalLikes,
            avgComments: metrics.avgComments || 0,
            avgShares: metrics.avgShares || 0,
            audienceCountry: metrics.audienceInfo?.topCountry,
            audienceAgeRange: metrics.audienceInfo?.ageRange,
            audienceGender: metrics.audienceInfo?.gender,
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
You are a senior influencer marketing strategist and campaign analyst.

Your task is to analyze advertiser applicants for a campaign using PRE-CALCULATED business metrics provided by the backend system.

IMPORTANT RULES:
- DO NOT generate or invent new scores.
- Use ONLY the provided calculated metrics.
- Your role is to explain and analyze the data professionally.
- Keep the analysis realistic and business-oriented.

==================================================
CAMPAIGN DETAILS
==================================================

Title:
${opp.title}

Description:
${opp.description || "No description"}

Category:
${opp.category}

Campaign Budget:
${opp.budget?.amount || "N/A"} ${opp.budget?.currency || "ETB"}

Required Niches:
${opp.requirements?.preferredNiches?.join(", ") || "Any"}

Minimum Followers:
${opp.requirements?.minFollowers || 0}

Business Industry:
${(opp.businessOwner)?.profileData?.industry || "General"}

==================================================
APPLICANT ANALYSIS DATA
==================================================

${forAnalysis.map((r, i) => `

Applicant ${i + 1}

Advertiser ID:
${r.advertiserId}

Name:
${r.advertiserName}

Platforms:
${r.platforms.join(', ')}

Followers:
${r.followers.toLocaleString()}

Average Views:
${r.avgViews.toLocaleString()}

Average Comments:
${r.avgComments.toLocaleString()}

Average Shares:
${r.avgShares.toLocaleString()}

Total Likes:
${r.totalLikes.toLocaleString()}

Engagement Rate:
${r.engagementRate}%

Audience:
${r.audienceCountry || 'N/A'} | ${r.audienceAgeRange || 'N/A'} | ${r.audienceGender || 'N/A'}

Niche:
${r.niche}

Campaign Price:
${r.cost} ${r.currency}

Estimated Reach:
${r.estimatedReach}

Estimated Engagement:
${r.estimatedEngagement}

Estimated Revenue:
${r.estimatedRevenue}

Estimated Profit:
${r.profit}

ROI Percentage:
${r.profitPercentage}%

Calculated Match Score:
${r.aiMatchScore || 'N/A'}

Profitability Status:
${r.profitable ? "Profitable" : "Not Profitable"}

`).join("\n")}

==================================================
ANALYSIS TASKS
==================================================

1. Evaluate brand compatibility between the advertiser niche and campaign category.

2. Analyze profitability and ROI realistically.

3. Compare audience quality, engagement quality, and campaign value.

4. Identify:
   - Safest advertiser choice
   - Highest growth potential
   - Best ROI performer
   - Most risky applicant

5. Explain WHY certain advertisers perform better than others.

6. Use the provided "Calculated Match Score" exactly as given.
DO NOT modify or regenerate scores.

7. Give realistic business insight based on:
   - followers
   - engagement
   - audience quality
   - content niche
   - pricing
   - profitability

==================================================
RETURN FORMAT
==================================================

Return ONLY valid JSON.

{
  "summary": "Professional business summary of the advertiser pool.",

  "overallCampaignAnalysis": {
    "poolQuality": "Overall quality assessment",
    "competitionLevel": "Low/Medium/High",
    "marketFit": "Analysis of audience and campaign alignment",
    "budgetEfficiency": "Analysis of pricing vs expected return",
    "strategicRecommendation": "Best overall strategic direction"
  },

  "topRecommendations": {
    "safeChoice": {
      "advertiserId": "",
      "reason": ""
    },

    "highestGrowthPotential": {
      "advertiserId": "",
      "reason": ""
    },

    "bestROI": {
      "advertiserId": "",
      "reason": ""
    }
  },

  "riskAnalysis": [
    "Risk 1",
    "Risk 2"
  ],

  "applicantInsights": [
    {
      "advertiserId": "",
      "matchScore": 0,
      "roi": 0,
      "profitability": "",
      "insight": ""
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
                - Avg Views: ${advMetrics.avgViews.toLocaleString()}
                - Total Likes: ${advMetrics.totalLikes.toLocaleString()}
                - Platforms: ${advMetrics.platforms.join(', ')}
                - Multi-platform Presence: ${advMetrics.isMultiPlatform ? 'YES (Give advantage)' : 'NO'}
                - Audience: ${advMetrics.audienceInfo?.topCountry || 'Global'}, ${advMetrics.audienceInfo?.ageRange || 'Mixed'}
                
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
