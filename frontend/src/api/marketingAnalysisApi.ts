import type { AxiosInstance } from 'axios';

export interface ApplicantAnalysis {
    advertiserId: string;
    advertiserName: string;
    profilePicture?: string;
    followers: number;
    engagementRate: number;
    niche: string;
    cost: number;
    currency: string;
    estimatedReach: number;
    estimatedEngagement: number;
    estimatedConversions: number;
    estimatedRevenue: number;
    profit: number;
    profitPercentage: number;
    profitable: boolean;
    aiInsight?: string;
    aiMatchScore?: number;
    // Advanced Metrics
    platforms: string[];
    primaryPlatform: string;
    contentStyle: string;
    avgViews: number;
    totalLikes: number;
    avgComments: number;
    avgShares: number;
    audienceCountry?: string;
    audienceAgeRange?: string;
    audienceGender?: string;
}

export interface MarketingAnalysisResult {
    summary: string;
    totalApplicants: number;
    bestChoice: ApplicantAnalysis | null;
    analysis: ApplicantAnalysis[];
    aiInsights: {
        businessOutcome: {
            expectedCampaignOutcome: string;
            estimatedBusinessImpact: string;
            budgetEfficiency: string;
            audienceMatchQuality: string;
            overallProfitability: string;
        };
        overallAnalysis: {
            poolQuality: string;
            competitionLevel: string;
            marketFit: string;
            strategicRecommendation: string;
        };
        topRecommendations: {
            bestOverallChoice: { advertiserId: string; reason: string };
            safestInvestment: { advertiserId: string; reason: string };
            highestGrowthPotential: { advertiserId: string; reason: string };
            bestROI: { advertiserId: string; reason: string };
        };
        risks: string[];
    } | null;
    opportunityTitle: string;
    opportunityCategory: string;
    opportunityBudget: number;
    generatedAt: string;
}

export interface PredictiveAnalysisResult {
    summary: string;
    metrics: {
        followers: number;
        reach: number;
        engagementRate: number;
        conversionRate: number;
        estimatedConversions: number;
        revenue: number;
        avgProductPrice: number;
        cost: number;
        avgViews: number;
        totalLikes: number;
        avgComments: number;
        avgShares: number;
    };
    projections: {
        month: string;
        reach: number;
        conversions: number;
        revenue: number;
        profit: number;
    }[];
    aiInsight: string;
    niche: string;
    platforms: string[];
    primaryPlatform: string;
    contentStyle: string;
    profitable: boolean;
    profit: number;
    roi: number;
    audienceInfo: {
        topCountry: string;
        ageRange: string;
        gender: string;
    };
    // True when backend analysis used fallback/default metrics instead of synced platform data
    usesMockData?: boolean;
}

export const marketingAnalysisApi = {
    /** GET /marketing-analysis/:opportunityId */
    getAnalysis: async (
        api: AxiosInstance,
        opportunityId: string,
        options?: { conversionRate?: number; avgProductPrice?: number }
    ) => {
        try {
            return await api.get<{ success: boolean; data: MarketingAnalysisResult }>(
                `/marketing-analysis/${opportunityId}`,
                { params: options }
            );
        } catch (error) {
            console.warn('Marketing Analysis API call failed:', error);
            throw error;
        }
    },
    
    /** GET /marketing-analysis/predict/:advertiserId */
    getPredictiveAnalysis: async (api: AxiosInstance, advertiserId: string) => {
        try {
            return await api.get<{ success: boolean; data: PredictiveAnalysisResult }>(
                `/marketing-analysis/predict/${advertiserId}`
            );
        } catch (error) {
            console.warn('Predictive Analysis API call failed:', error);
            throw error;
        }
    },
};
