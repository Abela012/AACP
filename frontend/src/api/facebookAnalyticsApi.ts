import type { AxiosInstance } from 'axios';

/* ─── Types ─── */

export interface FacebookPage {
    pageId: string;
    name: string;
    category?: string;
    followers: number;
    fans: number;
    picture?: string;
}

export interface PageInsight {
    pageId: string;
    pageName: string;
    fans: number;
    followers: number;
    impressions: number;
    reach: number;
    engagedUsers: number;
    postEngagements: number;
    pageViewsTotal: number;
    fetchedAt: string;
}

export interface AnalyticsConnectionStatus {
    isConnected: boolean;
    status?: 'connected' | 'expired' | 'revoked' | 'error';
    pages: FacebookPage[];
    scopes?: string[];
    lastSyncedAt?: string;
    tokenExpiresAt?: string;
}

export interface AnalyticsInsightsResponse {
    insights: PageInsight[];
    lastSyncedAt?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errorCode?: string;
}

/* ─── API Functions ─── */

export const facebookAnalyticsApi = {
    /**
     * Initiate the Facebook Analytics OAuth flow.
     * Returns the Facebook authorization URL to redirect the user to.
     */
    initiateAuth: async (api: AxiosInstance): Promise<ApiResponse<{ authUrl: string }>> => {
        const response = await api.get('/auth/facebook/analytics/login');
        return response.data;
    },

    /**
     * Get connected Facebook Pages and connection status.
     */
    getPages: async (api: AxiosInstance): Promise<ApiResponse<AnalyticsConnectionStatus>> => {
        const response = await api.get('/api/facebook/pages');
        return response.data;
    },

    /**
     * Get page insights/analytics data.
     * @param refresh - Force refresh from Facebook API
     * @param pageId - Optional specific page ID
     */
    getInsights: async (
        api: AxiosInstance,
        options?: { refresh?: boolean; pageId?: string }
    ): Promise<ApiResponse<AnalyticsInsightsResponse>> => {
        const params: Record<string, string> = {};
        if (options?.refresh) params.refresh = 'true';
        if (options?.pageId) params.pageId = options.pageId;

        const response = await api.get('/api/facebook/insights', { params });
        return response.data;
    },

    /**
     * Disconnect Facebook Analytics.
     */
    disconnect: async (api: AxiosInstance): Promise<ApiResponse<null>> => {
        const response = await api.delete('/api/facebook/disconnect');
        return response.data;
    },
};
