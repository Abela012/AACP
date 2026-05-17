import mongoose, { Document, Schema } from "mongoose";

export interface IAudienceLocation {
    country: string;
    city: string;
    percentage: number;
}

export interface IAudienceAnalytics {
    audienceGender: {
        male: number;
        female: number;
    };
    audienceLocations: IAudienceLocation[];
}

export interface ITikTokAnalytics {
    primaryLanguage: string;
    avgViews: number;
    avgLikes: number;
    avgComments: number;
    avgShares: number;
    avgSaves?: number;
    averageWatchTime: number;
    completionRate: number;
    totalLikes: number;
    viralVideoPercentage: number;
    estimatedStoryViews?: number;
    audienceAnalytics: IAudienceAnalytics;
}

export interface IInstagramAnalytics {
    followers: number;
    avgViews: number;
    totalLikes: number;
    avgComments: number;
    avgShares: number;
    avgSaves?: number;
    averageWatchTime?: number;
    estimatedStoryViews?: number;
    engagementMetrics?: {
        likes: number;
        comments: number;
        shares: number;
        saves: number;
    };
}

export interface IYouTubeAnalytics {
    primaryLanguage: string;
    subscribers: number;
    watchHours: number;
    ctr: number;
    impressions: number;
    averageViewDuration: number;
    totalVideos: number;
    engagementMetrics: {
        likes: number;
        comments: number;
        shares: number;
    };
    audienceAnalytics?: IAudienceAnalytics;
}

export interface ISocialProfile {
    platform: "TikTok" | "YouTube" | "Instagram";
    username: string;
    profileLink?: string;
    verified: boolean;
    followers: number;
    following: number;
    engagementRate: number;
    postingFrequency?: string;
    niches: string[];
    contentStyles: string[];
    tiktokAnalytics?: ITikTokAnalytics;
    youtubeAnalytics?: IYouTubeAnalytics;
    instagramAnalytics?: IInstagramAnalytics;

    audience?: {
        genderDistribution?: {
            male: number;
            female: number;
        };
        ageDistribution?: Record<string, number>;
        topCountries?: {
            country: string;
            percentage: number;
        }[];
        interests?: string[];
    };
    audienceQuality?: {
        authenticityScore: number;
        fakeFollowerPercentage: number;
        botProbability: number;
    };
    sentimentAnalysis?: {
        positive: number;
        neutral: number;
        negative: number;
    };
    brandSafety?: {
        score: number;
        controversyRisk: number;
        copyrightRisk: number;
        adultContentRisk: number;
    };
    collaborationHistory?: {
        totalBrandDeals: number;
        repeatBrandRate: number;
        campaignCompletionRate: number;
    };
    conversionMetrics?: {
        estimatedCTR: number;
        estimatedConversionRate: number;
        purchaseIntentScore: number;
    };
    aiScores?: {
        influenceScore: number;
        trustScore: number;
        growthPotentialScore: number;
        roiPotentialScore: number;
    };
    aiInsights?: {
        summary: string;
        strengths: string[];
        weaknesses: string[];
        recommendedBrandCategories: string[];
    };
}

