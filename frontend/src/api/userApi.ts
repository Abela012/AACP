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
    submitProfile: async (api: AxiosInstance, data: any) => {
        try {
            return await api.post('/users/submit', data);
        } catch (error) {
            console.warn('SubmitProfile API call failed:', error);
            throw error;
        }
    },
    getMe: async (api: AxiosInstance) => {
        try {
            return await api.get('/users/me');
        } catch (error: any) {
            if (error?.response?.status !== 404) {
                console.warn('GetMe API call failed:', error);
            }
            throw error;
        }
    },
    uploadProfilePicture: async (api: AxiosInstance, file: File) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            return await api.post('/users/profile/picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        } catch (error) {
            console.warn('UploadProfilePicture API call failed:', error);
            throw error;
        }
    },
    toggleSave: async (api: AxiosInstance, opportunityId: string) => {
        try {
            return await api.post('/users/toggle-save', { opportunityId });
        } catch (error) {
            console.warn('ToggleSave API call failed:', error);
            throw error;
        }
    },
    getSavedOpportunities: async (api: AxiosInstance) => {
        try {
            return await api.get('/users/saved-opportunities');
        } catch (error) {
            console.warn('GetSavedOpportunities API call failed:', error);
            throw error;
        }
    },
    toggleCreator: async (api: AxiosInstance, creatorId: string) => {
        try {
            return await api.post('/users/toggle-creator', { creatorId });
        } catch (error) {
            console.warn('ToggleCreator API call failed:', error);
            throw error;
        }
    },
    getSavedCreators: async (api: AxiosInstance) => {
        try {
            return await api.get('/users/saved-creators');
        } catch (error) {
            console.warn('GetSavedCreators API call failed:', error);
            throw error;
        }
    },
};
