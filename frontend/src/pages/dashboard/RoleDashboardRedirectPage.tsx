import { Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useApiClient } from "../../api/apiClient";
import { userApi } from "../../api/userApi";
import { useUserSync } from "../../hooks/useUserSync";
import type { User } from "../../types";
import { useUser } from "../../shared/context/UserContext";
import { Briefcase, Megaphone, ArrowRight, Loader2 } from "lucide-react";

type CurrentUserResponse = {
  data?: User;
};

type UserRole = 'business_owner' | 'advertiser' | 'admin' | 'super_admin' | null;

/**
 * Normalises any raw role string to a consistent snake_case UserRole value.
 * Returns null if the value is empty, "null", or unrecognised.
 */
function normalizeRole(raw: string | null | undefined): UserRole {
  if (!raw || raw === 'null') return null;
  return raw.toLowerCase().replace(/[-\s]/g, '_') as UserRole;
}

/** Reads the best available cached role without any API calls. */
function resolveCachedRole(contextRole: UserRole): UserRole {
  if (contextRole) return contextRole;
  const stored = localStorage.getItem('userRole');
  const pending = localStorage.getItem('pendingUserRole');
  return normalizeRole(stored || pending);
}

export default function RoleDashboardRedirectPage() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [timedOut, setTimedOut] = useState(false);
  const { setUserRole, userRole: contextRole } = useUser();
  const [selectedRole, setSelectedRole] = useState<'business_owner' | 'advertiser' | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [isLongLoading, setIsLongLoading] = useState(false);

  // ─────────────────────────────────────────────────────────────────
  // FAST PATH: resolve from in-memory context or localStorage.
  // This avoids any API round-trips for already-authenticated users.
  // ─────────────────────────────────────────────────────────────────
  const fastRole = useMemo(() => resolveCachedRole(contextRole), [contextRole]);
  const hasKnownRole = !!fastRole;

  // ─────────────────────────────────────────────────────────────────
  // SLOW PATH hooks — always called (hook ordering), but gated via
  // `enabled` flags so they are no-ops when fastRole is present.
  // ─────────────────────────────────────────────────────────────────

  // useUserSync is optimised to skip the network call when the session
  // is already marked as synced in sessionStorage.
  const {
    isSuccess: isSyncSuccess,
    isLoading: isSyncLoading,
    isError: isSyncError,
    error: syncError,
  } = useUserSync();

  // Only hit the DB when we genuinely don't know the user's role.
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const response = await userApi.getMe(api);
      return response.data as any;
    },
    retry: 3,
    retryDelay: 1000,
    // Disabled entirely when we already know the role OR sync hasn't finished.
    enabled: !hasKnownRole && isSyncSuccess,
  });

  // Mutation to assign a role when the user has none (e.g., SSO edge case).
  const updateRoleMutation = useMutation({
    mutationFn: async (role: 'business_owner' | 'advertiser') => {
      return await userApi.syncUser(api, role);
    },
    onSuccess: (response: any) => {
      const userRole = response.data?.user?.role;
      if (userRole) {
        setUserRole(userRole as any);
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('pendingUserRole', userRole);
      }
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      refetch();
    },
    onError: (error: any) => {
      console.error("[RoleDashboardRedirectPage] Role update failed:", error);
      setRoleError("Failed to save your role. Please try again.");
    },
  });

  // Timeouts only matter during the slow path (when no cached role exists).
  useEffect(() => {
    if (hasKnownRole) return;
    const timer = window.setTimeout(() => setTimedOut(true), 60000);
    const longLoadTimer = window.setTimeout(() => setIsLongLoading(true), 10000);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(longLoadTimer);
    };
  }, [hasKnownRole]);

  // Resolve role from API data (slow path only).
  const rawRole =
    (data as any)?.user?.role ??
    (data as any)?.data?.user?.role ??
    (data as any)?.role ??
    (data as any)?.data?.role ??
    null;

  const normalizedRole = normalizeRole(rawRole);

  const status =
    (data as any)?.user?.status ??
    (data as any)?.data?.user?.status ??
    (data as any)?.status ??
    (data as any)?.data?.status;

  // Persist any newly fetched role to context + localStorage.
  useLayoutEffect(() => {
    if (!normalizedRole) return;
    const stored = localStorage.getItem('userRole');
    if (stored !== normalizedRole) {
      setUserRole(normalizedRole);
      localStorage.setItem('userRole', normalizedRole);
    }
  }, [normalizedRole, setUserRole]);

  // ─────────────────────────────────────────────────────────────────
  // FAST PATH REDIRECT — instant, no loading state shown.
  // ─────────────────────────────────────────────────────────────────
  if (fastRole === 'business_owner') return <Navigate to="/dashboard/business-owner" replace />;
  if (fastRole === 'super_admin')    return <Navigate to="/dashboard/super-admin" replace />;
  if (fastRole === 'admin')          return <Navigate to="/dashboard/admin" replace />;
  if (fastRole === 'advertiser')     return <Navigate to="/dashboard/advertiser" replace />;

  // ─────────────────────────────────────────────────────────────────
  // SLOW PATH — role was not cached; show a minimal loading state
  // while sync + API fetch complete.
  // ─────────────────────────────────────────────────────────────────
  const isCurrentlyLoading = (isLoading || isSyncLoading || !isSyncSuccess) && !isSyncError && !isError;

  if (isCurrentlyLoading && !timedOut) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 text-center">
        <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
        <div className="text-lg font-medium text-gray-700">Setting up your dashboard…</div>
        <div className="mt-2 text-sm text-gray-400">
          {isLongLoading
            ? "The server is taking a bit longer to wake up. Please wait…"
            : "Just a moment"}
        </div>
      </div>
    );
  }

  if (isError || isSyncError) {
    const errorMessage =
      (syncError as any)?.response?.data?.message ??
      (syncError as any)?.message ??
      "Unknown error during synchronization";

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-red-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Sync Error</h2>
          <p className="text-gray-600 mb-6">We couldn't synchronize your account with our database.</p>
          <div className="text-left bg-gray-50 p-4 rounded-xl mb-6 font-mono text-[10px] overflow-auto max-h-32">
            {errorMessage}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-primary-blue text-white rounded-full font-bold shadow-lg hover:bg-primary-blue transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (timedOut) {
    console.warn("[RoleDashboardRedirectPage] Redirection timed out after 60s");
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-orange-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border-t-4 border-orange-500">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Timeout</h2>
          <p className="text-gray-600 mb-6">The server is taking too long to respond. This usually happens if the system is waking up from standby.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-primary-blue text-white rounded-full font-bold shadow-lg hover:bg-primary-blue transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = "/dashboard/advertiser"}
              className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-full font-medium hover:bg-gray-50 transition-all"
            >
              Skip to Default Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Slow-path redirect once API data resolves.
  if (normalizedRole === "business_owner") return <Navigate to="/dashboard/business-owner" replace />;
  if (normalizedRole === "super_admin")    return <Navigate to="/dashboard/super-admin" replace />;
  if (normalizedRole === "admin")          return <Navigate to="/dashboard/admin" replace />;
  if (normalizedRole === "advertiser")     return <Navigate to="/dashboard/advertiser" replace />;

  // ─────────────────────────────────────────────────────────────────
  // NO ROLE — role selection UI (SSO users who bypassed initial setup)
  // ─────────────────────────────────────────────────────────────────
  if (!isLoading && !normalizedRole) {
    const handleRoleSubmit = () => {
      if (!selectedRole) {
        setRoleError("Please select a role to continue.");
        return;
      }
      setRoleError(null);
      localStorage.setItem('pendingUserRole', selectedRole);
      updateRoleMutation.mutate(selectedRole);
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-linear-to-br from-gray-50 via-white to-primary-blue/5">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-blue/10 flex items-center justify-center mx-auto mb-5">
              <ArrowRight className="w-8 h-8 text-primary-blue" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-dark mb-2">Choose Your Role</h2>
            <p className="text-sm text-neutral-medium max-w-xs mx-auto">
              Select how you'd like to use the platform. This determines your dashboard and available features.
            </p>
          </div>

          {/* Error Message */}
          {roleError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
              {roleError}
            </div>
          )}

          {/* Role Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => { setSelectedRole('business_owner'); setRoleError(null); }}
              className={`group relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 ${selectedRole === 'business_owner'
                ? 'border-primary-blue bg-primary-blue/5 shadow-lg shadow-primary-blue/10'
                : 'border-gray-100 bg-white hover:border-primary-blue/30 hover:shadow-md'
                }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${selectedRole === 'business_owner'
                ? 'bg-primary-blue text-white'
                : 'bg-gray-50 text-neutral-medium group-hover:bg-primary-blue/10 group-hover:text-primary-blue'
                }`}>
                <Briefcase size={26} />
              </div>
              <div className="text-center">
                <span className="text-sm font-bold text-neutral-dark block">Business Owner</span>
                <span className="text-[10px] text-neutral-medium mt-1 block">Post campaigns & find advertisers</span>
              </div>
              {selectedRole === 'business_owner' && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-blue flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('advertiser'); setRoleError(null); }}
              className={`group relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 ${selectedRole === 'advertiser'
                ? 'border-primary-blue bg-primary-blue/5 shadow-lg shadow-primary-blue/10'
                : 'border-gray-100 bg-white hover:border-primary-blue/30 hover:shadow-md'
                }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${selectedRole === 'advertiser'
                ? 'bg-primary-blue text-white'
                : 'bg-gray-50 text-neutral-medium group-hover:bg-primary-blue/10 group-hover:text-primary-blue'
                }`}>
                <Megaphone size={26} />
              </div>
              <div className="text-center">
                <span className="text-sm font-bold text-neutral-dark block">Advertiser</span>
                <span className="text-[10px] text-neutral-medium mt-1 block">Apply to campaigns & earn</span>
              </div>
              {selectedRole === 'advertiser' && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-blue flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleRoleSubmit}
            disabled={!selectedRole || updateRoleMutation.isPending}
            className="w-full py-3.5 bg-primary-blue text-white rounded-full font-bold shadow-lg shadow-primary-blue/20 hover:bg-primary-blue active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {updateRoleMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                Continue to Dashboard
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="mt-5 text-center text-[10px] text-neutral-medium">
            Your role can be updated later by contacting support.
          </p>
        </div>
      </div>
    );
  }

  return <Navigate to="/dashboard/advertiser" replace />;
}
