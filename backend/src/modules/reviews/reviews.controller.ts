import { Request, Response } from 'express';
import * as reviewService from './reviews.service';
import { success, error } from '../../utils/response';

/**
 * Review Controller
 * Owner: Backend Developer 2
 * Handles HTTP requests for reviews
 */

/**
 * @desc    Create a review for a collaboration
 * @route   POST /api/v1/reviews
 * @access  Private (Participants only)
 */
export const createReview = async (req: Request, res: Response) => {
    try {
        const { collaborationId, rating, comment } = req.body;

        const reviewData = {
            collaboration: collaborationId,
            reviewer: req.user?._id?.toString() as string,
            rating,
            comment
        };

        const review = await reviewService.createReview(reviewData as any);
        return success(res, 'Review submitted successfully', review, 201);
    } catch (err: any) {
        return error(res, err.message, 400);
    }
};

/**
 * @desc    Get all reviews of a user
 * @route   GET /api/v1/reviews/user/:id
 * @access  Public (or Private if needed, usually reviews are public)
 */
export const getReviewsByUser = async (req: Request, res: Response) => {
    try {
        const reviews = await reviewService.getReviewsByUser(req.params.id as string);
        return success(res, 'Reviews retrieved successfully', reviews);
    } catch (err: any) {
        return error(res, err.message, 500);
    }
};

/**
 * @desc    Get all reviews for a specific collaboration
 * @route   GET /api/v1/reviews/collaboration/:id
 * @access  Private (Participants only)
 */
export const getReviewsByCollaboration = async (req: Request, res: Response) => {
    try {
        const reviews = await reviewService.getReviewsByCollaboration(req.params.id as string);
        return success(res, 'Reviews for collaboration retrieved successfully', reviews);
    } catch (err: any) {
        return error(res, err.message, 500);
    }
};
