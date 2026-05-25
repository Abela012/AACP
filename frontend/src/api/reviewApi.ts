import type { AxiosInstance } from 'axios';

export interface Review {
    _id: string;
    opportunityId: string;
    reviewerId: string;
    targetUserId: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export const reviewApi = {
    /** POST /reviews — Submit a review */
    create: (api: AxiosInstance, data: { targetUserId: string; opportunityId: string; rating: number; comment: string; collaborationId?: string; }) =>
        api.post<{ data: Review }>('/reviews', data),

    /** GET /reviews/collaboration/:id — Get reviews for a collaboration */
    getByCollaboration: (api: AxiosInstance, collaborationId: string) =>
        api.get<{ data: Review[] }>(`/reviews/collaboration/${collaborationId}`),

    /** GET /reviews/user/:id — Get reviews received by a user */
    getByUser: (api: AxiosInstance, userId: string) =>
        api.get<{ data: Review[] }>(`/reviews/user/${userId}`),

    /** GET /reviews/my-sent — Get reviews sent by the current user */
    getMySent: (api: AxiosInstance) =>
        api.get<{ data: Review[] }>('/reviews/my-sent'),
};
