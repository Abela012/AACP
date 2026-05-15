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
            
            // Set a timeout for the request to prevent hanging
            return await userApi.syncUser(api, pendingRole);
        },
        retry: 3, // Automatically retry 3 times on failure
        retryDelay: 2000,
        onSuccess: async (response: any) => {
            const status = response.data?.user?.status;
            console.log("[useUserSync] Sync successful. Backend status:", status);

            // Clean up the pending role from localStorage
            localStorage.removeItem('pendingUserRole');
            
            // Set onboarding status in context based on backend status
            if (status === 'active' || status === 'approved') {
                console.log("[useUserSync] Account is APPROVED. Transitioning UI...");
                setOnboardingStatus('approved');
            } else if (status === 'pending') {
                console.log("[useUserSync] Account is still PENDING.");
                setOnboardingStatus('pending');
            } else {
                console.log("[useUserSync] Account is INCOMPLETE.");
                setOnboardingStatus('incomplete');
            }

            // Force a refresh of the authUser query to update other parts of the UI
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            await refreshProfile();
        },
        onError: (error: any) => {
            console.error("[useUserSync] Sync failed definitively after retries:", error.response?.data || error.message);
            // Reset ref on error to allow retry if needed
            hasAttemptedSync.current = false;
            
            if (error.code === 'ECONNABORTED') {
                console.error("[useUserSync] Request timed out. Backend might be down or slow.");
            }
        },
    });

    const triggerSync = useCallback((force = false) => {
        if (force || (!hasAttemptedSync.current && !syncUserMutation.isPending)) {
            if (!force) hasAttemptedSync.current = true;
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
        sync: () => triggerSync(true),
        isLoading: syncUserMutation.isPending,
        isSuccess: syncUserMutation.isSuccess,
        isError: syncUserMutation.isError
    };
};
