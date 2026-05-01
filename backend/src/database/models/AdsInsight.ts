import mongoose, { Document, Schema } from 'mongoose';

/**
 * Cached Facebook Ads insight data.
 * Stored per ad-account per date range to avoid redundant API calls
 * and to feed the AI pipeline with historical data.
 */
export interface IAdsInsight extends Document {
    connectionId: mongoose.Types.ObjectId;          // FK → FacebookConnection
    adAccountId: string;                             // e.g. "act_123456789"
    clerkId: string;                                 // For quick user-scoped queries
    dateStart: Date;
    dateEnd: Date;
    level: 'account' | 'campaign' | 'adset' | 'ad';
    entityId?: string;                               // Campaign/AdSet/Ad ID
    entityName?: string;
    metrics: {
        impressions: number;
        clicks: number;
        spend: number;
        cpc: number;                                  // Cost per click
        cpm: number;                                  // Cost per 1000 impressions
        ctr: number;                                  // Click-through rate
        reach: number;
        frequency: number;
        conversions: number;
        costPerConversion: number;
        roas: number;                                 // Return on ad spend
    };
    breakdown?: Record<string, any>;                  // age, gender, placement, etc.
    rawPayload?: Record<string, any>;                 // Full Graph API response
    fetchedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const adsInsightSchema = new Schema<IAdsInsight>(
    {
        connectionId: {
            type: Schema.Types.ObjectId,
            ref: 'FacebookConnection',
            required: true,
            index: true,
        },
        adAccountId: {
            type: String,
            required: true,
            index: true,
        },
        clerkId: {
            type: String,
            required: true,
            index: true,
        },
        dateStart: { type: Date, required: true },
        dateEnd: { type: Date, required: true },
        level: {
            type: String,
            enum: ['account', 'campaign', 'adset', 'ad'],
            default: 'account',
        },
        entityId: { type: String },
        entityName: { type: String },
        metrics: {
            impressions: { type: Number, default: 0 },
            clicks: { type: Number, default: 0 },
            spend: { type: Number, default: 0 },
            cpc: { type: Number, default: 0 },
            cpm: { type: Number, default: 0 },
            ctr: { type: Number, default: 0 },
            reach: { type: Number, default: 0 },
            frequency: { type: Number, default: 0 },
            conversions: { type: Number, default: 0 },
            costPerConversion: { type: Number, default: 0 },
            roas: { type: Number, default: 0 },
        },
        breakdown: { type: Schema.Types.Mixed },
        rawPayload: { type: Schema.Types.Mixed },
        fetchedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Compound index to prevent duplicate insight rows
adsInsightSchema.index(
    { adAccountId: 1, dateStart: 1, dateEnd: 1, level: 1, entityId: 1 },
    { unique: true }
);

// TTL index: auto-delete insights older than 90 days (optional, adjustable)
adsInsightSchema.index(
    { fetchedAt: 1 },
    { expireAfterSeconds: 90 * 24 * 60 * 60 }
);

export default mongoose.model<IAdsInsight>('AdsInsight', adsInsightSchema);
