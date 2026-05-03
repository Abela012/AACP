import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';
import { collaborationApi, type Collaboration } from '../api/collaborationApi';

/** All collaborations for a specific user */
export const useUserCollaborations = (userId: string) => {
    const api = useApiClient();
    return useQuery({
        queryKey: ['collaborations', 'user', userId],
        queryFn: () => collaborationApi.getForUser(api, userId).then(r => r.data.data),
        enabled: !!userId,
        staleTime: 30_000,
    });
};

/** Get specific collaboration details */
export const useCollaborationDetails = (id: string) => {
    const api = useApiClient();
    return useQuery({
        queryKey: ['collaborations', id],
        queryFn: () => collaborationApi.getById(api, id).then(r => r.data.data),
        enabled: !!id,
    });
};

/** Start a collaboration from an accepted application */
export const useStartCollaboration = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (applicationId: string) => collaborationApi.start(api, applicationId).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['collaborations'] });
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
    });
};

/** Mark a collaboration as completed */
export const useCompleteCollaboration = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => collaborationApi.complete(api, id).then(r => r.data),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['collaborations'] });
            // Invalidate the specific collaboration detail if needed
            if (data?.data?._id) {
                queryClient.invalidateQueries({ queryKey: ['collaborations', data.data._id] });
            }
        },
    });
};

/** Add a milestone to a collaboration */
export const useAddMilestone = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { title: string; description?: string; dueDate?: string } }) =>
            collaborationApi.addMilestone(api, id, data).then(r => r.data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['collaborations', id] });
        },
    });
};

/** Submit a deliverable for a milestone */
export const useSubmitDeliverable = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, milestoneId, data }: { id: string; milestoneId: string; data: { fileUrl: string; fileName?: string; notes?: string } }) =>
            collaborationApi.submitDeliverable(api, id, milestoneId, data).then(r => r.data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['collaborations', id] });
        },
    });
};

/** Review a submission */
export const useReviewSubmission = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, milestoneId, submissionId, data }: { id: string; milestoneId: string; submissionId: string; data: { status: 'approved' | 'revision_requested' | 'rejected'; feedback?: string } }) =>
            collaborationApi.reviewSubmission(api, id, milestoneId, submissionId, data).then(r => r.data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['collaborations', id] });
        },
    });
};
