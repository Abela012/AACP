import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Collaboration Analytics Model
 * Tracks social media performance of published content
 */
export interface ICollaborationAnalytics extends Document {
    collaboration: mongoose.Types.ObjectId;
    advertiser: mongoose.Types.ObjectId;
    platform: 'TikTok' | 'Instagram' | 'YouTube';
    postUrl: string;
    caption?: string;
    metrics: {
        views: number;
        likes: number;
        comments: number;
        shares: number;
        saves?: number;
        watchTime?: number;
        engagementRate: number;
    };
    lastRefreshed: Date;
    status: 'active' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}

const analyticsSchema: Schema<ICollaborationAnalytics> = new Schema(
    {
        collaboration: {
            type: Schema.Types.ObjectId,
            ref: 'Collaboration',
            required: true,
        },
        advertiser: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        platform: {
            type: String,
            enum: ['TikTok', 'Instagram', 'YouTube'],
            required: true,
        },
        postUrl: {
            type: String,
            required: true,
        },
        caption: String,
        metrics: {
            views: { type: Number, default: 0 },
            likes: { type: Number, default: 0 },
            comments: { type: Number, default: 0 },
            shares: { type: Number, default: 0 },
            saves: { type: Number, default: 0 },
            watchTime: { type: Number, default: 0 },
            engagementRate: { type: Number, default: 0 },
        },
        lastRefreshed: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: ['active', 'archived'],
            default: 'active',
        },
    },
    { timestamps: true }
);

// Create compound index for easy retrieval
analyticsSchema.index({ collaboration: 1, platform: 1 });

const CollaborationAnalytics: Model<ICollaborationAnalytics> = mongoose.model<ICollaborationAnalytics>(
    'CollaborationAnalytics',
    analyticsSchema
);

export default CollaborationAnalytics;
