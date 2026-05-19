import User from '../../database/models/User';
import Opportunity from '../../database/models/Opportunity';
import Application from '../../database/models/Application';
import BusinessOwner from '../../database/models/businessOwner';
import AdvertiserProfile from '../../database/models/AdvertiserProfile';
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
    primaryPlatform: string;
    contentStyle: string;
} => {
    if (!profileData) return { followers: 0, engagementRate: 0, niche: 'General', platforms: [] as string[], allNiches: [], totalLikes: 0, avgViews: 0, avgComments: 0, avgShares: 0, isMultiPlatform: false, audienceInfo: {}, primaryPlatform: 'N/A', contentStyle: 'N/A' };

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
            if (t.audienceInterests) audienceInfo.interests = t.audienceInterests;
            if (t.audienceIncomeLevel) audienceInfo.incomeLevel = t.audienceIncomeLevel;
            if (t.primaryAudienceLanguage) audienceInfo.language = t.primaryAudienceLanguage;
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
            if (ig.audienceInterests) audienceInfo.interests = ig.audienceInterests;
            if (ig.audienceIncomeLevel) audienceInfo.incomeLevel = ig.audienceIncomeLevel;
            if (ig.primaryAudienceLanguage) audienceInfo.language = ig.primaryAudienceLanguage;
        }
    }

    if (profileData.campaignPrice) audienceInfo.campaignPrice = parseNum(profileData.campaignPrice);

    // Default audience info if none found
    if (!audienceInfo.topCountry) audienceInfo.topCountry = 'Global';
    if (!audienceInfo.ageRange) audienceInfo.ageRange = 'Mixed';
    if (!audienceInfo.gender) audienceInfo.gender = 'Mixed';

    const isMultiPlatform = platforms.length > 1;

    // Determine primary platform and content style
    let primaryPlatform = 'N/A';
    let contentStyle = 'N/A';
    let maxPlatFollowers = -1;

    if (profileData.tiktok) {
        const f = parseNum(profileData.tiktok.followers);
        if (f > maxPlatFollowers) {
            maxPlatFollowers = f;
            primaryPlatform = 'TikTok';
            contentStyle = profileData.tiktok.contentStyle || 'N/A';
        }
    }
    if (profileData.instagram) {
        const f = parseNum(profileData.instagram.followers);
        if (f > maxPlatFollowers) {
            maxPlatFollowers = f;
            primaryPlatform = 'Instagram';
            contentStyle = profileData.instagram.contentStyle || 'N/A';
        }
    }

    if (typeof contentStyle === 'object' && contentStyle !== null) {
        contentStyle = Object.values(contentStyle).filter(Boolean).join(', ') || 'N/A';
    }

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
        audienceInfo,
        primaryPlatform,
        contentStyle
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
    primaryPlatform: string;
    contentStyle: string;
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
        businessOutcome: any;
        overallAnalysis: any;
        topRecommendations: any;
        risks: string[];
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
        return {
            summary: 'No applicants have applied to this campaign yet. Once creators apply, we will analyze their potential ROI for you.',
            totalApplicants: 0,
            bestChoice: null,
            analysis: [],
            aiInsights: null,
            opportunityTitle: opp.title,
            opportunityCategory: opp.category,
            opportunityBudget: opp.budget?.amount || 0,
            generatedAt: new Date(),
        };
    }

    // Determine average product price
    const productPrice = avgProductPrice ?? (opp.budget?.amount ? Math.round(opp.budget.amount / 10) : 50);

    // Get profiles for owner and applicants
    const oppOwnerDoc = opp.businessOwner ? await BusinessOwner.findOne({ userId: (opp.businessOwner as any)._id }) : null;
    if (oppOwnerDoc) {
        (opp.businessOwner as any).profileData = oppOwnerDoc.profileData || {};
    }

    const advertiserIds = applications.map(a => (a.advertiser as any)?._id).filter(Boolean);
    const advProfilesDocs = await AdvertiserProfile.find({ userId: { $in: advertiserIds } });
    const advProfileMap = new Map(advProfilesDocs.map(p => [p.userId.toString(), p]));

    // 3. Calculate profitability for each applicant
    const results: ApplicantAnalysis[] = [];

    for (const app of applications) {
        const adv = app.advertiser as any;
        if (!adv) continue;

        // Extract REAL metrics from nested profileData (tiktok/instagram)
        const advDoc = advProfileMap.get(adv._id.toString());
        const advProfile = advDoc?.profileData || {};
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
            primaryPlatform: metrics.primaryPlatform,
            contentStyle: metrics.contentStyle,
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
You are a senior influencer marketing strategist and ROI analyst.

Your task is to analyze advertiser applicants for a marketing campaign by comparing BOTH:

1. Business Owner Campaign Data
2. Advertiser Social Media Data

Your goal is to determine:
- Which advertiser is the best fit
- Which advertiser is most profitable
- Whether the business owner is likely to gain positive ROI
- Whether audience alignment exists
- Whether the campaign budget is efficient

IMPORTANT RULES:
- DO NOT generate fake metrics.
- DO NOT invent scores.
- Use ONLY provided calculated backend metrics.
- Keep analysis realistic and business-focused.
- Base conclusions on BOTH business owner data and advertiser data.

==================================================
BUSINESS OWNER DATA
==================================================

Business Industry:
${(opp.businessOwner)?.profileData?.industry || "General"}

Business Niche:
${(opp.businessOwner)?.profileData?.niche || "N/A"}

Target Audience:
${(opp.businessOwner)?.profileData?.targetAudience || "General"}

Preferred Platform:
${(opp.businessOwner)?.profileData?.preferredPlatform || "Any"}

Business Location:
${(opp.businessOwner)?.profileData?.location || "N/A"}

Campaign Goal:
${(opp as any).goal || "Brand Awareness"}

Campaign Category:
${opp.category}

Campaign Budget:
${opp.budget?.amount || "N/A"} ${opp.budget?.currency || "ETB"}

Preferred Niches:
${opp.requirements?.preferredNiches?.join(", ") || "Any"}

Minimum Followers:
${opp.requirements?.minFollowers || 0}

==================================================
ADVERTISER ANALYSIS DATA
==================================================

${forAnalysis.map((r, i) => `

==================================================
Applicant ${i + 1}
==================================================

Advertiser ID:
${r.advertiserId}

Advertiser Name:
${r.advertiserName}

Platforms:
${r.platforms.join(", ")}

Primary Platform:
${r.primaryPlatform}

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

Audience Country:
${r.audienceCountry || "N/A"}

Audience Age Range:
${r.audienceAgeRange || "N/A"}

Audience Gender:
${r.audienceGender || "N/A"}

Advertiser Niche:
${r.niche}

Content Style:
${r.contentStyle || "N/A"}

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
${r.aiMatchScore}

Profitability:
${r.profitable ? "Profitable" : "Not Profitable"}

`).join("\n")}

==================================================
ANALYSIS OBJECTIVES
==================================================

Analyze advertiser suitability by comparing:

- Business niche vs advertiser niche
- Campaign budget vs advertiser pricing
- Target audience vs advertiser audience demographics
- Business preferred platform vs advertiser strongest platform
- Location compatibility
- Engagement quality
- ROI potential
- Audience reach quality
- Growth potential

==================================================
TASKS
==================================================

1. Identify which advertiser provides the BEST OVERALL VALUE.

2. Determine whether the business owner is likely to make profit or loss with each advertiser.

3. Compare ROI potential between advertisers.

4. Evaluate audience alignment and campaign relevance.

5. Identify:
   - Safest investment
   - Highest growth potential
   - Best audience targeting
   - Best budget efficiency
   - Highest long-term marketing value
   - Most risky collaboration

6. Explain WHY certain advertisers fit the campaign better.

7. Use the provided "Calculated Match Score" exactly as given.
DO NOT modify or regenerate scores.

==================================================
RETURN FORMAT
==================================================

Return ONLY valid JSON.

{
  "summary": "Professional business summary of the campaign analysis and advertiser pool.",

  "businessOutcomePrediction": {
    "expectedCampaignOutcome": "Profitable / Moderate / Risky",
    "estimatedBusinessImpact": "Expected business impact",
    "budgetEfficiency": "Analysis of budget usage",
    "audienceMatchQuality": "Quality of audience targeting",
    "overallProfitability": "Overall profitability insight"
  },

  "overallCampaignAnalysis": {
    "poolQuality": "Overall applicant quality",
    "competitionLevel": "Low / Medium / High",
    "marketFit": "Market and audience fit analysis",
    "strategicRecommendation": "Strategic business recommendation"
  },

  "topRecommendations": {

    "bestOverallChoice": {
      "advertiserId": "",
      "reason": ""
    },

    "safestInvestment": {
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
      "audienceAlignment": "",
      "platformCompatibility": "",
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
            insights: {
                businessOutcome: parsed.businessOutcomePrediction || null,
                overallAnalysis: parsed.overallCampaignAnalysis || null,
                topRecommendations: parsed.topRecommendations || null,
                risks: parsed.riskAnalysis || []
            },
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

    const ownerProfileDoc = await BusinessOwner.findOne({ userId: businessOwnerId });
    const advProfileDoc = await AdvertiserProfile.findOne({ userId: advertiserId });

    const advProfile = advProfileDoc?.profileData || {};
    const ownerProfile = ownerProfileDoc?.profileData || {};

    // 2. Extract REAL metrics from nested profileData (tiktok/instagram)
    const metrics = extractMetrics(advProfile);
    const followers = metrics.followers;
    const engagementRate = metrics.engagementRate;
    const productPrice = ownerProfile.monthlyBudget ? Math.round(ownerProfile.monthlyBudget / 50) : 50;
    
    // Default estimated cost for prediction (can be adjusted based on follower tier)
    const estimatedCost = followers > 100000 ? 2500 : (followers > 10000 ? 1000 : 500);

    // 3. Generate AI Match Insight & Metrics with Smart Fallbacks
    let aiInsight = "Based on your niche, this creator offers strong growth potential.";
    let dynamicConvRate = Math.min(0.05, Math.max(0.005, (engagementRate / 100) * 0.4));
    let dynamicReachFactor = followers > 100000 ? 0.25 : 0.35;

    try {
        const model = getGeminiModel();
        if (model) {
            const prompt = `
                Analyze the brand synergy between Business Owner "${owner.firstName}" and Advertiser "${adv.firstName}".
                Owner Industry: ${ownerProfile.industry || ownerProfile.category || 'General'}
                Advertiser Niche: ${metrics.allNiches?.join(', ') || metrics.niche}
                Followers: ${followers.toLocaleString()}
                Engagement: ${engagementRate}%
                Platforms: ${metrics.platforms.join(', ')}
                Primary Platform: ${metrics.primaryPlatform}
                Content Style: ${metrics.contentStyle}
                Audience: ${metrics.audienceInfo?.topCountry || 'Global'}, ${metrics.audienceInfo?.ageRange || 'Mixed'}

                Return JSON:
                {
                  "conversionRate": 0.02,
                  "reachFactor": 0.3,
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
        logger.warn(`[MarketingAnalysis] Predictive AI failed: ${err}`);
    }

    // 4. Projections & ROI
    const reach = Math.round(followers * dynamicReachFactor);
    const conversions = reach * (engagementRate / 100) * dynamicConvRate;
    const revenue = conversions * productPrice;
    const profit = revenue - estimatedCost;
    const roi = (profit / estimatedCost) * 100;

    const projections = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'].map((month, i) => {
        const growth = 1 + (i * 0.12);
        const r = reach * growth;
        const c = r * (engagementRate / 100) * dynamicConvRate;
        const rev = c * productPrice;
        return {
            month,
            reach: Math.round(r),
            conversions: Math.round(c),
            revenue: Math.round(rev),
            profit: Math.round(rev - estimatedCost)
        };
    });

    return {
        summary: aiInsight,
        metrics: {
            followers,
            reach,
            engagementRate,
            conversionRate: Number((dynamicConvRate * 100).toFixed(1)),
            estimatedConversions: Math.round(conversions),
            revenue: Number(revenue.toFixed(2)),
            avgProductPrice: productPrice,
            cost: estimatedCost,
            avgViews: metrics.avgViews,
            totalLikes: metrics.totalLikes,
            avgComments: metrics.avgComments,
            avgShares: metrics.avgShares,
        },
        projections,
        aiInsight,
        niche: metrics.niche,
        platforms: metrics.platforms,
        primaryPlatform: metrics.primaryPlatform || 'N/A',
        contentStyle: metrics.contentStyle || 'N/A',
        profitable: profit > 0,
        profit: Number(profit.toFixed(2)),
        roi: Number(roi.toFixed(2)),
        audienceInfo: metrics.audienceInfo || { topCountry: 'Global', ageRange: 'Mixed', gender: 'Mixed' }
    };
};
