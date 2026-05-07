import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';
import { marketingAnalysisApi } from '../api/marketingAnalysisApi';

export const usePredictiveAnalysis = (advertiserId: string | null) => {
    const api = useApiClient();

    return useQuery({
        queryKey: ['predictive-analysis', advertiserId],
        queryFn: () => 
            marketingAnalysisApi.getPredictiveAnalysis(api, advertiserId!).then(r => r.data.data),
        enabled: !!advertiserId,
        staleTime: 300_000, // 5 minutes
    });
};

export const useMarketingAnalysis = (opportunityId: string | null) => {
    const api = useApiClient();

    return useQuery({
        queryKey: ['marketing-analysis', opportunityId],
        queryFn: () => 
            marketingAnalysisApi.getAnalysis(api, opportunityId!).then(r => r.data.data),
        enabled: !!opportunityId,
        staleTime: 60_000, // 1 minute
    });
};
