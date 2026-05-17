import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

export const useInitiateTikTokVerification = () => {
    return useMutation({
        mutationFn: async (data: { tiktokUsername: string, mode?: 'signin' | 'signup', password?: string }) => {
            const res = await api.post('/auth/tiktok/initiate', data);
            return res.data;
        }
    });
};

export const useVerifyTikTokCode = () => {
    return useMutation({
        mutationFn: async (data: { tiktokUsername: string, verificationCode: string }) => {
            const res = await api.post('/auth/tiktok/verify', data);
            return res.data;
        }
    });
};

export const useResendTikTokCode = () => {
    return useMutation({
        mutationFn: async (tiktokUsername: string) => {
            const res = await api.post('/auth/tiktok/resend-code', { tiktokUsername });
            return res.data;
        }
    });
};
