import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { useMemo } from 'react';

export const useApiClient = () => {
    const { getToken, isSignedIn } = useAuth();

    const instance = useMemo(() => {
        const client = axios.create({
            baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        client.interceptors.request.use(async (config) => {
            if (isSignedIn) {
                const token = await getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
            return config;
        });

        return client;
    }, [getToken, isSignedIn]);

    return instance;
};
