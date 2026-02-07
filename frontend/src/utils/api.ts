import { useAuth } from "@clerk/clerk-react";
import axios, { type AxiosInstance } from "axios";

// Using the backend port (5000) and the v1 prefix defined in app.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

// Create an authenticated API instance that includes the Clerk token
export const createApiClient = (
    getToken: () => Promise<string | null>
): AxiosInstance => {
    const api = axios.create({ baseURL: API_BASE_URL });

    api.interceptors.request.use(async (config) => {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Custom User-Agent if needed
        config.headers["X-Client-Platform"] = "Web";
        return config;
    });

    return api;
};

// Hook to obtain a configured API client
export const useApiClient = (): AxiosInstance => {
    const { getToken } = useAuth();
    return createApiClient(getToken);
};

// User API definitions based on backend/src/modules/User
export const userApi = {
    syncUser: (api: AxiosInstance) => api.post("/users/sync"),
    getCurrentUser: (api: AxiosInstance) => api.get("/users/me"),
    updateProfile: (api: AxiosInstance, data: any) =>
        api.put("/users/profile", data),
    uploadProfilePicture: (api: AxiosInstance, file: File) => {
        const formData = new FormData();
        formData.append("image", file);

        return api.post("/users/profile/picture", formData, {
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
    create: (api: AxiosInstance, data: any) => api.post("/opportunities", data),
};

// Applications API based on backend/src/modules/applications
export const applicationApi = {
    getMyApplications: (api: AxiosInstance) => api.get("/applications/my"),
    apply: (api: AxiosInstance, opportunityId: string, data: any) =>
        api.post(`/applications/apply/${opportunityId}`, data),
};

// Wallet API based on backend/src/modules/wallet
export const walletApi = {
    getBalance: (api: AxiosInstance) => api.get("/wallet/balance"),
    getTransactions: (api: AxiosInstance) => api.get("/wallet/transactions"),
};
