import axios, { type AxiosInstance } from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { useMemo } from 'react';

/**
 * Centralized Axios instance with Clerk JWT injection and global error handling.
 * Usage: const api = useApiClient(); then api.get('/endpoint')
 */
export const useApiClient = (): AxiosInstance => {
    const { getToken, isSignedIn } = useAuth();

    const instance = useMemo(() => {
        const client = axios.create({
            baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor — attach Clerk JWT token
        client.interceptors.request.use(async (config) => {
            if (isSignedIn) {
                try {
                    const token = await getToken();
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    } else {
                        console.warn('[API] getToken() returned null despite isSignedIn being true');
                    }
                } catch (tokenErr) {
                    console.error('[API] Error getting token:', tokenErr);
                }
            }
            return config;
        });

        // Response interceptor — global error handling
        client.interceptors.response.use(
            (response) => response,
            (error) => {
                const status = error.response?.status;
                const message = error.response?.data?.error || error.response?.data?.message;

                if (status === 401) {
                    console.error('[API] Unauthorized — user may need to re-authenticate');
                }
                if (status === 403) {
                    console.error('[API] Forbidden — insufficient permissions');
                }
                if (status === 404) {
                    console.error('[API] Resource not found:', error.config?.url);
                }
                if (status >= 500) {
                    console.error('[API] Server error:', message || 'Unknown error');
                }

                return Promise.reject(error);
            }
        );

        return client;
    }, [getToken, isSignedIn]);

    return instance;
};

/**
 * Bare Axios instance for unauthenticated requests (public endpoints).
 */
export const publicClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});
