import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';
import { adminApi } from '../api/adminApi';

export const useAdminNotifications = () => {
  const api = useApiClient();
  return useQuery({
    queryKey: ['adminNotifications'],
    queryFn: () => adminApi.getNotifications(api).then((r) => r.data.data),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
};
