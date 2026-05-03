import type { AxiosInstance } from 'axios';

export interface RecommendationItem {
    targetId: string;
    type: 'advertiser' | 'opportunity';
    score: number;
    name: string;
    category?: string;
    location?: string;
    meta?: Record<string, any>;
}

export interface RecommendationResult {
    recommendations: RecommendationItem[];
    userRole: string;
    generatedAt: string;
}

export const recommendationApi = {
    /** GET /recommendations — personalized recommendations for the authenticated user */
    getRecommendations: async (api: AxiosInstance) => {
        try {
            return await api.get<{ success: boolean; data: RecommendationResult }>('/recommendations');
        } catch (error) {
            console.warn('GetRecommendations API call failed:', error);
            throw error;
        }
    },
};
