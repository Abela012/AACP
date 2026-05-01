import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';
import { superAdminApi } from '../api/superAdminApi';

export const useSuperAdmins = (params?: { search?: string }) => {
  const api = useApiClient();
  return useQuery({
    queryKey: ['superAdminAdmins', params],
    queryFn: () => superAdminApi.getAdmins(api, params).then(r => r.data.data),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
};

export const usePromoteExistingUserToAdmin = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string; role?: 'admin' | 'super_admin' }) =>
      superAdminApi.promoteExistingUserToAdmin(api, payload).then(r => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminAdmins'] });
      queryClient.invalidateQueries({ queryKey: ['superAdminAuditLogs'] });
      queryClient.invalidateQueries({ queryKey: ['superAdminNotifications'] });
    },
  });
};

export const useCreateAdminUser = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string; password: string; role?: 'admin' | 'super_admin' }) =>
      superAdminApi.createAdminUser(api, payload).then(r => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminAdmins'] });
      queryClient.invalidateQueries({ queryKey: ['superAdminAuditLogs'] });
      queryClient.invalidateQueries({ queryKey: ['superAdminNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['superAdminSecuritySummary'] });
    },
  });
};

export const useUpdateAdminUser = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: { role?: 'admin' | 'super_admin'; status?: 'active' | 'banned' | 'suspended' } }) =>
      superAdminApi.updateAdminUser(api, userId, payload).then(r => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminAdmins'] });
      queryClient.invalidateQueries({ queryKey: ['superAdminAuditLogs'] });
      queryClient.invalidateQueries({ queryKey: ['superAdminNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['superAdminSecuritySummary'] });
    },
  });
};

export const useAuditLogs = (params?: { page?: number; limit?: number; action?: string; search?: string }) => {
  const api = useApiClient();
  return useQuery({
    queryKey: ['superAdminAuditLogs', params],
    queryFn: () => superAdminApi.getAuditLogs(api, params).then(r => r.data.data),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
};

export const usePlatformConfig = () => {
  const api = useApiClient();
  return useQuery({
    queryKey: ['superAdminPlatformConfig'],
    queryFn: () => superAdminApi.getPlatformConfig(api).then(r => r.data.data),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
};

export const useUpdatePlatformConfig = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { maintenanceMode?: boolean; coinCostPostingAds?: number; coinCostApplicationFee?: number; globalCommissionRate?: number }) =>
      superAdminApi.updatePlatformConfig(api, payload).then(r => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminPlatformConfig'] });
      queryClient.invalidateQueries({ queryKey: ['superAdminAuditLogs'] });
    },
  });
};

export const useSecuritySummary = () => {
  const api = useApiClient();
  return useQuery({
    queryKey: ['superAdminSecuritySummary'],
    queryFn: () => superAdminApi.getSecuritySummary(api).then(r => r.data.data),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
};

export const useSuperAdminNotifications = () => {
  const api = useApiClient();
  return useQuery({
    queryKey: ['superAdminNotifications'],
    queryFn: () => superAdminApi.getNotifications(api).then(r => r.data.data),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
};

export const useSuperAdminProfile = () => {
  const api = useApiClient();
  return useQuery({
    queryKey: ['superAdminProfile'],
    queryFn: () => superAdminApi.getProfile(api).then(r => r.data.data),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
};

