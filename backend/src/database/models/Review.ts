import { Schema, model } from 'mongoose';

/**
 * Review Model
 * Owner: Backend Developer 2
 * Module: reviews
 */
const reviewSchema = new Schema(
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

const Review = model('Review', reviewSchema);

export default Review;
