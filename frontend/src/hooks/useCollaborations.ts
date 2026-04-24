import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';

export interface CollaborationUser {
    _id: string;
    clerkId: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
}

export interface CollaborationOpportunity {
    _id: string;
    title: string;
    budget?: number | { amount: number; currency: string };
}

export interface Collaboration {
    _id: string;
    opportunity: CollaborationOpportunity;
    businessOwner: CollaborationUser;
    advertiser: CollaborationUser;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export const useCollaborations = (userId: string | undefined) => {
    const api = useApiClient();

    return useQuery({
        queryKey: ['collaborations', userId],
        queryFn: async () => {
            if (!userId) return { data: [] };
            const response = await api.get(`/collaborations/user/${userId}`);
            return response.data;
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
