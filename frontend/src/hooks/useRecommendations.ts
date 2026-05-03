import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';
import { recommendationApi, type RecommendationResult } from '../api/recommendationApi';

/**
 * Hook to fetch AI-powered recommendations for the authenticated user.
 * - Business owners get recommended advertisers
 * - Advertisers get recommended opportunities
 */
export const useRecommendations = () => {
    const api = useApiClient();

    return useQuery<RecommendationResult>({
        queryKey: ['recommendations'],
        queryFn: () =>
            recommendationApi.getRecommendations(api).then(r => {
                const payload = (r.data as any)?.data ?? r.data;
                return payload;
            }),
        staleTime: 120_000, // 2 minutes — recommendations don't change rapidly
        retry: 1,
    });
};
