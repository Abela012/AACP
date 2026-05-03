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
}

export interface MarketingAnalysisResult {
    summary: string;
    totalApplicants: number;
    bestChoice: ApplicantAnalysis | null;
    analysis: ApplicantAnalysis[];
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
};
