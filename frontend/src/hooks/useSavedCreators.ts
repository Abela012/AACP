import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';
import { userApi } from '../api/userApi';

export const useSavedCreators = () => {
    const api = useApiClient();
    return useQuery({
        queryKey: ['savedCreators'],
        queryFn: async () => {
            const response = await userApi.getSavedCreators(api);
            return response.data.savedCreators;
        },
    });
};

export const useToggleSaveCreator = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (creatorId: string) => userApi.toggleCreator(api, creatorId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['savedCreators'] });
        },
    });
};
