import { Request, Response } from 'express';
import * as analyticsService from './analytics.service';
import { success, error } from '../../utils/response';
import Collaboration from '../../database/models/Collaboration';
import User from '../../database/models/User';

/**
 * POST /api/v1/collaborations/:id/analytics
 * Submit a social media post URL for analytics scraping.
 * Body: { platform, postUrl, notes }
 * Only the advertiser in the collaboration may submit, and the URL must
 * contain their own username.
 */
export const submitAnalytics = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { platform, postUrl, notes } = req.body;

        console.log('[Analytics] Submit request:', { id, platform, postUrl, notes, userId: req.user?._id });

        if (!postUrl) {
            return error(res, 'postUrl is required.', 400);
        }

        const userId = req.user?._id?.toString();
        if (!userId) {
            return error(res, 'User not found in request context.', 401);
        }

        // ── Guard 1: Only the advertiser may submit ──────────────────────────
        const collab = await Collaboration.findById(id);
        if (!collab) {
            return error(res, 'Collaboration not found.', 404);
        }
        if (collab.advertiser.toString() !== userId) {
            return error(res, 'Only the advertiser in this collaboration can submit post links.', 403);
        }

        // ── Guard 2: URL must contain the advertiser's own username ──────────
        const advertiserUser = await User.findById(userId).select('username profileData');
        const advertiserUsername = (
            (advertiserUser as any)?.username ||
            (advertiserUser as any)?.profileData?.tiktok?.username ||
            (advertiserUser as any)?.profileData?.instagram?.username ||
            ''
        ).replace(/^@/, '').toLowerCase();

        if (advertiserUsername) {
            const normalizedUrl = postUrl.toLowerCase();
            if (
                !normalizedUrl.includes(`/${advertiserUsername}`) &&
                !normalizedUrl.includes(`@${advertiserUsername}`)
            ) {
                return error(
                    res,
                    `You can only submit your own posts. The URL must contain your username (@${advertiserUsername}).`,
                    400
                );
            }
        }

        const doc = await analyticsService.submitAnalytics(
            id,
            userId,
            platform,
            postUrl.trim(),
            notes
        );

        return success(res, 'Post submitted for analytics. Scraping in progress…', doc, 202);
    } catch (err: any) {
        console.error('[Analytics] Submit error:', err.message);
        const statusCode = err.message.startsWith('Rate limit') ? 429
                         : err.message.includes('not found') ? 404
                         : 400;
        return error(res, err.message, statusCode);
    }
};

/**
 * GET /api/v1/collaborations/:id/analytics
 * Returns all analytics records for this collaboration.
 */
export const getAnalytics = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const analytics = await analyticsService.getAnalyticsByCollaboration(id);
        return success(res, 'Analytics retrieved successfully', analytics);
    } catch (err: any) {
        return error(res, err.message, 500);
    }
};

/**
 * POST /api/v1/collaborations/:id/analytics/:analyticsId/refresh
 * Re-fetch latest metrics for a specific analytics record.
 */
export const refreshAnalytics = async (req: Request, res: Response) => {
    try {
        const { analyticsId } = req.params;
        const doc = await analyticsService.refreshAnalytics(
            analyticsId,
            req.user?._id?.toString() as string
        );
        return success(res, 'Analytics refresh queued.', doc, 202);
    } catch (err: any) {
        return error(res, err.message, err.message.includes('not found') ? 404 : 500);
    }
};
