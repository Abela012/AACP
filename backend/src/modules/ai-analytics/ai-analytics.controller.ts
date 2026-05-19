/**
 * AI Analytics Controller
 *
 * HTTP request handlers for the AI analytics endpoints.
 * Follows the same controller pattern used in your existing
 * marketing-analysis and recommendations modules.
 */

import { Request, Response } from 'express';
import * as aiService from './ai-analytics.service';
import { success, error } from '../../utils/response';

/**
 * @desc    Get AI-powered analytics for the authenticated user
 * @route   GET /api/v1/ai-analytics
 * @access  Private (Advertiser or Business Owner)
 */
export const getMyAnalytics = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return error(res, 'User not authenticated', 401);
        }

        const data = await aiService.getAnalyticsForUser(userId.toString());
        return success(res, 'AI analytics generated', data);
    } catch (err: any) {
        const statusCode = err.message.includes('not found') ? 404 : 500;
        return error(res, err.message || 'Failed to generate AI analytics', statusCode);
    }
};

/**
 * @desc    Get AI analytics for a specific advertiser (public view)
 * @route   GET /api/v1/ai-analytics/advertiser/:advertiserId
 * @access  Private (Any authenticated user)
 */
export const getAdvertiserAnalytics = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return error(res, 'User not authenticated', 401);
        }

        const { advertiserId } = req.params;
        if (!advertiserId) {
            return error(res, 'Advertiser ID is required', 400);
        }

        const data = await aiService.getAdvertiserAnalytics(advertiserId);
        return success(res, 'Advertiser analytics generated', data);
    } catch (err: any) {
        const statusCode = err.message.includes('not found') ? 404 : 500;
        return error(res, err.message || 'Failed to generate advertiser analytics', statusCode);
    }
};

/**
 * @desc    Force refresh analytics (invalidate cache and regenerate)
 * @route   POST /api/v1/ai-analytics/refresh
 * @access  Private (Own user only)
 */
export const refreshMyAnalytics = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return error(res, 'User not authenticated', 401);
        }

        const data = await aiService.refreshAnalytics(userId.toString());
        return success(res, 'AI analytics refreshed', data);
    } catch (err: any) {
        return error(res, err.message || 'Failed to refresh analytics', 500);
    }
};

/**
 * @desc    Get AI cache statistics (admin monitoring)
 * @route   GET /api/v1/ai-analytics/cache-stats
 * @access  Private (Admin only)
 */
export const getCacheStats = async (req: Request, res: Response) => {
    try {
        const data = aiService.getAICacheStats();
        return success(res, 'Cache statistics', data);
    } catch (err: any) {
        return error(res, err.message || 'Failed to get cache stats', 500);
    }
};
