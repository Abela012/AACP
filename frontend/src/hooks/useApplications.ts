import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';
import { applicationApi } from '../api/applicationApi';

/** All applications submitted by a specific advertiser */
export const useMyApplications = (userId: string) => {
    const api = useApiClient();
    return useQuery({
        queryKey: ['applications', 'user', userId],
        queryFn: () => applicationApi.getByUser(api, userId).then(r => (r.data as any)?.data ?? r.data),
        enabled: !!userId,
        staleTime: 30_000,
    });
};

/** All applications for a specific opportunity (business owner view) */
export const useOpportunityApplications = (opportunityId: string) => {
    const api = useApiClient();
    return useQuery({
        queryKey: ['applications', 'opportunity', opportunityId],
        queryFn: () => applicationApi.getByOpportunity(api, opportunityId).then(r => (r.data as any)?.data ?? r.data),
        enabled: !!opportunityId,
        staleTime: 30_000,
    });
};

/** All applications for all opportunities owned by the logged-in business owner */
export const useBusinessOwnerApplications = () => {
    const api = useApiClient();
    return useQuery({
        queryKey: ['applications', 'business-owner'],
        queryFn: () => applicationApi.getForBusinessOwner(api).then(r => (r.data as any)?.data ?? r.data),
        staleTime: 30_000,
    });
};

/** Apply to an opportunity */
export const useApply = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ opportunity, coverLetter }: { opportunity: string; coverLetter?: string }) =>
            applicationApi.apply(api, { opportunity, coverLetter }).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            // Refresh wallet balance since 50 coins were deducted
            queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
        },
    });
};

/** Withdraw an application */
export const useWithdrawApplication = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => applicationApi.withdraw(api, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
    });
};

/** Accept an applicant (business owner) */
export const useAcceptApplication = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => applicationApi.accept(api, id).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
    });
};

/** Reject an applicant (business owner) */
export const useRejectApplication = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => applicationApi.reject(api, id).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
    });
};
