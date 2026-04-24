import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useApiClient, userApi } from "../utils/api";
import { useUser } from "../shared/context/UserContext";

export const useUserSync = () => {
    const { isSignedIn } = useAuth();
    const api = useApiClient();
    const { setOnboardingStatus } = useUser();

    const queryClient = useQueryClient();

    const syncUserMutation = useMutation({
        mutationFn: async () => {
            try {
                // Read the role that was stored during signup/social login
                const pendingRole = localStorage.getItem('pendingUserRole') || undefined;
                console.log("[useUserSync] Syncing user with role:", pendingRole);
                return await userApi.syncUser(api, pendingRole);
            } catch (error: any) {
                if (error.response?.data?.error?.includes("E11000")) {
                    return { data: { message: "User already synced" } };
                }
                throw error;
            }
        },
        onSuccess: (response: any) => {
            console.log("[useUserSync] User synced successfully:", response.data?.message);
            // Clean up the pending role from localStorage
            localStorage.removeItem('pendingUserRole');
            
            // Update the global status based on the backend response
            const status = response.data?.user?.status;
            if (status === 'active') {
                setOnboardingStatus('approved');
            } else if (status === 'pending') {
                setOnboardingStatus('pending');
            }
            
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
        onError: (error: any) => {
            console.error("[useUserSync] Sync failed:", error.response?.data || error.message);
        },
    });

    // auto-sync user when signed in
    useEffect(() => {
        // if user is signed in and user is not synced yet, sync user
        if (isSignedIn && !syncUserMutation.isSuccess && !syncUserMutation.isPending) {
            syncUserMutation.mutate();
        }
    }, [isSignedIn, syncUserMutation.isSuccess, syncUserMutation.isPending]);

    return {
        sync: () => syncUserMutation.mutate(),
        isLoading: syncUserMutation.isPending,
        isSuccess: syncUserMutation.isSuccess
    };
};
