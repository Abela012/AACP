import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useCallback } from "react";
import { useApiClient } from "../api/apiClient";
import { userApi } from "../api/userApi";
import { useUser } from "../shared/context/UserContext";
import { useProfile } from "../shared/context/ProfileContext";

export const useUserSync = () => {
    const { isSignedIn } = useAuth();
    const api = useApiClient();
    const { setOnboardingStatus } = useUser();
    const { refreshProfile } = useProfile();
    const queryClient = useQueryClient();
    
    // Use a ref to ensure sync only runs once per component mount, 
    // even in React Strict Mode which double-invokes useEffect.
    const hasAttemptedSync = useRef(false);

    const syncUserMutation = useMutation({
        mutationFn: async () => {
            const pendingRole = localStorage.getItem('pendingUserRole') || undefined;
            console.log("[useUserSync] Initiating sync with role:", pendingRole);
            return await userApi.syncUser(api, pendingRole);
        },
        onSuccess: async (response: any) => {
            console.log("[useUserSync] User synced success:", response.data?.message);

            // Clean up the pending role from localStorage
            localStorage.removeItem('pendingUserRole');

            const status = response.data?.user?.status;
            
            // Set onboarding status in context
            if (status === 'active' || status === 'approved') {
                setOnboardingStatus('approved');
            } else if (status === 'pending') {
                setOnboardingStatus('pending');
            } else {
                setOnboardingStatus('incomplete');
            }

            // Refresh queries and profile
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            await refreshProfile();
        },
        onError: (error: any) => {
            console.error("[useUserSync] Sync failed:", error.response?.data || error.message);
            // Reset ref on error to allow retry if needed
            hasAttemptedSync.current = false;
        },
    });

    const triggerSync = useCallback(() => {
        if (!hasAttemptedSync.current && !syncUserMutation.isPending) {
            hasAttemptedSync.current = true;
            syncUserMutation.mutate();
        }
    }, [syncUserMutation.isPending, syncUserMutation.mutate]);

    // Auto-sync user when signed in
    useEffect(() => {
        if (isSignedIn && !hasAttemptedSync.current) {
            triggerSync();
        }
    }, [isSignedIn, triggerSync]);

    return {
        sync: triggerSync,
        isLoading: syncUserMutation.isPending,
        isSuccess: syncUserMutation.isSuccess,
        isError: syncUserMutation.isError
    };
};
