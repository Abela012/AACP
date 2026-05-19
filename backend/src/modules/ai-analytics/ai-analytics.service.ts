/**
 * AI Analytics Service
 *
 * Orchestrates the advertiser and business pipelines.
 * This is the service layer consumed by the controller.
 *
 * It delegates to:
 *   - pipelines/advertiser.pipeline.ts for creator analytics
 *   - pipelines/business.pipeline.ts for business analytics
 *   - ai.cache.ts for cache invalidation
 */

import { runAdvertiserAnalytics } from '../../services/ai/pipelines/advertiser.pipeline';
import { runBusinessAnalytics } from '../../services/ai/pipelines/business.pipeline';
import { invalidateUser, getCacheStats } from '../../services/ai/ai.cache';
import { AdvertiserAnalyticsResult, BusinessAnalyticsResult } from '../../services/ai/ai.types';
import User from '../../database/models/User';
import logger from '../../utils/logger';

/**
 * Get AI analytics for any user. Automatically routes to the correct
 * pipeline based on the user's role.
 */
export const getAnalyticsForUser = async (
    userId: string
): Promise<AdvertiserAnalyticsResult | BusinessAnalyticsResult> => {
    const user = await User.findById(userId).lean();
    if (!user) throw new Error('User not found');

    logger.info(`[AIAnalytics] Generating analytics for ${user.role} user ${userId}`);

    if (user.role === 'advertiser') {
        return runAdvertiserAnalytics(userId);
    } else if (user.role === 'business_owner') {
        return runBusinessAnalytics(userId);
    } else {
        throw new Error(`AI analytics not supported for role: ${user.role}`);
    }
};

/**
 * Get advertiser-specific analytics.
 */
export const getAdvertiserAnalytics = async (
    userId: string
): Promise<AdvertiserAnalyticsResult> => {
    return runAdvertiserAnalytics(userId);
};

/**
 * Get business owner-specific analytics.
 */
export const getBusinessAnalytics = async (
    userId: string
): Promise<BusinessAnalyticsResult> => {
    return runBusinessAnalytics(userId);
};

/**
 * Force refresh analytics by invalidating the cache.
 */
export const refreshAnalytics = async (
    userId: string
): Promise<AdvertiserAnalyticsResult | BusinessAnalyticsResult> => {
    invalidateUser(userId);
    logger.info(`[AIAnalytics] Cache invalidated for user ${userId}. Regenerating...`);
    return getAnalyticsForUser(userId);
};

/**
 * Get cache stats for admin monitoring.
 */
export const getAICacheStats = () => {
    return getCacheStats();
};
