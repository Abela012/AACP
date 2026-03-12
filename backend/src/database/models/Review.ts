import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Review Model
 * Owner: Backend Developer 2
 * Module: reviews
 */
export interface IReview extends Document {
    collaboration: mongoose.Types.ObjectId;
    reviewer: mongoose.Types.ObjectId;
    reviewee: mongoose.Types.ObjectId;
    reviewerRole: 'business_owner' | 'advertiser';
    rating: number;
    comment?: string;
    categories?: {
        communication?: number;
        quality?: number;
        timeliness?: number;
        professionalism?: number;
    };
    isPublic: boolean;
    response?: {
        text: string;
        respondedAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema: Schema<IReview> = new Schema(
    {
        collaboration: {
            type: Schema.Types.ObjectId,
            ref: 'Collaboration',
            required: true,
        },
        reviewer: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        reviewee: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        reviewerRole: {
            type: String,
            enum: ['business_owner', 'advertiser'],
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            maxlength: 2000,
        },
        categories: {
            communication: { type: Number, min: 1, max: 5 },
            quality: { type: Number, min: 1, max: 5 },
            timeliness: { type: Number, min: 1, max: 5 },
            professionalism: { type: Number, min: 1, max: 5 },
        },
        isPublic: { type: Boolean, default: true },
        response: {
            text: String,
            respondedAt: Date,
        },
    },
    { timestamps: true }
);

reviewSchema.index({ collaboration: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1 });

const Review: Model<IReview> = mongoose.model<IReview>('Review', reviewSchema);
export default Review;
