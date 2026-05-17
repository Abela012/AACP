import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialConnection extends Document {
    userId: mongoose.Types.ObjectId;
    platform: 'tiktok' | 'youtube' | 'facebook' | 'instagram';
    platformUserId: string;
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    isConnected: boolean;
    metadata?: any;
    status: 'pending' | 'approved' | 'rejected';
    lastSyncedAt: Date;
}

const socialConnectionSchema = new Schema<ISocialConnection>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        platform: { type: String, enum: ['tiktok', 'youtube', 'facebook', 'instagram'], required: true },
        platformUserId: { type: String, required: true },
        accessToken: { type: String, required: true },
        refreshToken: { type: String },
        expiresAt: { type: Date },
        isConnected: { type: Boolean, default: true },
        metadata: { type: Schema.Types.Mixed },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        lastSyncedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Unique connection per user per platform
socialConnectionSchema.index({ userId: 1, platform: 1 }, { unique: true });

export default mongoose.model<ISocialConnection>('SocialConnection', socialConnectionSchema);
