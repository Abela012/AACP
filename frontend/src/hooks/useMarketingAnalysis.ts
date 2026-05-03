import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';
import { marketingAnalysisApi, type MarketingAnalysisResult } from '../api/marketingAnalysisApi';

/**
 * Hook to fetch profitability analysis and Gemini AI summary for campaign applicants
 */
export const useMarketingAnalysis = (
    opportunityId: string,
    options?: { conversionRate?: number; avgProductPrice?: number }
) => {
    const api = useApiClient();

    return useQuery<MarketingAnalysisResult>({
        queryKey: ['marketing-analysis', opportunityId, options],
        queryFn: () =>
            marketingAnalysisApi.getAnalysis(api, opportunityId, options).then(r => {
                const payload = (r.data as any)?.data ?? r.data;
                return payload;
            }),
        enabled: !!opportunityId,
        staleTime: 60_000, // 1 minute
        retry: 1,
    });
};
