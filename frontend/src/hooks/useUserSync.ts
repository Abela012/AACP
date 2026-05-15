import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useCallback } from "react";
import type { AxiosResponse } from "axios";
import { isAxiosError } from "axios";
import { useApiClient } from "../api/apiClient";
import { userApi } from "../api/userApi";
import { useUser } from "../shared/context/UserContext";
import { useProfile } from "../shared/context/ProfileContext";

type AppUserRole = 'business_owner' | 'advertiser' | 'admin' | 'super_admin';

type SyncUserPayload = {
    message?: string;
    user?: {
        role?: AppUserRole;
        status?: string;
    };
};

const applySyncedUser = (
    user: SyncUserPayload['user'],
    setUserRole: (role: AppUserRole | null) => void,
    setOnboardingStatus: (status: 'incomplete' | 'pending' | 'approved') => void,
) => {
    if (!user?.role) return;

    setUserRole(user.role);
    localStorage.setItem('userRole', user.role);

    const { status } = user;
    if (user.role === 'admin' || user.role === 'super_admin' || status === 'active' || status === 'approved') {
        setOnboardingStatus('approved');
    } else if (status === 'pending') {
        setOnboardingStatus('pending');
    } else {
        setOnboardingStatus('incomplete');
    }
};

export const useUserSync = () => {
    const { isSignedIn } = useAuth();
    const api = useApiClient();
    const { setOnboardingStatus, setUserRole } = useUser();
    const { refreshProfile } = useProfile();
    const queryClient = useQueryClient();

    // Ensures sync runs once per mount (React Strict Mode double-invokes effects).
    const hasAttemptedSync = useRef(false);

    const syncUserMutation = useMutation({
        mutationFn: async () => {
            const pendingRole = localStorage.getItem('pendingUserRole') || undefined;
            if (pendingRole) {
                console.log("[useUserSync] Initiating sync with role:", pendingRole);
            }
            return await userApi.syncUser(api, pendingRole);
        },
        retry: 3, 
        retryDelay: 2000,
        onSuccess: async (response: AxiosResponse<SyncUserPayload>) => {
            const syncedUser = response.data?.user;
            console.log(
                "[useUserSync] User synced successfully. Backend status:",
                syncedUser?.status,
                syncedUser?.role ? `role=${syncedUser.role}` : '',
            );

            localStorage.removeItem('pendingUserRole');
            applySyncedUser(syncedUser, setUserRole, setOnboardingStatus);

            // Force a refresh of the authUser query to update other parts of the UI
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            await refreshProfile();
        },
        onError: (error: unknown) => {
            const detail = isAxiosError(error)
                ? error.response?.data ?? error.message
                : error instanceof Error
                  ? error.message
                  : error;
            
            console.error("[useUserSync] Sync failed definitively after retries:", detail);
            
            // Reset ref on error to allow retry if needed
            hasAttemptedSync.current = false;
        },
    });

    const { mutate, isPending, isSuccess, isError } = syncUserMutation;

    const triggerSync = useCallback((force = false) => {
        if (force || (!hasAttemptedSync.current && !isPending)) {
            if (!force) hasAttemptedSync.current = true;
            mutate();
        }
    }, [isPending, mutate]);

    useEffect(() => {
        if (!isSignedIn || hasAttemptedSync.current || isPending) return;
        hasAttemptedSync.current = true;
        mutate();
    }, [isSignedIn, isPending, mutate]);

    return {
        sync: () => triggerSync(true),
        isLoading: isPending,
        isSuccess,
        isError,
    };
};
