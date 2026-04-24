import type { AxiosInstance } from 'axios';

export interface Opportunity {
    _id: string;
    title: string;
    description: string;
    budget: {
        amount: number;
        currency: string;
    };
    category: string;
    platforms?: string[];
    deliverables?: string[];
    requirements?: {
        minFollowers?: number;
        preferredNiches?: string[];
        location?: string;
    };
    maxApplicants?: number;
    deadline?: string;
    status: 'draft' | 'open' | 'closed' | 'in_progress' | 'in_review' | 'completed' | 'cancelled';
    owner: string | { _id: string; firstName: string; lastName: string; profilePicture?: string };
    applicants?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface OpportunitiesResponse {
    opportunities: Opportunity[];
    total: number;
    page: number;
    pages: number;
}

export const opportunityApi = {
    /** GET /opportunities — Public listing */
    getAll: (api: AxiosInstance, params?: { page?: number; limit?: number; category?: string }) =>
        api.get<OpportunitiesResponse>('/opportunities', { params }),

    /** GET /opportunities/:id */
    getById: (api: AxiosInstance, id: string) =>
        api.get<{ opportunity: Opportunity }>(`/opportunities/${id}`),

    /** GET /opportunities/user/:userId — Opportunities by a business owner */
    getByUser: (api: AxiosInstance, userId: string) =>
        api.get<OpportunitiesResponse>(`/opportunities/user/${userId}`),

    /** POST /opportunities — Business owner creates a new opportunity */
    create: (api: AxiosInstance, data: Partial<Opportunity>) =>
        api.post<{ opportunity: Opportunity }>('/opportunities', data),

    /** PUT /opportunities/:id */
    update: (api: AxiosInstance, id: string, data: Partial<Opportunity>) =>
        api.put<{ opportunity: Opportunity }>(`/opportunities/${id}`, data),

    /** DELETE /opportunities/:id */
    remove: (api: AxiosInstance, id: string) =>
        api.delete(`/opportunities/${id}`),
};
