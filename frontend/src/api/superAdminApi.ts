import type { AxiosInstance } from 'axios';

export type SuperAdminUser = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  profilePicture?: string;
  role: 'admin' | 'super_admin';
  status: 'pending' | 'active' | 'banned' | 'suspended';
  createdAt: string;
  updatedAt: string;
};

export type AuditLog = {
  _id: string;
  action: string;
  actorRole: 'admin' | 'super_admin';
  message?: string;
  ip?: string;
  userAgent?: string;
  targetType?: string | null;
  targetId?: string | null;
  createdAt: string;
  actor?: any;
  targetUser?: any;
  metadata?: any;
};

export type PlatformConfig = {
  _id: string;
  maintenanceMode: boolean;
  coinCostPostingAds: number;
  coinCostApplicationFee: number;
  globalCommissionRate: number;
  chapaSecretKeyMasked: string;
  cloudinaryEnvironmentVariable: string;
  emailTemplates: {
    welcomeEmail: { title: string; description: string; updatedAt?: string | null };
    adApproved: { title: string; description: string; updatedAt?: string | null };
    passwordReset: { title: string; description: string; updatedAt?: string | null };
  };
};

export type SecuritySummary = {
  overview: {
    activeAdmins: number;
    superAdmins: number;
    auditEvents: number;
    criticalEvents7d: number;
    pendingTransactions: number;
    suspendedUsers: number;
  };
  controls: { label: string; value: string; status: 'healthy' | 'warning' }[];
  recentLogs: AuditLog[];
};

export type SuperAdminNotification = {
  id: string;
  title: string;
  category: 'system' | 'user_activity' | 'payments';
  priority: 'high' | 'normal';
  read: boolean;
  createdAt: string;
  actor?: any;
  action: string;
  targetType?: string;
};

export type SuperAdminProfileResponse = {
  profile: any;
  stats: {
    auditEvents: number;
    governedAdmins: number;
    activeRole: string;
  };
  recentActions: AuditLog[];
};

export const superAdminApi = {
  getAdmins: (api: AxiosInstance, params?: { search?: string }) =>
    api.get<{ success: boolean; message: string; data: { admins: SuperAdminUser[]; total: number } }>(
      '/super-admin/admins',
      { params }
    ),

  promoteExistingUserToAdmin: (
    api: AxiosInstance,
    payload: { email: string; role?: 'admin' | 'super_admin' }
  ) =>
    api.post<{ success: boolean; message: string; data: { user: SuperAdminUser } }>(
      '/super-admin/admins/promote',
      payload
    ),

  createAdminUser: (
    api: AxiosInstance,
    payload: { email: string; password: string; role?: 'admin' | 'super_admin' }
  ) =>
    api.post<{ success: boolean; message: string; data: { user: SuperAdminUser } }>(
      '/super-admin/admins/create',
      payload
    ),

  updateAdminUser: (
    api: AxiosInstance,
    userId: string,
    payload: { role?: 'admin' | 'super_admin'; status?: 'active' | 'banned' | 'suspended' }
  ) =>
    api.patch<{ success: boolean; message: string; data: { user: SuperAdminUser } }>(
      `/super-admin/admins/${userId}`,
      payload
    ),

  getAuditLogs: (
    api: AxiosInstance,
    params?: { page?: number; limit?: number; action?: string; search?: string }
  ) =>
    api.get<{
      success: boolean;
      message: string;
      data: { logs: AuditLog[]; total: number; page: number; pages: number };
    }>('/super-admin/audit-logs', { params }),

  getPlatformConfig: (api: AxiosInstance) =>
    api.get<{ success: boolean; message: string; data: PlatformConfig }>('/super-admin/platform-config'),

  updatePlatformConfig: (
    api: AxiosInstance,
    payload: Partial<Pick<PlatformConfig, 'maintenanceMode' | 'coinCostPostingAds' | 'coinCostApplicationFee' | 'globalCommissionRate'>>
  ) => api.put<{ success: boolean; message: string; data: PlatformConfig }>('/super-admin/platform-config', payload),

  getSecuritySummary: (api: AxiosInstance) =>
    api.get<{ success: boolean; message: string; data: SecuritySummary }>('/super-admin/security-summary'),

  getNotifications: (api: AxiosInstance) =>
    api.get<{ success: boolean; message: string; data: { notifications: SuperAdminNotification[] } }>(
      '/super-admin/notifications'
    ),

  getProfile: (api: AxiosInstance) =>
    api.get<{ success: boolean; message: string; data: SuperAdminProfileResponse }>('/super-admin/profile'),
};