export interface IUser extends Document {
    clerkId: string;
    tiktokOpenId?: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    profilePicture?: string;
    coverImage?: string;
    role: 'business_owner' | 'advertiser' | 'admin' | 'super_admin';
    status: 'incomplete' | 'pending' | 'active' | 'approved' | 'banned' | 'suspended';
    isVerified: boolean;
    pendingUpdates?: any;
    profileData?: any;
    pendingProfileData?: any;
    bio?: string;
    tradeLicenseUrl?: string;
    idVerificationUrl?: string;
    location?: string;
    socialProfiles: ISocialProfile[];
    savedOpportunities: mongoose.Types.ObjectId[];
    savedCreators: mongoose.Types.ObjectId[];
    aiProfileScore?: number;
    totalPosts: number;
    averageRating: number;
    totalReviews: number;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const audienceAnalyticsSchema = new Schema({
    audienceGender: {
        male: { type: Number, default: 0 },
        female: { type: Number, default: 0 }
    },
    audienceLocations: [{
        country: { type: String },
        city: { type: String },
        percentage: { type: Number }
    }]
}, { _id: false });

const tiktokAnalyticsSchema = new Schema({
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    avgViews: { type: Number, default: 0 },
    avgLikes: { type: Number, default: 0 },
    avgComments: { type: Number, default: 0 },
    avgShares: { type: Number, default: 0 },
    avgSaves: { type: Number, default: 0 },
    averageWatchTime: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    viralVideoPercentage: { type: Number, default: 0 },
    estimatedStoryViews: { type: Number, default: 0 },
    audienceAnalytics: { type: audienceAnalyticsSchema }
}, { _id: false });

const instagramAnalyticsSchema = new Schema({
    followers: { type: Number, default: 0 },
    avgViews: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    avgComments: { type: Number, default: 0 },
    avgShares: { type: Number, default: 0 },
    avgSaves: { type: Number, default: 0 },
    averageWatchTime: { type: Number, default: 0 },
    estimatedStoryViews: { type: Number, default: 0 },
    engagementMetrics: {
        likes: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        saves: { type: Number, default: 0 },
    },
}, { _id: false });

const youtubeAnalyticsSchema = new Schema({
    subscribers: { type: Number, default: 0 },
    watchHours: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    averageViewDuration: { type: Number, default: 0 },
    totalVideos: { type: Number, default: 0 },
    engagementMetrics: {
        likes: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
        shares: { type: Number, default: 0 }
    },
    audienceAnalytics: { type: audienceAnalyticsSchema }
}, { _id: false });

const socialProfileSchema = new Schema({
    platform: { type: String, enum: ["TikTok", "YouTube", "Instagram"], required: true },
    username: { type: String, required: true },
    profileLink: { type: String },
    verified: { type: Boolean, default: false },
    engagementRate: { type: Number, default: 0 },
    postingFrequency: { type: String },
    niches: [{ type: String }],
    contentStyles: [{ type: String }],
    tiktokAnalytics: { type: tiktokAnalyticsSchema },
    youtubeAnalytics: { type: youtubeAnalyticsSchema },
    instagramAnalytics: { type: instagramAnalyticsSchema },

    audience: {
        genderDistribution: {
            male: { type: Number },
            female: { type: Number }
        },
        ageDistribution: { type: Map, of: Number },
        topCountries: [{
            country: { type: String },
            percentage: { type: Number }
        }],
        interests: [{ type: String }]
    },
    audienceQuality: {
        authenticityScore: { type: Number },
        fakeFollowerPercentage: { type: Number },
        botProbability: { type: Number }
    },
    sentimentAnalysis: {
        positive: { type: Number },
        neutral: { type: Number },
        negative: { type: Number }
    },
    brandSafety: {
        score: { type: Number },
        controversyRisk: { type: Number },
        copyrightRisk: { type: Number },
        adultContentRisk: { type: Number }
    },
    collaborationHistory: {
        totalBrandDeals: { type: Number },
        repeatBrandRate: { type: Number },
        campaignCompletionRate: { type: Number }
    },
    conversionMetrics: {
        estimatedCTR: { type: Number },
        estimatedConversionRate: { type: Number },
        purchaseIntentScore: { type: Number }
    },
    aiScores: {
        influenceScore: { type: Number },
        trustScore: { type: Number },
        growthPotentialScore: { type: Number },
        roiPotentialScore: { type: Number }
    },
    aiInsights: {
        summary: { type: String },
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        recommendedBrandCategories: [{ type: String }]
    }
});

const userSchema: Schema = new Schema(
    {
        clerkId: { type: String, required: true, unique: true },
        tiktokOpenId: { type: String, sparse: true, unique: true, index: true },
        email: { type: String, required: true, unique: true },
        firstName: { type: String, default: "" },
        lastName: { type: String, default: "" },
        username: { type: String, required: true, unique: true },
        profilePicture: { type: String, default: "" },
        coverImage: { type: String, default: "" },
        tradeLicenseUrl: { type: String, default: "" },
        idVerificationUrl: { type: String, default: "" },
        bio: { type: String, default: "" },
        location: { type: String, default: "" },
        role: { type: String, enum: ['business_owner', 'advertiser', 'admin', 'super_admin'], default: 'advertiser', index: true },
        status: { type: String, enum: ['incomplete', 'pending', 'active', 'approved', 'banned', 'suspended'], default: 'incomplete' },
        isVerified: { type: Boolean, default: false },
        profileData: {
            type: Schema.Types.Mixed,
            default: {},
        },
        pendingProfileData: { type: Schema.Types.Mixed, default: null },
        pendingUpdates: { type: Schema.Types.Mixed, default: {} },
        socialProfiles: { type: [socialProfileSchema], default: [] },
        savedOpportunities: [{ type: Schema.Types.ObjectId, ref: 'Opportunity' }],
        savedCreators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        aiProfileScore: { type: Number, default: 0 },
        totalPosts: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },
        lastLogin: { type: Date },
    },
    { timestamps: true }
);

