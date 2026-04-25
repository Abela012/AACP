import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';
import { adminApi, type AdminUser } from '../api/adminApi';

/** Fetch paginated admin user list with optional search */
export const useAdminUsers = (params?: { page?: number; limit?: number; search?: string }) => {
    const api = useApiClient();

    return useQuery({
        queryKey: ['adminUsers', params],
        queryFn: () => adminApi.getUsers(api, params).then(r => r.data.data),
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    });
};

/** Update a user's role */
export const useUpdateUserRole = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: AdminUser['role'] }) =>
            adminApi.updateUserRole(api, userId, role).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        },
    });
};

/** Ban, suspend, or re-activate a user */
export const useUpdateUserStatus = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, status }: { userId: string; status: AdminUser['status'] }) =>
            adminApi.updateUserStatus(api, userId, status).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        },
    });
};
