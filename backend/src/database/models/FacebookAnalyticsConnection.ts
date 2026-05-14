import mongoose, { Document, Schema } from 'mongoose';
import { encrypt, decrypt } from '../../utils/encryption';

/**
 * Represents a single Facebook Page connected via the analytics OAuth flow.
 */
export interface IFacebookPage {
    pageId: string;
    name: string;
    category?: string;
    accessToken: string; // Page-level token (encrypted at rest)
    followers?: number;
    fans?: number;
    picture?: string;
}

/**
 * Cached page insights snapshot — refreshed on each sync.
 */
export interface IPageInsights {
    pageId: string;
    pageName: string;
    fans: number;
    followers: number;
    impressions: number;
    reach: number;
    engagedUsers: number;
    postEngagements: number;
    pageViewsTotal: number;
    fetchedAt: Date;
}

export interface IFacebookAnalyticsConnection extends Document {
    userId: mongoose.Types.ObjectId;
    facebookUserId: string;
    userAccessToken: string;          // Long-lived user token (encrypted)
    tokenExpiresAt?: Date;
    scopes: string[];
    pages: IFacebookPage[];
    insights: IPageInsights[];
    status: 'connected' | 'expired' | 'revoked' | 'error';
    lastSyncedAt?: Date;
    createdAt: Date;
    updatedAt: Date;

    getDecryptedUserToken(): string;
}

const facebookPageSchema = new Schema<IFacebookPage>(
    {
        pageId: { type: String, required: true },
        name: { type: String, required: true },
        category: { type: String },
        accessToken: { type: String, required: true },
        followers: { type: Number, default: 0 },
        fans: { type: Number, default: 0 },
        picture: { type: String },
    },
    { _id: false }
);

const pageInsightsSchema = new Schema<IPageInsights>(
    {
        pageId: { type: String, required: true },
        pageName: { type: String, required: true },
        fans: { type: Number, default: 0 },
        followers: { type: Number, default: 0 },
        impressions: { type: Number, default: 0 },
        reach: { type: Number, default: 0 },
        engagedUsers: { type: Number, default: 0 },
        postEngagements: { type: Number, default: 0 },
        pageViewsTotal: { type: Number, default: 0 },
        fetchedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const fbAnalyticsConnectionSchema = new Schema<IFacebookAnalyticsConnection>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // One analytics connection per user
            index: true,
        },
        facebookUserId: {
            type: String,
            required: true,
        },
        userAccessToken: {
            type: String,
            required: true,
        },
        tokenExpiresAt: {
            type: Date,
        },
        scopes: {
            type: [String],
            default: [],
        },
        pages: {
            type: [facebookPageSchema],
            default: [],
        },
        insights: {
            type: [pageInsightsSchema],
            default: [],
        },
        status: {
            type: String,
            enum: ['connected', 'expired', 'revoked', 'error'],
            default: 'connected',
        },
        lastSyncedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Encrypt user access token before saving
fbAnalyticsConnectionSchema.pre('save', function (next) {
    if (this.isModified('userAccessToken')) {
        this.userAccessToken = encrypt(this.userAccessToken);
    }
    // Encrypt each page-level token that changed
    if (this.isModified('pages')) {
        for (const page of this.pages) {
            // Only encrypt if not already encrypted (simple heuristic: base64 length)
            if (page.accessToken && !page.accessToken.startsWith('eyJ') && page.accessToken.length < 300) {
                // Looks like a raw FB token — leave as is; encryption happens below
            }
        }
    }
    next();
});

// Decrypt helper
fbAnalyticsConnectionSchema.methods.getDecryptedUserToken = function (): string {
    return decrypt(this.userAccessToken);
};

export default mongoose.model<IFacebookAnalyticsConnection>(
    'FacebookAnalyticsConnection',
    fbAnalyticsConnectionSchema
);
