import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';
import { userApi } from '../api/userApi';
import type { Opportunity } from '../api/opportunityApi';

export const useSavedOpportunities = () => {
    const api = useApiClient();
    return useQuery({
        queryKey: ['savedOpportunities'],
        queryFn: async () => {
            const response = await userApi.getSavedOpportunities(api);
            return response.data.savedOpportunities as Opportunity[];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useToggleSaveOpportunity = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (opportunityId: string) => userApi.toggleSave(api, opportunityId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['savedOpportunities'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};
