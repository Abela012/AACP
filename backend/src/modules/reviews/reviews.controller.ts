import { Request, Response } from "express";
import * as reviewService from "./reviews.service";
import User from "../../database/models/User";
import { getAuth } from "@clerk/express";
import { success, error } from "../../utils/response";

export const createReview = async (req: Request, res: Response) => {
    try {
        const { userId: clerkId } = getAuth(req);
        if (!clerkId) {
            return error(res, "Unauthorized", 401);
        }

        const reviewer = await User.findOne({ clerkId });
        if (!reviewer) {
            return error(res, "Reviewer not found", 404);
        }

        const { targetUserId, opportunityId, rating, comment, collaborationType } = req.body;

        // Validation: cannot review yourself
        if (reviewer._id.toString() === targetUserId) {
            return error(res, "You cannot review yourself", 400);
        }

        const review = await reviewService.createReview({
            reviewerId: reviewer._id as any,
            targetUserId: targetUserId as any,
            opportunityId: opportunityId as any,
            rating,
            comment,
            collaborationType
        });

        return success(res, "Review submitted successfully", review, 201);
    } catch (err: any) {
        if (err.code === 11000) {
            return error(res, "You have already reviewed this collaboration", 409);
        }
        return error(res, err.message || "Failed to submit review", 500);
    }
};

export const getReviewsByUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const reviews = await reviewService.getReviewsByTargetUser(id);
        return success(res, "Reviews retrieved successfully", reviews);
    } catch (err: any) {
        return error(res, err.message || "Failed to fetch reviews", 500);
    }
};

export const getMySentReviews = async (req: Request, res: Response) => {
    try {
        const { userId: clerkId } = getAuth(req);
        if (!clerkId) {
            return error(res, "Unauthorized", 401);
        }

        const user = await User.findOne({ clerkId });
        if (!user) {
            return error(res, "User not found", 404);
        }

        const reviews = await reviewService.getReviewsByReviewer(user._id.toString());
        return success(res, "Sent reviews retrieved successfully", reviews);
    } catch (err: any) {
        return error(res, err.message || "Failed to fetch reviews", 500);
    }
};

export const deleteReview = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId: clerkId } = getAuth(req);
        
        const user = await User.findOne({ clerkId });
        const review = await reviewService.getReviewById(id);

        if (!review || !user) {
            return error(res, "Review or User not found", 404);
        }

        // Only the reviewer or an admin can delete a review
        if (review.reviewerId.toString() !== user._id.toString() && user.role !== 'admin' && user.role !== 'super_admin') {
            return error(res, "Not authorized to delete this review", 403);
        }

        await reviewService.deleteReview(id);
        return success(res, "Review deleted successfully");
    } catch (err: any) {
        return error(res, err.message || "Failed to delete review", 500);
    }
};

export const getReviewsByCollaboration = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const reviews = await reviewService.getReviewsByCollaboration(id);
        return success(res, "Collaboration reviews retrieved successfully", reviews);
    } catch (err: any) {
        return error(res, err.message || "Failed to fetch collaboration reviews", 500);
    }
};
