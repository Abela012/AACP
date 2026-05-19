export interface GeminiRequestOptions {
    timeoutMs?: number;
    maxRetries?: number;
    temperature?: number;
}

export interface GeminiResult<T = any> {
    data: T;
    fromCache: boolean;
    latencyMs: number;
    tokenEstimate?: number;
}

export interface EngagementScoreBreakdown {
    erComponent: number;
    likesComponent: number;
    commentsComponent: number;
    sharesComponent: number;
    total: number;
}

export interface ProfileCompletenessBreakdown {
    hasBio: boolean;
    hasNiche: boolean;
    hasExperience: boolean;
    hasContentFormats: boolean;
    hasTargetAudience: boolean;
    hasSocialProfile: boolean;
    hasRateExpectations: boolean;
    hasPortfolio: boolean;
    hasProfilePicture: boolean;
    hasFollowers: boolean;
    total: number;
}

export interface AdvertiserScores {
    engagement: number;
    profileCompleteness: number;
    contentDiversity: number;
    platformReach: number;
    reputation: number;
    overall: number;
}

export interface BusinessScores {
    campaignPerformance: number;
    budgetEfficiency: number;
    marketPosition: number;
    overallHealth: number;
}

export interface CompatibilityScoreBreakdown {
    nicheOverlap: number;
    platformOverlap: number;
    engagementFit: number;
    followerFit: number;
    budgetFit: number;
    locationMatch: number;
    ratingBonus: number;
    total: number;
}

export interface AdvertiserAnalyticsResult {
    scores: AdvertiserScores;
    metrics: {
        totalFollowers: number;
        avgEngagementRate: number;
        primaryPlatform: string;
        platformCount: number;
        totalLikes: number;
        avgViews: number;
    };
    aiInsights: {
        summary: string;
        strengths: string[];
        improvements: string[];
        contentStrategy: string;
        growthPotential: 'low' | 'medium' | 'high';
        growthReasoning: string;
    } | null;
    generatedAt: Date;
    cached: boolean;
}

export interface BusinessAnalyticsResult {
    scores: BusinessScores;
    metrics: {
        totalCampaigns: number;
        completedCollabs: number;
        avgApplicantsPerCampaign: number;
        totalSpend: number;
    };
    aiInsights: {
        summary: string;
        budgetRecommendations: string[];
        idealCreatorProfile: string;
        risks: string[];
        quarterOutlook: string;
    } | null;
    generatedAt: Date;
    cached: boolean;
}

export type InsightType =
    | 'advertiser-analytics'
    | 'business-analytics'
    | 'campaign-analysis'
    | 'predictive-roi'
    | 'recommendation-insights';

export interface CacheEntry<T = any> {
    data: T;
    inputHash: string;
    createdAt: Date;
    expiresAt: Date;
    latencyMs: number;
}

export const PII_FIELDS: string[] = [
    'email', 'password', 'phoneNumber', 'clerkId',
    'tradeLicenseUrl', 'idVerificationUrl', 'businessEmail',
    'bankAccount', 'walletAddress', 'sessionToken', 'ipAddress',
    'pendingUpdates', 'pendingProfileData', '__v', '_id', 'userId',
];
