/**
 * Business Owner Analytics Pipeline
 *
 * End-to-end pipeline for generating AI-powered analytics
 * for business owner profiles. Pulls campaign history from
 * the EXISTING Opportunity and Application models.
 *
 * Flow:
 *   1. Load user + business profile from MongoDB
 *   2. Query campaign history from Opportunity + Application collections
 *   3. Calculate business KPI scores (CPU)
 *   4. Check cache → build prompt → call Gemini
 *   5. Merge CPU scores + AI insights → return
 */

import User from '../../../database/models/User';
import BusinessOwner from '../../../database/models/businessOwner';
import Opportunity from '../../../database/models/Opportunity';
import Application from '../../../database/models/Application';
import Collaboration from '../../../database/models/Collaboration';
import logger from '../../../utils/logger';
import { flattenProfileData } from '../ai.utils';
import { clamp } from '../ai.utils';
import { buildBusinessAnalyticsPrompt } from '../prompts/business.prompts';
import { generateJSON } from '../gemini.service';
import { getCached, setCached } from '../ai.cache';
import { BusinessAnalyticsResult, BusinessScores } from '../ai.types';

// ─── Default AI fallback ─────────────────────────────────────────────────────

const DEFAULT_AI_INSIGHTS = {
    summary: 'AI insights are currently unavailable. Your business scores have been calculated from your campaign data.',
    budgetRecommendations: [
        'Review your campaign budget allocation',
        'Consider testing micro-influencers for cost efficiency',
        'Track ROI per campaign to optimize spend',
    ],
    idealCreatorProfile: 'A creator in your industry niche with strong engagement rates and an audience matching your target demographics.',
    risks: [
        'Insufficient campaign data to identify detailed risks',
        'Continue running campaigns to build analytical history',
    ],
    quarterOutlook: 'Continue building campaign history for more accurate forecasting.',
};

// ─── Business KPI Scoring (CPU) ──────────────────────────────────────────────

/**
 * Calculate business performance scores from campaign history.
 * Uses existing Opportunity and Application collections.
 */
const calculateBusinessScores = async (
    userId: string,
    profileData: Record<string, any>
): Promise<{ scores: BusinessScores; campaignMetrics: any }> => {
    // Query campaign data from existing collections
    const opportunities = await Opportunity.find({ businessOwner: userId }).lean();
    const totalCampaigns = opportunities.length;

    const oppIds = opportunities.map((o) => o._id);
    const applications = await Application.find({ opportunity: { $in: oppIds } }).lean();
    const totalApplications = applications.length;

    // Count completed collaborations
    let completedCollabs = 0;
    try {
        completedCollabs = await Collaboration.countDocuments({
            businessOwner: userId,
            status: 'completed',
        });
    } catch {
        // Collaboration model might not have this query — fallback to 0
        completedCollabs = opportunities.filter((o) => o.status === 'completed').length;
    }

    const avgApplicants = totalCampaigns > 0 ? totalApplications / totalCampaigns : 0;

    // Calculate total spend from opportunity budgets
    const totalSpend = opportunities.reduce((sum, opp) => sum + (opp.budget?.amount || 0), 0);

    // ── Campaign Performance Score (0-100) ──
    const completionRate = totalCampaigns > 0 ? (completedCollabs / totalCampaigns) * 100 : 0;
    const applicantAttraction = clamp(avgApplicants * 10, 0, 40); // up to 4 avg applicants = max
    const volumeBonus = clamp(totalCampaigns * 5, 0, 20); // up to 4 campaigns = max
    const campaignPerformance = Math.round(
        clamp(completionRate * 0.4 + applicantAttraction + volumeBonus, 0, 100)
    );

    // ── Budget Efficiency Score (0-100) ──
    const budget = profileData.monthlyBudget || profileData.adSpend || 0;
    const avgCostPerCampaign = totalCampaigns > 0 ? totalSpend / totalCampaigns : 0;
    let budgetEfficiency = 50; // default neutral
    if (budget > 0 && avgCostPerCampaign > 0) {
        // Lower cost per campaign relative to budget = more efficient
        const ratio = avgCostPerCampaign / budget;
        budgetEfficiency = Math.round(clamp((1 - ratio) * 100, 10, 95));
    }

    // ── Market Position Score (0-100) ──
    // Based on profile completeness and campaign activity
    let marketPosition = 30; // base
    if (profileData.industry) marketPosition += 15;
    if (profileData.targetAudience) marketPosition += 10;
    if (profileData.selectedPlatforms?.length > 0) marketPosition += 10;
    if (totalCampaigns >= 3) marketPosition += 15;
    if (completedCollabs >= 2) marketPosition += 20;
    marketPosition = clamp(marketPosition, 0, 100);

    // ── Overall Health ──
    const overallHealth = Math.round(
        campaignPerformance * 0.40 + budgetEfficiency * 0.30 + marketPosition * 0.30
    );

    return {
        scores: {
            campaignPerformance,
            budgetEfficiency,
            marketPosition,
            overallHealth: clamp(overallHealth, 0, 100),
        },
        campaignMetrics: {
            totalCampaigns,
            completedCollabs,
            avgApplicantsPerCampaign: avgApplicants,
            totalSpend,
        },
    };
};

// ─── Main Pipeline ───────────────────────────────────────────────────────────

/**
 * Generate complete AI-powered analytics for a business owner.
 *
 * @param userId - MongoDB ObjectId of the business owner user
 * @returns Full analytics result with CPU scores + AI commentary
 */
export const runBusinessAnalytics = async (
    userId: string
): Promise<BusinessAnalyticsResult> => {
    // 1. Load user and profile
    const user = await User.findById(userId).lean();
    if (!user) throw new Error('User not found');
    if (user.role !== 'business_owner') throw new Error('User is not a business owner');

    const profileDoc = await BusinessOwner.findOne({ userId }).lean();
    if (!profileDoc) throw new Error('Business owner profile not found');

    const profileData = flattenProfileData(profileDoc);

    logger.info(`[BusinessPipeline] Processing user ${userId}: industry=${profileDoc.industry || 'N/A'}`);

    // 2. Calculate CPU scores using existing Opportunity/Application data
    const { scores, campaignMetrics } = await calculateBusinessScores(userId, profileData);

    logger.info(
        `[BusinessPipeline] Scores for ${userId}: ` +
        `campaign=${scores.campaignPerformance}, budget=${scores.budgetEfficiency}, ` +
        `market=${scores.marketPosition}, overall=${scores.overallHealth}`
    );

    // 3. Check cache
    const cacheInput = { scores, campaignMetrics };
    const cached = getCached<BusinessAnalyticsResult>('business-analytics', userId, cacheInput);

    if (cached) {
        return { ...cached, cached: true };
    }

    // 4. Build prompt and call Gemini
    const prompt = buildBusinessAnalyticsPrompt(profileDoc, user, scores, campaignMetrics);

    const geminiResult = await generateJSON(prompt, DEFAULT_AI_INSIGHTS, {
        temperature: 0.6,
        timeoutMs: 12_000,
    });

    // 5. Compile final result
    const result: BusinessAnalyticsResult = {
        scores,
        metrics: campaignMetrics,
        aiInsights: geminiResult.data,
        generatedAt: new Date(),
        cached: false,
    };

    // 6. Store in cache
    setCached('business-analytics', userId, cacheInput, result, geminiResult.latencyMs);

    logger.info(
        `[BusinessPipeline] Completed for ${userId} in ${geminiResult.latencyMs}ms`
    );

    return result;
};
