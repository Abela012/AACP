import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalyticsMetrics {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    duration?: number;      // seconds (video duration)
    thumbnail?: string;     // thumbnail URL
    engagementRate?: number; // computed: (likes+comments+shares)/views * 100
}

export interface IAnalytics extends Document {
    collaborationId: mongoose.Types.ObjectId;
    submittedBy: mongoose.Types.ObjectId;
    platform: 'TikTok' | 'Instagram' | 'YouTube';
    postUrl: string;
    notes?: string;
    metrics: IAnalyticsMetrics;
    status: 'pending' | 'completed' | 'failed';
    errorMessage?: string;
    createdAt: Date;
    refreshedAt: Date;
    updatedAt: Date;
}

const analyticsMetricsSchema = new Schema<IAnalyticsMetrics>(
    {
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        duration: { type: Number },
        thumbnail: { type: String },
        engagementRate: { type: Number, default: 0 },
    },
    { _id: false }
);

const analyticsSchema = new Schema<IAnalytics>(
    {
        collaborationId: { type: Schema.Types.ObjectId, ref: 'Collaboration', required: true, index: true },
        submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        platform: { type: String, enum: ['TikTok', 'Instagram', 'YouTube'], required: true },
        postUrl: { type: String, required: true },
        notes: { type: String },
        metrics: { type: analyticsMetricsSchema, default: () => ({}) },
        status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
        errorMessage: { type: String },
        refreshedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.model<IAnalytics>('Analytics', analyticsSchema);
