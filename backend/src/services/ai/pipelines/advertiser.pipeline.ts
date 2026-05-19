import User from '../../../database/models/User';
import AdvertiserProfile from '../../../database/models/AdvertiserProfile';
import logger from '../../../utils/logger';
import { extractMetrics } from '../../../utils/metrics';
import { flattenProfileData } from '../ai.utils';
import { calculateAdvertiserScores } from '../scoring/profile.scoring';
import { buildAdvertiserAnalyticsPrompt } from '../prompts/advertiser.prompts';
import { generateJSON } from '../gemini.service';
import { getCached, setCached } from '../ai.cache';
import { AdvertiserAnalyticsResult } from '../ai.types';

const DEFAULT_AI_INSIGHTS = {
    summary: 'AI insights are currently unavailable. Your scores have been calculated based on your profile data.',
    strengths: ['Profile data has been analyzed', 'Scores are based on real metrics', 'Check back later for AI insights'],
    improvements: ['Complete all profile sections', 'Increase engagement with audience', 'Post consistently across platforms'],
    contentStrategy: 'Focus on your primary platform and experiment with trending content formats in your niche.',
    growthPotential: 'medium' as const,
    growthReasoning: 'Growth potential will be assessed when AI insights become available.',
};

export const runAdvertiserAnalytics = async (
    userId: string
): Promise<AdvertiserAnalyticsResult> => {
    const user = await User.findById(userId).lean();
    if (!user) throw new Error('User not found');
    if (user.role !== 'advertiser') throw new Error('User is not an advertiser');

    const profileDoc = await AdvertiserProfile.findOne({ userId }).lean();
    if (!profileDoc) throw new Error('Advertiser profile not found');

    const flatProfile = flattenProfileData(profileDoc);
    const metrics = extractMetrics(flatProfile);

    logger.info(
        `[AdvertiserPipeline] Processing user ${userId}: ` +
        `followers=${metrics.followers}, ER=${metrics.engagementRate}%, ` +
        `platforms=${metrics.platforms.join(',')}`
    );

    const scores = calculateAdvertiserScores(profileDoc, user, metrics);

    logger.info(
        `[AdvertiserPipeline] Scores for ${userId}: ` +
        `engagement=${scores.engagement}, completeness=${scores.profileCompleteness}, ` +
        `diversity=${scores.contentDiversity}, reach=${scores.platformReach}, ` +
        `reputation=${scores.reputation}, overall=${scores.overall}`
    );

    const cacheInput = { scores, metrics: { followers: metrics.followers, er: metrics.engagementRate } };
    const cached = getCached<AdvertiserAnalyticsResult>('advertiser-analytics', userId, cacheInput);

    if (cached) {
        return { ...cached, cached: true };
    }

    const prompt = buildAdvertiserAnalyticsPrompt(profileDoc, user, metrics, scores);

    const geminiResult = await generateJSON(prompt, DEFAULT_AI_INSIGHTS, {
        temperature: 0.6,
        timeoutMs: 12_000,
    });

    const result: AdvertiserAnalyticsResult = {
        scores,
        metrics: {
            totalFollowers: metrics.followers,
            avgEngagementRate: metrics.engagementRate,
            primaryPlatform: metrics.primaryPlatform,
            platformCount: metrics.platforms.length,
            totalLikes: metrics.totalLikes,
            avgViews: metrics.avgViews,
        },
        aiInsights: geminiResult.data,
        generatedAt: new Date(),
        cached: false,
    };

    setCached('advertiser-analytics', userId, cacheInput, result, geminiResult.latencyMs);

    logger.info(
        `[AdvertiserPipeline] Completed for ${userId} in ${geminiResult.latencyMs}ms`
    );

    return result;
};
