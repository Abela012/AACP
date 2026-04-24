import type { AxiosInstance } from 'axios';

// Sync current Clerk user with our backend database
export const userApi = {
    syncUser: async (api: AxiosInstance, role?: string) => {
        // Here we'd normally call a backend route to sync the user.
        // Assuming /api/users/sync exists
        try {
            return await api.post('/users/sync', { role });
        } catch (error) {
            console.warn('SyncUser API call failed:', error);
            throw error;
        }
    },
    updateProfile: async (api: AxiosInstance, data: any) => {
        try {
            return await api.put('/users/profile', data);
        } catch (error) {
            console.warn('UpdateProfile API call failed:', error);
            throw error;
        }
    },
    getMe: async (api: AxiosInstance) => {
        try {
            return await api.get('/users/me');
        } catch (error) {
            console.warn('GetMe API call failed:', error);
            throw error;
        }
    }
};
