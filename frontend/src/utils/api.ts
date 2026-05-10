import { useAuth } from "@clerk/clerk-react";
import axios, { type AxiosInstance } from "axios";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://aacp.onrender.com/api/v1";


export const createApiClient = (
    getToken: () => Promise<string | null>
): AxiosInstance => {
    const api = axios.create({ baseURL: API_BASE_URL });

    api.interceptors.request.use(async (config) => {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers["X-Client-Platform"] = "Web";
        return config;
    });


    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (!import.meta.env.DEV) {

                if (error.config) delete error.config;
                if (error.request) delete error.request;
                if (error.response?.config) delete error.response.config;
                if (error.response?.request) delete error.response.request;
            }
            return Promise.reject(error);
        }
    );

    return api;
};


export const useApiClient = (): AxiosInstance => {
    const { getToken } = useAuth();
    return createApiClient(getToken);
};

// User API definitions based on backend/src/modules/User
export const userApi = {
    syncUser: (api: AxiosInstance, role?: string) => api.post("/users/sync", { role }),
    getCurrentUser: (api: AxiosInstance) => api.get("/users/me"),
    updateProfile: (api: AxiosInstance, data: Record<string, unknown>) =>
        api.put("/users/profile", data),
    uploadProfilePicture: (api: AxiosInstance, file: File, type: 'profile' | 'cover' | 'license' = 'profile') => {
        const formData = new FormData();
        formData.append("image", file);

        return api.post(`/users/profile/picture?type=${type}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
};

// Opportunity API based on backend/src/modules/opportunities
export const opportunityApi = {
    getAll: (api: AxiosInstance) => api.get("/opportunities"),
    getById: (api: AxiosInstance, id: string) => api.get(`/opportunities/${id}`),
    create: (api: AxiosInstance, data: Record<string, unknown>) => api.post("/opportunities", data),
};

// Applications API based on backend/src/modules/applications
export const applicationApi = {
    getMyApplications: (api: AxiosInstance) => api.get("/applications/my"),
    apply: (api: AxiosInstance, opportunityId: string, data: Record<string, unknown>) =>
        api.post(`/applications/apply/${opportunityId}`, data),
};

// Wallet API based on backend/src/modules/wallet
export const walletApi = {
    getBalance: (api: AxiosInstance) => api.get("/wallet/balance"),
    getTransactions: (api: AxiosInstance) => api.get("/wallet/transactions"),
};
