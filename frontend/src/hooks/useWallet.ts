import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';
import { walletApi } from '../api/walletApi';

/** Stored when Chapa checkout is started so we can verify payment after redirect back. */
export const CHAPA_PENDING_TX_KEY = 'chapa_pending_tx_ref';

/** After redirect from Chapa, verify payment and refresh wallet balance/history if `tx_ref` is in URL or sessionStorage holds a pending tx. */
export const useFinalizeChapaTopupOnReturn = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const fromUrl =
            params.get('trx_ref') ?? params.get('tx_ref') ?? params.get('txn_ref');
        let fromStorage: string | null = null;
        try {
            fromStorage = sessionStorage.getItem(CHAPA_PENDING_TX_KEY);
        } catch {
            /* private mode etc. */
        }
        const txRef = (fromUrl || fromStorage || '').trim();
        if (!txRef) return;

        let cancelled = false;

        walletApi.verifyChapaTopup(api, { txRef }).then(
            () => {
                if (cancelled) return;
                try {
                    sessionStorage.removeItem(CHAPA_PENDING_TX_KEY);
                } catch {
                    /* noop */
                }
                void queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
                void queryClient.invalidateQueries({ queryKey: ['walletHistory'] });
                params.delete('trx_ref');
                params.delete('tx_ref');
                params.delete('txn_ref');
                const q = params.toString();
                const path = `${window.location.pathname}${q ? `?${q}` : ''}`;
                window.history.replaceState({}, '', path);
            },
            () => {
                /* verify can fail briefly while Chapa finalizes — user can refresh; pending key kept */
            }
        );

        return () => {
            cancelled = true;
        };
    }, [api, queryClient]);
};

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
