import type { AxiosInstance } from 'axios';

export interface WalletBalance {
    balance: number;
    lockedBalance: number;
    availableBalance: number;
    currency: string;
}

export interface WalletTransaction {
    _id: string;
    type: 'credit' | 'debit' | 'lock' | 'unlock';
    amount: number;
    description?: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
}

export interface ChapaInitializeResponse {
    txRef: string;
    checkoutUrl: string;
    transaction: {
        _id: string;
        status: 'pending' | 'completed' | 'failed';
    };
}

export const walletApi = {
    /** POST /wallet — Create wallet for a user */
    create: (api: AxiosInstance) =>
        api.post<{ wallet: WalletBalance }>('/wallet'),

    /** GET /wallet/balance */
    getBalance: (api: AxiosInstance) =>
        api.get<WalletBalance>('/wallet/balance'),

    /** POST /wallet/credit — Admin: add coins to a wallet */
    credit: (api: AxiosInstance, data: { userId: string; amount: number; description?: string }) =>
        api.post<WalletBalance>('/wallet/credit', data),

    /** POST /wallet/debit — Deduct coins from wallet */
    debit: (api: AxiosInstance, data: { amount: number; description?: string }) =>
        api.post<WalletBalance>('/wallet/debit', data),

    /** POST /wallet/lock — Admin: lock coins */
    lock: (api: AxiosInstance, data: { userId: string; amount: number }) =>
        api.post<WalletBalance>('/wallet/lock', data),

    /** POST /wallet/unlock — Admin: unlock coins */
    unlock: (api: AxiosInstance, data: { userId: string; amount: number }) =>
        api.post<WalletBalance>('/wallet/unlock', data),

    /** GET /wallet/transactions */
    getHistory: (api: AxiosInstance) =>
        api.get<WalletTransaction[]>('/wallet/transactions'),

    /** GET /wallet/manual-payment-instructions */
    getManualPaymentInstructions: (api: AxiosInstance) =>
        api.get<{
            bankName: string;
            accountName: string;
            accountNumber: string;
            telebirrMerchantName: string;
            telebirrNumber: string;
            processingNote?: string;
        }>('/wallet/manual-payment-instructions'),

    /** POST /wallet/request-coins — User submits a pending coin purchase request with proof */
    requestCoins: (
        api: AxiosInstance,
        data: { coins: number; paymentMethod: string; pricePaid: number; proof: File }
    ) => {
        const form = new FormData();
        form.append('coins', String(data.coins));
        form.append('paymentMethod', data.paymentMethod);
        form.append('pricePaid', String(data.pricePaid));
        form.append('proof', data.proof);
        return api.post<{ _id: string; status: string; amount: number }>('/wallet/request-coins', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /** POST /payments/chapa/initialize — Start Chapa checkout */
    initializeChapaTopup: (
        api: AxiosInstance,
        data: {
            amount: number;
            coins: number;
            currency?: string;
            callbackUrl?: string;
            returnUrl?: string;
        }
    ) =>
        api.post<{ success: boolean; message: string; data: ChapaInitializeResponse }>(
            '/payments/chapa/initialize',
            data
        ),

    /** POST /payments/chapa/verify — Verify Chapa transaction by txRef */
    verifyChapaTopup: (api: AxiosInstance, data: { txRef: string }) =>
        api.post('/payments/chapa/verify', data),
};
