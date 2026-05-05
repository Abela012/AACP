import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from '../api/apiClient';

export interface SearchCampaign {
    _id: string;
    title: string;
    category: string;
    status: string;
    budget?: { amount: number; currency: string };
    platforms?: string[];
}

export interface SearchCreator {
    _id: string;
    clerkId: string;
    name: string;
    username: string;
    avatar?: string;
    location?: string;
    niche?: string;
    rating: number;
}

export interface GlobalSearchResults {
    campaigns: SearchCampaign[];
    creators: SearchCreator[];
}

/**
 * Debounced global search hook.
 * Hits GET /api/v1/search?q=&limit= to return campaigns and creators.
 */
export const useGlobalSearch = (query: string, debounceMs = 300) => {
    const api = useApiClient();
    const [results, setResults] = useState<GlobalSearchResults>({ campaigns: [], creators: [] });
    const [isLoading, setIsLoading] = useState(false);

    const runSearch = useCallback(
        async (q: string) => {
            if (!q || q.trim().length < 2) {
                setResults({ campaigns: [], creators: [] });
                return;
            }
            setIsLoading(true);
            try {
                const res = await api.get('/search', { params: { q: q.trim(), limit: 5 } });
                const data = res.data?.data ?? res.data;
                setResults({
                    campaigns: data?.campaigns ?? [],
                    creators: data?.creators ?? [],
                });
            } catch {
                setResults({ campaigns: [], creators: [] });
            } finally {
                setIsLoading(false);
            }
        },
        [api]
    );

    useEffect(() => {
        const timer = setTimeout(() => runSearch(query), debounceMs);
        return () => clearTimeout(timer);
    }, [query, debounceMs, runSearch]);

    const hasResults =
        results.campaigns.length > 0 || results.creators.length > 0;

    return { results, isLoading, hasResults };
};
