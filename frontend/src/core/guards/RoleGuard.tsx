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
    const needsRoleFetch = (isLoaded && isSignedIn && !userRole) || (hasTikTokAuth && !userRole);

    const { data: meData, isLoading: isMeLoading } = useQuery({
        queryKey: ['authUser'],
        queryFn: async () => {
            const response = await userApi.getMe(api);
            return response.data;
        },
        enabled: needsRoleFetch,
        staleTime: 60_000,
        retry: 2,
    });

    const fetchedRole = meData?.user?.role as AppRole | undefined;
    const storedRole = localStorage.getItem('userRole') as AppRole | null;
    const resolvedRole: AppRole | null = userRole ?? fetchedRole ?? storedRole ?? null;

    useEffect(() => {
        if (fetchedRole && fetchedRole !== userRole) {
            setUserRole(fetchedRole);
            localStorage.setItem('userRole', fetchedRole);
        }
    }, [fetchedRole, userRole, setUserRole]);

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
