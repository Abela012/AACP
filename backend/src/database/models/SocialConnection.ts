import mongoose, { Document, Schema } from 'mongoose';
import { encrypt, decrypt } from '../../utils/encryption';

export interface ISocialConnection extends Document {
    userId: mongoose.Types.ObjectId;
    platform: 'facebook' | 'instagram' | 'tiktok';
    platformUserId: string;
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    scopes: string[];
    metadata: any;
    status: 'pending' | 'approved' | 'rejected';
    isConnected: boolean;
    lastSyncedAt?: Date;
    createdAt: Date;
    updatedAt: Date;

    getDecryptedToken(): string;
    getDecryptedRefreshToken(): string | undefined;
}

const socialConnectionSchema = new Schema<ISocialConnection>(
    {
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
        accessToken: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String,
        },
        expiresAt: {
            type: Date,
        },
        scopes: {
            type: [String],
            default: [],
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        isConnected: {
            type: Boolean,
            default: true,
        },
        lastSyncedAt: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

// Encrypt tokens before saving
socialConnectionSchema.pre('save', function (next) {
    if (this.isModified('accessToken')) {
        this.accessToken = encrypt(this.accessToken);
    }
    if (this.isModified('refreshToken') && this.refreshToken) {
        this.refreshToken = encrypt(this.refreshToken);
    }
    next();
});

// Helper methods to decrypt
socialConnectionSchema.methods.getDecryptedToken = function () {
    return decrypt(this.accessToken);
};

socialConnectionSchema.methods.getDecryptedRefreshToken = function () {
    return this.refreshToken ? decrypt(this.refreshToken) : undefined;
};

// Ensure unique connection per user per platform
socialConnectionSchema.index({ userId: 1, platform: 1 }, { unique: true });

export default mongoose.model<ISocialConnection>('SocialConnection', socialConnectionSchema);
