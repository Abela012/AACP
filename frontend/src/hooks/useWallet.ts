import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';
import { walletApi } from '../api/walletApi';

/** Get the wallet balance for the currently authenticated user */
export const useWalletBalance = () => {
    const api = useApiClient();
    return useQuery({
        queryKey: ['walletBalance'],
        // Backend wraps all responses as { success, message, data } — extract inner data
        queryFn: () => walletApi.getBalance(api).then(r => (r.data as any)?.data ?? r.data),
        staleTime: 30_000,
    });
};

/** Admin: credit coins to a user wallet */
export const useCreditWallet = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { userId: string; amount: number; description?: string }) =>
            walletApi.credit(api, data).then(r => r.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['walletBalance'] }),
    });
};

/** Admin: approve a coin request (credit the user) */
export const useApproveRequest = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, amount }: { userId: string; amount: number }) =>
            walletApi.credit(api, { userId, amount, description: 'Approved by admin' }).then(r => r.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['walletBalance'] }),
    });
};

/** Get the transaction history for the currently authenticated user */
export const useWalletHistory = () => {
    const api = useApiClient();
    return useQuery({
        queryKey: ['walletHistory'],
        // Backend wraps responses as { success, message, data } — extract inner array
        queryFn: () => walletApi.getHistory(api).then(r => {
            const payload = (r.data as any)?.data ?? r.data;
            return Array.isArray(payload) ? payload : [];
        }),
        staleTime: 60_000,
    });
};
