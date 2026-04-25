import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';
import { adminApi } from '../api/adminApi';

export const useAdminWalletRequests = (params?: { status?: string; search?: string }) => {
    const api = useApiClient();
    return useQuery({
        queryKey: ['adminWalletRequests', params],
        queryFn: () => adminApi.getWalletRequests(api, params).then(r => (r.data as any)?.data ?? r.data),
        staleTime: 30_000,
    });
};

export const useApproveWalletRequest = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (requestId: string) => adminApi.approveWalletRequest(api, requestId).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminWalletRequests'] });
            queryClient.invalidateQueries({ queryKey: ['adminStats'] });
        },
    });
};

export const useRejectWalletRequest = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ requestId, reason }: { requestId: string; reason?: string }) => 
            adminApi.rejectWalletRequest(api, requestId, reason).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminWalletRequests'] });
            queryClient.invalidateQueries({ queryKey: ['adminStats'] });
        },
    });
};
