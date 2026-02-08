import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useApiClient, userApi } from "../utils/api";

export const useUserSync = () => {
    const { isSignedIn } = useAuth();
    const api = useApiClient();

    const queryClient = useQueryClient();

    const syncUserMutation = useMutation({
        mutationFn: async () => {
            try {
                // Read the role that was set during signup/SSO login
                const pendingRole = localStorage.getItem('pendingUserRole') || undefined;
                return await userApi.syncUser(api, pendingRole);
            } catch (error: unknown) {
                const axiosErr = error as { response?: { data?: { error?: string } } };
                if (axiosErr.response?.data?.error?.includes("E11000")) {
                    return { data: { message: "User already synced" } };
                }
                throw error;
            }
        },
        onSuccess: (response: { data?: { message?: string } }) => {
            console.log("User synced successfully:", response.data?.message);
            // Clean up the pending role from localStorage
            localStorage.removeItem('pendingUserRole');
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
        onError: (error: unknown) => {
            const axiosErr = error as { response?: { data?: unknown }; message?: string };
            console.error("Sync user failed:", axiosErr.response?.data || axiosErr.message);
        },
        onSettled: () => {
            console.log("Sync user process finished");
        }
    });

    // auto-sync user when signed in
    useEffect(() => {
        // if user is signed in and user is not synced yet, sync user
        if (isSignedIn && !syncUserMutation.isSuccess && !syncUserMutation.isPending) {
            syncUserMutation.mutate();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSignedIn, syncUserMutation.isSuccess, syncUserMutation.isPending]);

    return null;
};
