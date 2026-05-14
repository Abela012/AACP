import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from '../api/apiClient';
import {
    facebookAnalyticsApi,
    type AnalyticsConnectionStatus,
    type PageInsight,
} from '../api/facebookAnalyticsApi';

export type ConnectionState =
    | 'idle'
    | 'loading'
    | 'connected'
    | 'disconnected'
    | 'expired'
    | 'denied'
    | 'error';

export interface UseFacebookAnalyticsReturn {
    /** Current connection state */
    connectionState: ConnectionState;
    /** Connected pages */
    pages: AnalyticsConnectionStatus['pages'];
    /** Page insights data */
    insights: PageInsight[];
    /** Last sync timestamp */
    lastSyncedAt: string | null;
    /** Token expiry date */
    tokenExpiresAt: string | null;
    /** Error message if any */
    errorMessage: string | null;
    /** Whether data is currently loading */
    isLoading: boolean;
    /** Whether insights are currently refreshing */
    isRefreshing: boolean;
    /** Start the OAuth connection flow */
    connectAnalytics: () => Promise<void>;
    /** Refresh insights from Facebook */
    refreshInsights: (pageId?: string) => Promise<void>;
    /** Disconnect Facebook Analytics */
    disconnect: () => Promise<void>;
    /** Re-fetch connection status */
    checkStatus: () => Promise<void>;
}

export function useFacebookAnalytics(): UseFacebookAnalyticsReturn {
    const api = useApiClient();

    const [connectionState, setConnectionState] = useState<ConnectionState>('loading');
    const [pages, setPages] = useState<AnalyticsConnectionStatus['pages']>([]);
    const [insights, setInsights] = useState<PageInsight[]>([]);
    const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
    const [tokenExpiresAt, setTokenExpiresAt] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    /**
     * Check the current connection status from the backend.
     */
    const checkStatus = useCallback(async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            const res = await facebookAnalyticsApi.getPages(api);

            if (res.success && res.data) {
                setPages(res.data.pages);
                setLastSyncedAt(res.data.lastSyncedAt || null);
                setTokenExpiresAt(res.data.tokenExpiresAt || null);

                if (res.data.isConnected) {
                    setConnectionState('connected');
                    // Also fetch insights
                    try {
                        const insightsRes = await facebookAnalyticsApi.getInsights(api);
                        if (insightsRes.success && insightsRes.data) {
                            setInsights(insightsRes.data.insights);
                            setLastSyncedAt(insightsRes.data.lastSyncedAt || null);
                        }
                    } catch {
                        // Insights fetch failure shouldn't break the status
                    }
                } else if (res.data.status === 'expired') {
                    setConnectionState('expired');
                } else {
                    setConnectionState('disconnected');
                }
            } else {
                setConnectionState('disconnected');
            }
        } catch (err: any) {
            console.error('[FB Analytics] Status check failed:', err);
            setConnectionState('disconnected');
        } finally {
            setIsLoading(false);
        }
    }, [api]);

    /**
     * Initiate the OAuth flow — redirects to Facebook.
     */
    const connectAnalytics = useCallback(async () => {
        try {
            setConnectionState('loading');
            setErrorMessage(null);

            const res = await facebookAnalyticsApi.initiateAuth(api);

            if (res.success && res.data?.authUrl) {
                // Redirect the browser to Facebook OAuth
                window.location.href = res.data.authUrl;
            } else {
                throw new Error('Failed to get authorization URL');
            }
        } catch (err: any) {
            console.error('[FB Analytics] Connect failed:', err);
            setErrorMessage(err.response?.data?.message || err.message || 'Connection failed');
            setConnectionState('error');
        }
    }, [api]);

    /**
     * Refresh insights data from Facebook.
     */
    const refreshInsights = useCallback(async (pageId?: string) => {
        try {
            setIsRefreshing(true);
            setErrorMessage(null);

            const res = await facebookAnalyticsApi.getInsights(api, { refresh: true, pageId });

            if (res.success && res.data) {
                setInsights(res.data.insights);
                setLastSyncedAt(res.data.lastSyncedAt || null);
            }
        } catch (err: any) {
            const errorCode = err.response?.data?.errorCode;
            if (errorCode === 'TOKEN_EXPIRED') {
                setConnectionState('expired');
                setErrorMessage('Your Facebook token has expired. Please reconnect.');
            } else if (errorCode === 'PERMISSION_DENIED') {
                setConnectionState('denied');
                setErrorMessage('Missing required Facebook permissions.');
            } else {
                setErrorMessage(err.response?.data?.message || 'Failed to refresh insights');
            }
        } finally {
            setIsRefreshing(false);
        }
    }, [api]);

    /**
     * Disconnect Facebook Analytics.
     */
    const disconnect = useCallback(async () => {
        try {
            setIsLoading(true);
            await facebookAnalyticsApi.disconnect(api);
            setConnectionState('disconnected');
            setPages([]);
            setInsights([]);
            setLastSyncedAt(null);
            setTokenExpiresAt(null);
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || 'Failed to disconnect');
        } finally {
            setIsLoading(false);
        }
    }, [api]);

    /**
     * On mount: check URL params for callback status, then check connection status.
     */
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status');

        if (status) {
            // Clean URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);

            if (status === 'success') {
                // Connection just succeeded — fetch fresh data
                checkStatus();
                return;
            } else if (status === 'denied') {
                setConnectionState('denied');
                setErrorMessage(params.get('message') || 'Permission denied by user');
                setIsLoading(false);
                return;
            } else if (status === 'error') {
                setConnectionState('error');
                setErrorMessage(params.get('message') || 'An error occurred');
                setIsLoading(false);
                return;
            }
        }

        checkStatus();
    }, [checkStatus]);

    return {
        connectionState,
        pages,
        insights,
        lastSyncedAt,
        tokenExpiresAt,
        errorMessage,
        isLoading,
        isRefreshing,
        connectAnalytics,
        refreshInsights,
        disconnect,
        checkStatus,
    };
}