userSchema.pre('save', function (next) {
    const user = this as any;
    if (user.role === 'admin' || user.role === 'super_admin') {
        user.status = 'active';
    }

    // Compute Engagement Rate dynamically for TikTok and YouTube
    const parseNum = (val: any) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            const cleaned = val.toUpperCase().replace(/[^0-9.KMB]/g, '');
            let multiplier = 1;
            if (cleaned.endsWith('K')) multiplier = 1000;
            else if (cleaned.endsWith('M')) multiplier = 1000000;
            else if (cleaned.endsWith('B')) multiplier = 1000000000;
            const num = parseFloat(cleaned.replace(/[KMB]/g, ''));
            return isNaN(num) ? 0 : num * multiplier;
        }
        return 0;
    };

    if (user.socialProfiles && user.socialProfiles.length > 0) {
        user.socialProfiles.forEach((profile: any) => {
            if (profile.platform === 'TikTok' && profile.tiktokAnalytics) {
                const followers = parseNum(profile.followers);
                const likes = parseNum(profile.tiktokAnalytics.avgLikes);
                const comments = parseNum(profile.tiktokAnalytics.avgComments);
                const shares = parseNum(profile.tiktokAnalytics.avgShares);

                if (followers > 0) {
                    profile.engagementRate = parseFloat((((likes + comments + shares) / followers) * 100).toFixed(2));
                } else {
                    profile.engagementRate = 0;
                }
            } else if (profile.platform === 'YouTube' && profile.youtubeAnalytics) {
                const subscribers = parseNum(profile.youtubeAnalytics.subscribers || profile.followers);
                const likes = parseNum(profile.youtubeAnalytics.engagementMetrics?.likes);
                const comments = parseNum(profile.youtubeAnalytics.engagementMetrics?.comments);
                const shares = parseNum(profile.youtubeAnalytics.engagementMetrics?.shares);

                if (subscribers > 0) {
                    profile.engagementRate = parseFloat((((likes + comments + shares) / subscribers) * 100).toFixed(2));
                } else {
                    profile.engagementRate = 0;
                }
            } else if (profile.platform === 'Instagram' && profile.instagramAnalytics) {
                const followers = parseNum(profile.instagramAnalytics.followers ?? profile.followers);
                const likes = parseNum(profile.instagramAnalytics.totalLikes ?? profile.instagramAnalytics.engagementMetrics?.likes);
                const comments = parseNum(profile.instagramAnalytics.avgComments ?? profile.instagramAnalytics.engagementMetrics?.comments);
                const shares = parseNum(profile.instagramAnalytics.avgShares ?? profile.instagramAnalytics.engagementMetrics?.shares);
                const saves = parseNum(profile.instagramAnalytics.avgSaves ?? profile.instagramAnalytics.engagementMetrics?.saves);

                if (followers > 0) {
                    profile.engagementRate = parseFloat((((likes + comments + shares + saves) / followers) * 100).toFixed(2));
                } else {
                    profile.engagementRate = 0;
                }
            }
        });
    }

    next();
});

export default mongoose.model<IUser>("User", userSchema);
