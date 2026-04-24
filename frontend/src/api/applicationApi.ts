import type { AxiosInstance } from 'axios';

export interface Application {
    _id: string;
    opportunity: string | { _id: string; title: string };
    applicant: string | { _id: string; firstName: string; lastName: string; profilePicture?: string; email: string };
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    coverLetter?: string;
    createdAt: string;
    updatedAt: string;
}

export const applicationApi = {
    /** POST /applications — Advertiser applies to an opportunity */
    apply: (api: AxiosInstance, data: { opportunity: string; coverLetter?: string }) =>
        api.post<{ application: Application }>('/applications', data),

    /** DELETE /applications/:id — Withdraw an application */
    withdraw: (api: AxiosInstance, id: string) =>
        api.delete(`/applications/${id}`),

    /** GET /applications/opportunity/:id — All applications for a given opportunity */
    getByOpportunity: (api: AxiosInstance, opportunityId: string) =>
        api.get<{ data: Application[] }>(`/applications/opportunity/${opportunityId}`),

    /** GET /applications/business-owner — All applications for all opportunities owned by the logged-in business owner */
    getForBusinessOwner: (api: AxiosInstance) =>
        api.get<{ data: Application[] }>('/applications/business-owner'),

    /** GET /applications/user/:id — All applications by an advertiser */
    getByUser: (api: AxiosInstance, userId: string) =>
        api.get<{ applications: Application[] }>(`/applications/user/${userId}`),

    /** PUT /applications/:id/accept */
    accept: (api: AxiosInstance, id: string) =>
        api.put<{ application: Application }>(`/applications/${id}/accept`),

    /** PUT /applications/:id/reject */
    reject: (api: AxiosInstance, id: string) =>
        api.put<{ application: Application }>(`/applications/${id}/reject`),
};
