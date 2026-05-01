import type { AxiosInstance } from 'axios';

export interface AdminUser {
    _id: string;
    clerkId: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    profilePicture?: string;
    role: 'business_owner' | 'advertiser' | 'admin' | 'super_admin';
    status: 'pending' | 'active' | 'approved' | 'banned' | 'suspended';
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AdminUsersResponse {
    users: AdminUser[];
    total: number;
    page: number;
    pages: number;
}

export interface AdminStatsResponse {
    totalUsers: number;
    byRole: { _id: string; count: number }[];
    recentUsers: number;
    verifiedUsers: number;
    suspendedUsers: number;
    pendingApplications?: number;
    activeOpportunities?: number;
    pendingCoinRequests?: number;
}

export const adminApi = {
    /** GET /admin/users — Paginated list with optional search */
    getUsers: (api: AxiosInstance, params?: { page?: number; limit?: number; search?: string }) =>
        api.get<{ success: boolean; message: string; data: AdminUsersResponse }>('/admin/users', { params }),

    /** GET /admin/stats — Dashboard overview metrics */
    getStats: (api: AxiosInstance) =>
        api.get<AdminStatsResponse>('/admin/stats'),

    /** PUT /admin/users/:userId/role — Update a user's role */
    updateUserRole: (api: AxiosInstance, userId: string, role: AdminUser['role']) =>
        api.put<AdminUser>(`/admin/users/${userId}/role`, { role }),

    /** PUT /admin/users/:userId/status — Ban, suspend, or re-activate a user */
    updateUserStatus: (api: AxiosInstance, userId: string, status: AdminUser['status']) =>
        api.put<AdminUser>(`/admin/users/${userId}/status`, { status }),

    /** GET /admin/wallet/requests — List pending coin purchases */
    getWalletRequests: (api: AxiosInstance, params?: { status?: string; search?: string }) =>
        api.get<{ requests: any[]; total: number }>('/admin/wallet/requests', { params }),

    /** POST /admin/wallet/requests/:requestId/approve — Approve a coin purchase */
    approveWalletRequest: (api: AxiosInstance, requestId: string) =>
        api.post(`/admin/wallet/requests/${requestId}/approve`),

    /** POST /admin/wallet/requests/:requestId/reject — Reject a coin purchase */
    rejectWalletRequest: (api: AxiosInstance, requestId: string, reason?: string) =>
        api.post(`/admin/wallet/requests/${requestId}/reject`, { reason }),

    /** GET /admin/disputes — List platform disputes */
    getDisputes: (api: AxiosInstance, params?: { status?: string; search?: string }) =>
        api.get<any[]>('/admin/disputes', { params }),

    /** PUT /admin/disputes/:disputeId/resolve — Resolve a dispute */
    resolveDispute: (api: AxiosInstance, disputeId: string, reason: string) =>
        api.put(`/admin/disputes/${disputeId}/resolve`, { reason }),

    /** PUT /admin/disputes/:disputeId/escalate — Escalate a dispute */
    escalateDispute: (api: AxiosInstance, disputeId: string) =>
        api.put(`/admin/disputes/${disputeId}/escalate`),
};
