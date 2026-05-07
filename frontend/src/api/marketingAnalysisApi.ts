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
}

export interface MarketingAnalysisResult {
    summary: string;
    totalApplicants: number;
    bestChoice: ApplicantAnalysis | null;
    analysis: ApplicantAnalysis[];
    aiInsights: {
        poolQuality: string;
        selectionReasoning: string;
        risks: string[];
        strategicAdvice: string;
        suggestedNextSteps: string;
        marketFitScore: number;
    } | null;
    opportunityTitle: string;
    opportunityCategory: string;
    opportunityBudget: number;
    generatedAt: string;
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
            return await api.get<{ success: boolean; data: any }>(
                `/marketing-analysis/predict/${advertiserId}`
            );
        } catch (error) {
            console.warn('Predictive Analysis API call failed:', error);
            throw error;
        }
    },
};
