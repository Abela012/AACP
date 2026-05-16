import mongoose, { Document, Schema, Model } from "mongoose";
import User from "./User";

export interface IReview extends Document {
    reviewerId: mongoose.Types.ObjectId;
    targetUserId: mongoose.Types.ObjectId;
    opportunityId: mongoose.Types.ObjectId; // Referencing the opportunity/campaign
    rating: number;
    comment: string;
    collaborationType: 'fixed-price' | 'hourly' | 'product-based' | 'other';
    isVerified: boolean;
    trustScore: number;
    aiFraudDetected: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema: Schema<IReview> = new Schema(
    {
        reviewerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Reviewer ID is required'],
        },
        targetUserId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Target User ID is required'],
        },
        opportunityId: {
            type: Schema.Types.ObjectId,
            ref: 'Opportunity',
            required: [true, 'Opportunity ID is required'],
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
        },
        comment: {
            type: String,
            required: [true, 'Review comment is required'],
            maxlength: [1000, 'Comment cannot exceed 1000 characters'],
            trim: true,
        },
        collaborationType: {
            type: String,
            enum: ['fixed-price', 'hourly', 'product-based', 'other'],
            default: 'fixed-price',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        trustScore: {
            type: Number,
            default: 1.0,
        },
        aiFraudDetected: {
            type: Boolean,
            default: false,
        }
    },
    { timestamps: true }
);

// Ensure one user can only submit one review per collaboration
reviewSchema.index({ reviewerId: 1, opportunityId: 1 }, { unique: true });
reviewSchema.index({ targetUserId: 1 });
reviewSchema.index({ opportunityId: 1 });

/**
 * Static method to calculate and update user's average rating
 */
reviewSchema.statics.calculateAverageRating = async function(userId: mongoose.Types.ObjectId) {
    const stats = await this.aggregate([
        {
            $match: { targetUserId: userId }
        },
        {
            $group: {
                _id: '$targetUserId',
                totalReviews: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await User.findByIdAndUpdate(userId, {
            averageRating: parseFloat(stats[0].avgRating.toFixed(2)),
            totalReviews: stats[0].totalReviews
        });
    } else {
        await User.findByIdAndUpdate(userId, {
            averageRating: 0,
            totalReviews: 0
        });
    }
};

// Call calculateAverageRating after save
reviewSchema.post('save', async function() {
    // @ts-ignore
    await (this.constructor as any).calculateAverageRating(this.targetUserId);
});

// Call calculateAverageRating after remove
reviewSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await (doc.constructor as any).calculateAverageRating(doc.targetUserId);
    }
});

const Review: Model<IReview> = mongoose.model<IReview>("Review", reviewSchema);

export default Review;
