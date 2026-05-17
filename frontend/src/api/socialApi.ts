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

    initiateConnection: async (api: AxiosInstance, platform: string, username: string): Promise<ApiResponse<{ verificationCode: string; expiresAt: string }>> => {
        const response = await api.post('/social/initiate', { platform, username });
        return response.data;
    },

    verifyConnection: async (api: AxiosInstance, platform: string, username: string, verificationCode: string): Promise<ApiResponse<SocialConnection>> => {
        const response = await api.post('/social/verify', { platform, username, verificationCode });
        return response.data;
    },

    syncMetrics: async (api: AxiosInstance, platform: string): Promise<ApiResponse<any>> => {
        const response = await api.post(`/social/sync/${platform}`);
        return response.data;
    },

    disconnectPlatform: async (api: AxiosInstance, platform: string): Promise<ApiResponse<any>> => {
        const response = await api.delete(`/social/disconnect/${platform}`);
        return response.data;
    },
};
