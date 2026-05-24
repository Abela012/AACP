import { Navigate } from "react-router-dom";
import { useUser } from "../../shared/context/UserContext";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../../api/apiClient";
import { userApi } from "../../api/userApi";

type AppRole = 'business_owner' | 'advertiser' | 'admin' | 'super_admin';

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: Array<AppRole>;
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { userRole, setUserRole } = useUser();
    const { isLoaded, isSignedIn } = useAuth();
    const api = useApiClient();

    const hasTikTokAuth = !!localStorage.getItem('tiktok_jwt');
    const storedRole = localStorage.getItem('userRole') as AppRole | null;

    /**
     * Only hit the API when BOTH context AND localStorage have no role.
     * If storedRole is present we trust it — the sync already wrote it there.
     * staleTime ensures the cached result is reused across guard instances
     * rendered in the same navigation (e.g., nested AuthGuard + RoleGuard).
     */
    const needsRoleFetch =
        !userRole &&
        !storedRole &&
        ((isLoaded && isSignedIn) || hasTikTokAuth);

    const { data: meData, isLoading: isMeLoading } = useQuery({
        queryKey: ['authUser'],
        queryFn: async () => {
            const response = await userApi.getMe(api);
            return response.data;
        },
        enabled: needsRoleFetch,
        staleTime: 5 * 60_000, // 5 min — avoid hammering the API on repeated navigations
        retry: 2,
    });

    const fetchedRole = meData?.user?.role as AppRole | undefined;
    const resolvedRole: AppRole | null = userRole ?? fetchedRole ?? storedRole ?? null;

    // Persist freshly fetched role so subsequent navigations use the fast path.
    useEffect(() => {
        if (fetchedRole && fetchedRole !== userRole) {
            setUserRole(fetchedRole);
            localStorage.setItem('userRole', fetchedRole);
        }
    }, [fetchedRole, userRole, setUserRole]);

    // Show a bare spinner only while a necessary API fetch is in flight.
    if (!isLoaded || (needsRoleFetch && isMeLoading)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
                <div className="w-12 h-12 border-4 border-aacp-olive border-t-transparent rounded-full animate-spin mb-4" />
            </div>
        );
    }

    if (!resolvedRole) {
        return <Navigate to="/dashboard" replace />;
    }

    if (!allowedRoles.includes(resolvedRole)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
