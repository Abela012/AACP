import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '../api/apiClient';
import { adminApi } from '../api/adminApi';

/** Fetch admin dashboard statistics */
export const useAdminStats = () => {
    const api = useApiClient();

    return useQuery({
        queryKey: ['adminStats'],
        queryFn: () => adminApi.getStats(api).then(r => (r.data as any)?.data ?? r.data),
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });
};

/** Helper — parse role breakdown from stats response into display-ready format */
export const parseRoleBreakdown = (byRole: { _id: string; count: number }[], total: number) => {
    const colorMap: Record<string, string> = {
        business_owner: '#14a800',
        advertiser: '#2563EB',
        admin: '#F59E0B',
        super_admin: '#EF4444',
    };
    const labelMap: Record<string, string> = {
        business_owner: 'Business Owners',
        advertiser: 'Advertisers',
        admin: 'Administrators',
        super_admin: 'Super Admins',
    };

    return byRole.map(r => ({
        role: labelMap[r._id] ?? r._id,
        count: r.count,
        percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
        color: colorMap[r._id] ?? '#9A9FA5',
    }));
};
