import type { AxiosInstance } from 'axios';

export interface SocialConnection {
    platform: 'facebook' | 'instagram' | 'tiktok';
    isConnected: boolean;
    status: 'pending' | 'approved' | 'rejected' | 'none';
    expiresAt?: string;
    metadata?: any;
    lastSyncedAt?: string;
    createdAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const socialApi = {
    getConnections: async (api: AxiosInstance): Promise<ApiResponse<SocialConnection[]>> => {
        const response = await api.get('/social/connections');
        return response.data;
    },

    initiateAuth: async (api: AxiosInstance, platform: string, redirectUri?: string): Promise<ApiResponse<{ authUrl: string }>> => {
        const response = await api.get(`/social/initiate/${platform}`, {
            params: { redirect_uri: redirectUri }
        });
        return response.data;
    },

    /**
     * Connect a social platform using an access token directly.
     * No OAuth redirect needed — just pass the token.
     */
    connectWithToken: async (api: AxiosInstance, platform: string, accessToken: string): Promise<ApiResponse<SocialConnection>> => {
        const response = await api.post(`/social/connect/${platform}`, {
            access_token: accessToken,
        });
        return response.data;
    },

    disconnectPlatform: async (api: AxiosInstance, platform: string): Promise<ApiResponse<any>> => {
        const response = await api.delete(`/social/disconnect/${platform}`);
        return response.data;
    },
};
