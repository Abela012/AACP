import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';
import { reviewApi, type Review } from '../api/reviewApi';

/** Get reviews for a specific collaboration */
export const useCollaborationReviews = (collaborationId: string) => {
    const api = useApiClient();
    return useQuery({
        queryKey: ['reviews', 'collaboration', collaborationId],
        queryFn: () => reviewApi.getByCollaboration(api, collaborationId).then(r => r.data.data),
        enabled: !!collaborationId,
    });
};

/** Get reviews received by a user */
export const useUserReviews = (userId: string) => {
    const api = useApiClient();
    return useQuery({
        queryKey: ['reviews', 'user', userId],
        queryFn: () => reviewApi.getByUser(api, userId).then(r => r.data.data),
        enabled: !!userId,
    });
};

/** Submit a review */
export const useSubmitReview = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { targetUserId: string; opportunityId: string; rating: number; comment: string; collaborationId?: string; }) =>
            reviewApi.create(api, data).then(r => r.data),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            // Also invalidate user sync to get updated rating
            queryClient.invalidateQueries({ queryKey: ['user-sync'] });
            queryClient.invalidateQueries({ queryKey: ['my-sent-reviews'] });
        },
    });
};

/** Get reviews sent by the current user */
export const useMySentReviews = () => {
    const api = useApiClient();
    return useQuery({
        queryKey: ['my-sent-reviews'],
        queryFn: () => reviewApi.getMySent(api).then(r => r.data.data),
    });
};
