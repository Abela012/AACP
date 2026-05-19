// models/creatorProfile.model.ts

import mongoose, { Document, Schema } from "mongoose";

export interface ISocialProfile {
    platform: "TikTok" | "Instagram" | "YouTube" | "Facebook";

    username: string;

    profileLink?: string;

    verified: boolean;

    followers: number;

    following: number;

    engagementRate: number;

    postingFrequency?: string;

    niches?: string[];

    contentStyles?: string[];

    analytics?: any;

    audience?: any;

    audienceQuality?: any;

    sentimentAnalysis?: any;

    brandSafety?: any;

    collaborationHistory?: any;

    conversionMetrics?: any;

    aiScores?: any;

    aiInsights?: any;

    connectedAt?: Date;

    lastSynced?: Date;
}

export interface IAdvertiserProfile extends Document {
    userId: mongoose.Types.ObjectId;

    bio?: string;

    location?: string;

    phoneNumber?: string;

    niche?: string;

    experienceLevel?: string;

    contentFormats?: string[];

    targetAudience?: {
        ageRange?: string;
        gender?: string;
        interests?: string[];
    };

    rateExpectations?: {
        minRate?: number;
        preferredRate?: number;
        rateType?: string;
    };

    previousBrands?: string[];

    portfolioLinks?: string[];

    additionalNotes?: string;

    aiProfileScore?: number;

    totalPosts?: number;

    averageRating?: number;

    totalReviews?: number;

    profileCompleted?: boolean;

    profileCompletedAt?: Date;

    pendingUpdates?: any;
    pendingProfileData?: any;
    profileData?: any;

    socialProfiles: ISocialProfile[];
    savedOpportunities?: mongoose.Types.ObjectId[];
}

const socialProfileSchema = new Schema(
    {
        platform: {
            type: String,
            enum: ["TikTok", "Instagram", "YouTube", "Facebook"],
            required: true,
        },

        username: {
            type: String,
            required: true,
        },

        profileLink: {
            type: String,
        },

        verified: {
            type: Boolean,
            default: false,
        },

        followers: {
            type: Number,
            default: 0,
        },

        following: {
            type: Number,
            default: 0,
        },

        engagementRate: {
            type: Number,
            default: 0,
        },

        postingFrequency: {
            type: String,
        },

        niches: [
            {
                type: String,
            },
        ],

        contentStyles: [
            {
                type: String,
            },
        ],

        analytics: {
            type: Schema.Types.Mixed,
            default: {},
        },

        audience: {
            type: Schema.Types.Mixed,
            default: {},
        },

        audienceQuality: {
            type: Schema.Types.Mixed,
            default: {},
        },

        sentimentAnalysis: {
            type: Schema.Types.Mixed,
            default: {},
        },

        brandSafety: {
            type: Schema.Types.Mixed,
            default: {},
        },

        savedOpportunities: [
            {
                type: Schema.Types.ObjectId,
                ref: "Opportunity",
            },
        ],

        collaborationHistory: {
            type: Schema.Types.Mixed,
            default: {},
        },

        conversionMetrics: {
            type: Schema.Types.Mixed,
            default: {},
        },

        aiScores: {
            type: Schema.Types.Mixed,
            default: {},
        },

        aiInsights: {
            type: Schema.Types.Mixed,
            default: {},
        },

        connectedAt: {
            type: Date,
        },

        lastSynced: {
            type: Date,
        },
    },
    { _id: false }
);

const advertiserProfileSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        bio: {
            type: String,
            default: "",
        },

        location: {
            type: String,
            default: "",
        },

        phoneNumber: {
            type: String,
        },

        niche: {
            type: String,
            enum: [
                "beauty",
                "fashion",
                "tech",
                "gaming",
                "food",
                "travel",
                "fitness",
                "lifestyle",
                "business",
                "comedy",
                "education",
                "music",
                "sports",
                "other",
            ],
        },

        experienceLevel: {
            type: String,
            enum: ["beginner", "intermediate", "advanced", "professional"],
        },

        contentFormats: [
            {
                type: String,
                enum: [
                    "tutorials",
                    "reviews",
                    "unboxings",
                    "vlogs",
                    "comedy",
                    "educational",
                    "storytime",
                    "challenges",
                    "duets",
                    "live_streams",
                ],
            },
        ],

        targetAudience: {
            ageRange: {
                type: String,
            },

            gender: {
                type: String,
            },

            interests: [
                {
                    type: String,
                },
            ],
        },

        rateExpectations: {
            minRate: {
                type: Number,
            },

            preferredRate: {
                type: Number,
            },

            rateType: {
                type: String,
            },
        },

        previousBrands: [
            {
                type: String,
            },
        ],

        portfolioLinks: [
            {
                type: String,
            },
        ],

        additionalNotes: {
            type: String,
        },

        aiProfileScore: {
            type: Number,
            default: 0,
        },

        totalPosts: {
            type: Number,
            default: 0,
        },

        averageRating: {
            type: Number,
            default: 0,
        },

        totalReviews: {
            type: Number,
            default: 0,
        },

        profileCompleted: {
            type: Boolean,
            default: false,
        },

        profileCompletedAt: {
            type: Date,
        },

        socialProfiles: {
            type: [socialProfileSchema],
            default: [],
        },

        pendingUpdates: {
            type: Schema.Types.Mixed,
        },

        pendingProfileData: {
            type: Schema.Types.Mixed,
        },

        profileData: {
            type: Schema.Types.Mixed,
        },
    },
    { timestamps: true }
);

export default mongoose.model<IAdvertiserProfile>(
    "AdvertiserProfile",
    advertiserProfileSchema
);