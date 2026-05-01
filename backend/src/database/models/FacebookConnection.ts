import mongoose, { Document, Schema } from 'mongoose';

/**
 * Represents a single Facebook Ad Account linked to a connection.
 */
export interface IAdAccount {
    adAccountId: string;        // e.g. "act_123456789"
    name: string;
    currency: string;
    timezoneName: string;
    accountStatus: number;      // 1=Active, 2=Disabled, 3=Unsettled, etc.
    lastSyncedAt?: Date;
}

/**
 * Represents a Facebook Page linked to a connection.
 */
export interface IFacebookPage {
    pageId: string;
    name: string;
    category?: string;
    pageAccessToken: string;    // Encrypted — page-level token for page insights
    lastSyncedAt?: Date;
}

/**
 * Represents a user's Facebook connection with encrypted tokens.
 * Each user can have multiple connections (multiple FB accounts).
 */
export interface IFacebookConnection extends Document {
    userId: mongoose.Types.ObjectId;    // Reference to User model
    clerkId: string;                     // Clerk user ID for quick lookups
    facebookUserId: string;              // Facebook's user ID
    accessToken: string;                 // Encrypted long-lived token
    tokenExpiresAt?: Date;               // When the token expires
    tokenType: 'short_lived' | 'long_lived';
    scopes: string[];                    // Granted permissions
    profile: {
        name: string;
        email?: string;
        pictureUrl?: string;
    };
    adAccounts: IAdAccount[];
    pages: IFacebookPage[];
    isActive: boolean;                   // Whether this connection is usable
    lastTokenRefresh?: Date;
    lastDataSync?: Date;
    connectionError?: string;            // Last error message if any
    createdAt: Date;
    updatedAt: Date;
}

const adAccountSchema = new Schema<IAdAccount>(
    {
        adAccountId: { type: String, required: true },
        name: { type: String, required: true },
        currency: { type: String, default: 'USD' },
        timezoneName: { type: String, default: '' },
        accountStatus: { type: Number, default: 1 },
        lastSyncedAt: { type: Date },
    },
    { _id: false }
);

const facebookPageSchema = new Schema<IFacebookPage>(
    {
        pageId: { type: String, required: true },
        name: { type: String, required: true },
        category: { type: String, default: '' },
        pageAccessToken: { type: String, required: true }, // stored encrypted
        lastSyncedAt: { type: Date },
    },
    { _id: false }
);

const facebookConnectionSchema = new Schema<IFacebookConnection>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        clerkId: {
            type: String,
            required: true,
            index: true,
        },
        facebookUserId: {
            type: String,
            required: true,
        },
        accessToken: {
            type: String,
            required: true,    // Stored encrypted via AES-256-GCM
        },
        tokenExpiresAt: {
            type: Date,
        },
        tokenType: {
            type: String,
            enum: ['short_lived', 'long_lived'],
            default: 'short_lived',
        },
        scopes: {
            type: [String],
            default: [],
        },
        profile: {
            name: { type: String, default: '' },
            email: { type: String },
            pictureUrl: { type: String },
        },
        adAccounts: {
            type: [adAccountSchema],
            default: [],
        },
        pages: {
            type: [facebookPageSchema],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastTokenRefresh: {
            type: Date,
        },
        lastDataSync: {
            type: Date,
        },
        connectionError: {
            type: String,
        },
    },
    { timestamps: true }
);

// Compound index: one Facebook account per user
facebookConnectionSchema.index(
    { userId: 1, facebookUserId: 1 },
    { unique: true }
);

// Index for finding connections needing token refresh
facebookConnectionSchema.index({ tokenExpiresAt: 1, isActive: 1 });

export default mongoose.model<IFacebookConnection>(
    'FacebookConnection',
    facebookConnectionSchema
);
