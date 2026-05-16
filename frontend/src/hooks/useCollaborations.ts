import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';
import { collaborationApi, type Collaboration } from '../api/collaborationApi';

/** All collaborations for a specific user */
export const useUserCollaborations = (userId: string) => {
    const api = useApiClient();
    return useQuery<Collaboration[]>({
        queryKey: ['collaborations', 'user', userId],
        queryFn: () => collaborationApi.getForUser(api, userId).then(r => r.data.data),
        enabled: !!userId,
        staleTime: 30_000,
    });
};

/** Get specific collaboration details */
export const useCollaborationDetails = (id: string) => {
    const api = useApiClient();
    return useQuery<Collaboration>({
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

/** Add task to collaboration */
export const useAddTask = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, task }: { id: string; task: any }) => collaborationApi.addTask(api, id, task).then(r => r.data),
        onSuccess: (data) => {
            if (data?.data?._id) {
                queryClient.invalidateQueries({ queryKey: ['collaborations', data.data._id] });
            }
        },
    });
};

/** Update task status */
export const useUpdateTask = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, taskId, status }: { id: string; taskId: string; status: string }) => 
            collaborationApi.updateTask(api, id, taskId, status).then(r => r.data),
        onSuccess: (data) => {
            if (data?.data?._id) {
                queryClient.invalidateQueries({ queryKey: ['collaborations', data.data._id] });
            }
        },
    });
};

/** Submit deliverable */
export const useSubmitDeliverable = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, deliverable, onProgress }: { id: string; deliverable: any; onProgress?: (p: number) => void }) => 
            collaborationApi.submitDeliverable(api, id, deliverable, onProgress).then(r => r.data),
        onSuccess: (data) => {
            if (data?.data?._id) {
                queryClient.invalidateQueries({ queryKey: ['collaborations', data.data._id] });
            }
        },
    });
};

/** Review deliverable */
export const useReviewDeliverable = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, submissionId, review }: { id: string; submissionId: string; review: { status: string; feedback: string } }) => 
            collaborationApi.reviewDeliverable(api, id, submissionId, review).then(r => r.data),
        onSuccess: (data) => {
            if (data?.data?._id) {
                queryClient.invalidateQueries({ queryKey: ['collaborations', data.data._id] });
            }
        },
    });
};
