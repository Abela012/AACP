import Review, { IReview } from "../../database/models/Review";
import mongoose from "mongoose";

export const createReview = async (data: Partial<IReview>): Promise<IReview> => {
    return await Review.create(data);
};

export const getReviewsByTargetUser = async (targetUserId: string): Promise<IReview[]> => {
    return await Review.find({ targetUserId: new mongoose.Types.ObjectId(targetUserId) })
        .populate('reviewerId', 'firstName lastName profilePicture role')
        .sort({ createdAt: -1 });
};

export const getReviewsByReviewer = async (reviewerId: string): Promise<IReview[]> => {
    return await Review.find({ reviewerId: new mongoose.Types.ObjectId(reviewerId) })
        .populate('targetUserId', 'firstName lastName profilePicture role')
        .sort({ createdAt: -1 });
};

export const deleteReview = async (reviewId: string): Promise<void> => {
    await Review.findByIdAndDelete(reviewId);
};

export const getReviewById = async (reviewId: string): Promise<IReview | null> => {
    return await Review.findById(reviewId).populate('reviewerId targetUserId');
};

export const getReviewByReviewerAndTarget = async (reviewerId: string, targetUserId: string): Promise<IReview | null> => {
    return await Review.findOne({
        reviewerId: new mongoose.Types.ObjectId(reviewerId),
        targetUserId: new mongoose.Types.ObjectId(targetUserId)
    });
};

export const getReviewsByCollaboration = async (opportunityId: string): Promise<IReview[]> => {
    return await Review.find({ opportunityId: new mongoose.Types.ObjectId(opportunityId) })
        .populate('reviewerId targetUserId');
};
