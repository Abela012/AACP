import mongoose, { Document, Schema } from 'mongoose';

export interface IDeletionRequest extends Document {
    requestId: string;
    userId: mongoose.Types.ObjectId;
    platform: 'facebook' | 'instagram' | 'tiktok';
    platformUserId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    requestTimestamp: Date;
    completionTimestamp?: Date;
    metadata?: any;
}

const deletionRequestSchema = new Schema<IDeletionRequest>(
    {
        requestId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        platform: {
            type: String,
            enum: ['facebook', 'instagram', 'tiktok'],
            required: true,
        },
        platformUserId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending',
        },
        requestTimestamp: {
            type: Date,
            default: Date.now,
        },
        completionTimestamp: {
            type: Date,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IDeletionRequest>('DeletionRequest', deletionRequestSchema);
