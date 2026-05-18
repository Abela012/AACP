import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';
import { walletApi } from '../api/walletApi';

/** Stored when Chapa checkout is started so we can verify payment after redirect back. */
export const CHAPA_PENDING_TX_KEY = 'chapa_pending_tx_ref';
export const CHAPA_PENDING_PACK_KEY = 'chapa_pending_pack';
export const CHAPA_RECEIPT_KEY = 'chapa_payment_receipt';
const chapaVerifiedKey = (txRef: string) => `chapa_verified_${txRef}`;

/** How long the payment receipt stays visible before auto-dismiss (ms). */
export const CHAPA_RECEIPT_DISPLAY_MS = 45_000;

export type ChapaPaymentReceipt = {
    txRef: string;
    coins: number;
    priceEtb: number;
    title?: string;
    verifiedAt: string;
};

export const useChapaPaymentReceipt = () => {
    const [receipt, setReceipt] = useState<ChapaPaymentReceipt | null>(null);

    const loadReceipt = useCallback(() => {
        try {
            const raw = sessionStorage.getItem(CHAPA_RECEIPT_KEY);
            if (!raw) {
                setReceipt(null);
                return;
            }
            setReceipt(JSON.parse(raw) as ChapaPaymentReceipt);
        } catch {
            setReceipt(null);
        }
    }, []);

    useEffect(() => {
        loadReceipt();
        const onReceiptUpdate = () => loadReceipt();
        window.addEventListener('chapa-receipt-updated', onReceiptUpdate);
        return () => window.removeEventListener('chapa-receipt-updated', onReceiptUpdate);
    }, [loadReceipt]);

    const dismissReceipt = useCallback(() => {
        try {
            sessionStorage.removeItem(CHAPA_RECEIPT_KEY);
        } catch {
            /* noop */
        }
        setReceipt(null);
    }, []);

    useEffect(() => {
        if (!receipt) return;
        const timer = window.setTimeout(dismissReceipt, CHAPA_RECEIPT_DISPLAY_MS);
        return () => window.clearTimeout(timer);
    }, [receipt, dismissReceipt]);

    return { receipt, dismissReceipt };
};

/** After redirect from Chapa, verify payment and refresh wallet balance/history. */
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

        try {
            if (sessionStorage.getItem(chapaVerifiedKey(txRef)) === '1') {
                params.delete('trx_ref');
                params.delete('tx_ref');
                params.delete('txn_ref');
                const q = params.toString();
                const path = `${window.location.pathname}${q ? `?${q}` : ''}`;
                window.history.replaceState({}, '', path);
                return;
            }
        } catch {
            /* noop */
        }

        let cancelled = false;

        walletApi.verifyChapaTopup(api, { txRef }).then(
            (res) => {
                if (cancelled) return;

                const payload = (res.data as { data?: Record<string, unknown> })?.data ?? res.data;
                const verified = payload?.verified === true;

                try {
                    sessionStorage.removeItem(CHAPA_PENDING_TX_KEY);
                } catch {
                    /* noop */
                }

                let packMeta: { coins?: number; priceEtb?: number; title?: string } = {};
                try {
                    const rawPack = sessionStorage.getItem(CHAPA_PENDING_PACK_KEY);
                    if (rawPack) packMeta = JSON.parse(rawPack);
                    sessionStorage.removeItem(CHAPA_PENDING_PACK_KEY);
                } catch {
                    /* noop */
                }

                if (verified) {
                    try {
                        sessionStorage.setItem(chapaVerifiedKey(txRef), '1');
                    } catch {
                        /* noop */
                    }

                    const chapa = (payload?.chapa as Record<string, unknown>) || {};
                    const coins =
                        Number((payload as { coinsCredited?: number }).coinsCredited) ||
                        Number(packMeta.coins) ||
                        0;
                    const priceEtb =
                        Number(packMeta.priceEtb) ||
                        Number(chapa.amount) ||
                        0;

                    try {
                        sessionStorage.setItem(
                            CHAPA_RECEIPT_KEY,
                            JSON.stringify({
                                txRef,
                                coins,
                                priceEtb,
                                title: packMeta.title,
                                verifiedAt: new Date().toISOString(),
                            } satisfies ChapaPaymentReceipt)
                        );
                    } catch {
                        /* noop */
                    }
                    window.dispatchEvent(new CustomEvent('chapa-receipt-updated'));
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

export const useManualPaymentInstructions = () => {
    const api = useApiClient();
    return useQuery({
        queryKey: ['manualPaymentInstructions'],
        queryFn: () =>
            walletApi.getManualPaymentInstructions(api).then((r) => {
                const payload = (r.data as { data?: Record<string, string> })?.data ?? r.data;
                return payload as {
                    bankName: string;
                    accountName: string;
                    accountNumber: string;
                    telebirrMerchantName: string;
                    telebirrNumber: string;
                    processingNote?: string;
                };
            }),
        staleTime: 120_000,
    });
};

/** Get the transaction history for the currently authenticated user */
export const useWalletHistory = () => {
    const api = useApiClient();
    return useQuery({
        queryKey: ['walletHistory'],
        queryFn: () => walletApi.getHistory(api).then(r => {
            const payload = (r.data as any)?.data ?? r.data;
            return Array.isArray(payload) ? payload : [];
        }),
        staleTime: 60_000,
    });
};
