import { Request, Response } from 'express';
import { getRecommendationsForUser } from './recommendation.service';
import { success, error } from '../../utils/response';

/**
 * Recommendation Controller
 * Handles HTTP request/response for the Recommendation module
 */

/**
 * @desc    Get AI-powered recommendations for the authenticated user
 * @route   GET /api/v1/recommendations
 * @access  Private (Authenticated users)
 */
export const getUserRecommendations = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return error(res, 'User not authenticated', 401);
        }

        const data = await getRecommendationsForUser(userId.toString());

        return success(res, 'User recommendations generated', data);
    } catch (err: any) {
        return error(res, err.message || 'Failed to generate recommendations', 500);
    }
};
