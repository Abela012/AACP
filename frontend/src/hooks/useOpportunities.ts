import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient, publicClient } from '../api/apiClient';
import { opportunityApi, type Opportunity, type OpportunitiesResponse } from '../api/opportunityApi';

/** Public listing of all opportunities (no auth required) */
export const useOpportunities = (params?: { page?: number; limit?: number; category?: string }) => {
    return useQuery<OpportunitiesResponse>({
        queryKey: ['opportunities', params],
        queryFn: () =>
            publicClient.get<any>('/opportunities', { params }).then(r => {
                const payload = r.data?.data ?? r.data;
                const rawOpportunities = Array.isArray(payload) ? payload : (payload.opportunities || []);
                
                // Transform to match frontend interface (businessOwner -> owner)
                const transformed = (rawOpportunities || []).map((o: any) => {
                    if (!o) return o;
                    return {
                        ...o,
                        owner: o.businessOwner
                    };
                });

                if (Array.isArray(payload)) {
                    return { opportunities: transformed, total: payload.length, page: 1, pages: 1 };
                }
                return { ...payload, opportunities: transformed };
            }),
        staleTime: 60_000,
    });
};

/** Opportunities owned by a specific user (business owner) */
export const useMyOpportunities = (userId: string) => {
    return useQuery<OpportunitiesResponse>({
        queryKey: ['opportunities', 'user', userId],
        queryFn: () =>
            publicClient.get<any>(`/opportunities/user/${userId}`).then(r => {
                const payload = r.data?.data ?? r.data;
                if (Array.isArray(payload)) {
                    return { opportunities: payload, total: payload.length, page: 1, pages: 1 };
                }
                return payload;
            }),
        enabled: !!userId,
        staleTime: 30_000,
    });
};

/** Single opportunity by ID */
export const useOpportunity = (id: string) => {
    return useQuery<{ opportunity: Opportunity }>({
        queryKey: ['opportunity', id],
        queryFn: () =>
            publicClient.get<any>(`/opportunities/${id}`).then(r => {
                const payload = r.data?.data ?? r.data;
                
                // Extract opportunity object
                const opp = payload.opportunity || payload;
                
                // Transform (businessOwner -> owner)
                const transformed = {
                    ...opp,
                    owner: opp.businessOwner
                };

                return { opportunity: transformed };
            }),
        enabled: !!id,
        staleTime: 60_000,
    });
};

/** Create a new opportunity (business_owner only) */
export const useCreateOpportunity = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<Opportunity>) =>
            opportunityApi.create(api, data).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['opportunities'] });
        },
    });
};

/** Update an existing opportunity */
export const useUpdateOpportunity = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Opportunity> }) =>
            opportunityApi.update(api, id, data).then(r => r.data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['opportunities'] });
            queryClient.invalidateQueries({ queryKey: ['opportunity', id] });
        },
    });
};

/** Delete an opportunity */
export const useDeleteOpportunity = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            opportunityApi.remove(api, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['opportunities'] });
        },
    });
};
