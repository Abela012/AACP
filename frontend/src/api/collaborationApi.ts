import type { AxiosInstance } from 'axios';

export interface Collaboration {
    _id: string;
    opportunity: any;
    application: any;
    businessOwner: any;
    advertiser: any;
    status: 'active' | 'on_hold' | 'completed' | 'cancelled' | 'disputed';
    agreedBudget: {
        amount: number;
        currency: string;
    };
    startDate: string;
    completedDate?: string;
    overallProgress: number;
    tasks: any[];
    deliverables: any[];
    activities: any[];
    createdAt: string;
    updatedAt: string;
}

export const collaborationApi = {
    /** GET /collaborations/user/:userId — Get all collaborations for a user */
    getForUser: (api: AxiosInstance, userId: string) =>
        api.get<{ data: Collaboration[] }>(`/collaborations/user/${userId}`),

    /** GET /collaborations/:id — Get collaboration details */
    getById: (api: AxiosInstance, id: string) =>
        api.get<{ data: Collaboration }>(`/collaborations/${id}`),

    /** POST /collaborations/start — Start a collaboration */
    start: (api: AxiosInstance, applicationId: string) =>
        api.post<{ data: Collaboration }>('/collaborations/start', { applicationId }),

    /** PUT /collaborations/:id/complete — Mark as completed */
    complete: (api: AxiosInstance, id: string) =>
        api.put<{ data: Collaboration }>(`/collaborations/${id}/complete`),
};
