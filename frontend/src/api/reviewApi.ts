import type { AxiosInstance } from 'axios';

export interface Review {
    _id: string;
    collaboration: string;
    reviewer: string;
    reviewee: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export const reviewApi = {
    /** POST /reviews — Submit a review */
    create: (api: AxiosInstance, data: { collaborationId: string; rating: number; comment: string }) =>
        api.post<{ data: Review }>('/reviews', data),

    /** GET /reviews/collaboration/:id — Get reviews for a collaboration */
    getByCollaboration: (api: AxiosInstance, collaborationId: string) =>
        api.get<{ data: Review[] }>(`/reviews/collaboration/${collaborationId}`),

    /** GET /reviews/user/:id — Get reviews received by a user */
    getByUser: (api: AxiosInstance, userId: string) =>
        api.get<{ data: Review[] }>(`/reviews/user/${userId}`),
};
