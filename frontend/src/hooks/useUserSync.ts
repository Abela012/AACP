import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useCallback, useMemo } from "react";
import type { AxiosResponse } from "axios";
import { isAxiosError } from "axios";
import { useApiClient } from "../api/apiClient";
import { userApi } from "../api/userApi";
import { useUser } from "@/src/shared/context/UserContext";
import { useProfile } from "@/src/shared/context/ProfileContext";

/** sessionStorage key used to mark that sync has already run for a given Clerk user ID this session. */
const makeSessionSyncKey = (userId: string) => `aacp_synced_${userId}`;

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
    const { isSignedIn, userId: clerkUserId } = useAuth();
    const api = useApiClient();
    const { setOnboardingStatus, setUserRole } = useUser();
    const { refreshProfile } = useProfile();
    const queryClient = useQueryClient();

    // Ensures sync runs once per mount (React Strict Mode double-invokes effects).
    const hasAttemptedSync = useRef(false);

    /**
     * Skip sync when:
     *  1. The user already has a cached role in localStorage (session is known), AND
     *  2. This specific Clerk user already ran sync during this browser session
     *     (sessionStorage resets on tab close, so new logins always sync).
     *  3. There is no pending role change queued (i.e., social/OAuth flow).
     */
    const canSkipSync = useMemo(() => {
        const hasCachedRole = !!localStorage.getItem('userRole');
        const hasPendingRole = !!localStorage.getItem('pendingUserRole');
        const sessionKey = clerkUserId ? makeSessionSyncKey(clerkUserId) : null;
        const alreadySyncedThisSession = sessionKey ? !!sessionStorage.getItem(sessionKey) : false;
        return hasCachedRole && alreadySyncedThisSession && !hasPendingRole;
    }, [clerkUserId]);

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

            // Mark this session as synced so future navigations skip the API call.
            if (clerkUserId) {
                sessionStorage.setItem(makeSessionSyncKey(clerkUserId), '1');
            }

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

    const { mutate, isPending, isSuccess, isError, error } = syncUserMutation;

    const hasTikTokAuth = !!localStorage.getItem('tiktok_jwt');

    const triggerSync = useCallback((force = false) => {
        if (hasTikTokAuth) return; // No sync needed for custom JWT
        if (canSkipSync && !force) return; // Already synced this session
        if (force || (!hasAttemptedSync.current && !isPending)) {
            if (!force) hasAttemptedSync.current = true;
            mutate();
        }
    }, [isPending, mutate, hasTikTokAuth, canSkipSync]);

    useEffect(() => {
        if (hasTikTokAuth || !isSignedIn || hasAttemptedSync.current || isPending) return;
        // Skip the expensive sync API call if this session is already marked as synced.
        if (canSkipSync) return;
        hasAttemptedSync.current = true;
        mutate();
    }, [isSignedIn, isPending, mutate, hasTikTokAuth, canSkipSync]);

    return {
        sync: () => triggerSync(true),
        isLoading: isPending,
        // Treat as success if TikTok auth or if we've already synced this session.
        isSuccess: hasTikTokAuth ? true : (canSkipSync ? true : isSuccess),
        isError,
        error,
    };
};
