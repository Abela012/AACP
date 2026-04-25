import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';
import { adminApi } from '../api/adminApi';

export const useAdminDisputes = (params?: { status?: string; search?: string }) => {
    const api = useApiClient();
    return useQuery({
        queryKey: ['adminDisputes', params],
        queryFn: () => adminApi.getDisputes(api, params).then(r => (r.data as any)?.data ?? r.data),
        staleTime: 30_000,
    });
};

export const useResolveDispute = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ disputeId, reason }: { disputeId: string; reason: string }) => 
            adminApi.resolveDispute(api, disputeId, reason).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminDisputes'] });
        },
    });
};

export const useEscalateDispute = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (disputeId: string) => 
            adminApi.escalateDispute(api, disputeId).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminDisputes'] });
        },
    });
};
