import { Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
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

export default function RoleDashboardRedirectPage() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [timedOut, setTimedOut] = useState(false);
  const { setUserRole } = useUser();
  const [selectedRole, setSelectedRole] = useState<'business_owner' | 'advertiser' | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  // Ensure social-login role is synced before we resolve redirect.
  const { isSuccess: isSyncSuccess, isLoading: isSyncLoading } = useUserSync();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const response = await userApi.getMe(api);
      return response.data as any;
    },
    retry: 3,
    retryDelay: 1000,
    enabled: isSyncSuccess, // Wait for sync to finish before querying
  });

  // Mutation to update user role in the database when user picks one from this page
  const updateRoleMutation = useMutation({
    mutationFn: async (role: 'business_owner' | 'advertiser') => {
      // Re-sync user with the selected role
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

  useEffect(() => {
    const timer = window.setTimeout(() => setTimedOut(true), 15000); // Increased timeout
    return () => window.clearTimeout(timer);
  }, []);

  const fallbackRole = useMemo(() => {
    const pendingRole = localStorage.getItem("pendingUserRole");
    const userRole = localStorage.getItem("userRole");
    return pendingRole || userRole || "";
  }, []);

  const rawRole =
    (data as any)?.user?.role ??
    (data as any)?.data?.user?.role ??
    (data as any)?.role ??
    (data as any)?.data?.role ??
    fallbackRole;

  const status =
    (data as any)?.user?.status ??
    (data as any)?.data?.user?.status ??
    (data as any)?.status ??
    (data as any)?.data?.status;

  const normalizedRole = String(rawRole || "")
    .toLowerCase()
    .replace(/[-\s]/g, "_") as any;

  useEffect(() => {
    if (normalizedRole && normalizedRole !== (localStorage.getItem('userRole'))) {
      console.log("[RoleDashboardRedirectPage] Updating UserContext role to:", normalizedRole);
      // Map roles to context types
      setUserRole(normalizedRole as any);
      localStorage.setItem('userRole', normalizedRole);
    }
  }, [normalizedRole, setUserRole]);

  const isCurrentlyLoading = isLoading || isSyncLoading || (!isSyncSuccess);

  if (isCurrentlyLoading && !timedOut) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#14a800] border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-lg font-medium text-gray-700">Verifying access permissions...</div>
        <div className="mt-2 text-sm text-gray-400">Connecting to secure database</div>
      </div>
    );
  }

  const isProfileComplete =
    (data as any)?.user?.profileData?.bio ||
    (data as any)?.data?.user?.profileData?.bio ||
    (data as any)?.profileData?.bio;


  const isApproved = status === 'active' || status === 'approved';

  // Let the dashboards handle the status internally so they keep the sidebar/layout
  if (normalizedRole === "business_owner") {
    return <Navigate to="/dashboard/business-owner" replace />;
  }

  if (normalizedRole === "super_admin") {
    return <Navigate to="/dashboard/super-admin" replace />;
  }

  if (normalizedRole === "admin") {
    return <Navigate to="/dashboard/admin" replace />;
  }

  if (normalizedRole === "advertiser") {
    return <Navigate to="/dashboard/advertiser" replace />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-red-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Sync Error</h2>
          <p className="text-gray-600 mb-6">We couldn't synchronize your account with our database.</p>
          <div className="text-left bg-gray-50 p-4 rounded-xl mb-6 font-mono text-[10px] overflow-auto max-h-32">
            {(isError as any)?.message || (isError as any)?.response?.data?.message || "Unknown error"}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-[#14a800] text-white rounded-full font-bold shadow-lg hover:bg-[#108a00] transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (timedOut) {
    console.warn("[RoleDashboardRedirectPage] Redirection timed out, defaulting to advertiser");
    return <Navigate to="/dashboard/advertiser" replace />;
  }

  // Show role selection UI when the user has no role assigned
  // This handles edge cases like SSO users who bypassed role selection
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
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-linear-to-br from-gray-50 via-white to-[#14a800]/5">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#14a800]/10 flex items-center justify-center mx-auto mb-5">
              <ArrowRight className="w-8 h-8 text-[#14a800]" />
            </div>
            <h2 className="text-2xl font-bold text-[#001e00] mb-2">Choose Your Role</h2>
            <p className="text-sm text-[#5e6d55] max-w-xs mx-auto">
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
                  ? 'border-[#14a800] bg-[#14a800]/5 shadow-lg shadow-[#14a800]/10'
                  : 'border-gray-100 bg-white hover:border-[#14a800]/30 hover:shadow-md'
                }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${selectedRole === 'business_owner'
                  ? 'bg-[#14a800] text-white'
                  : 'bg-gray-50 text-[#5e6d55] group-hover:bg-[#14a800]/10 group-hover:text-[#14a800]'
                }`}>
                <Briefcase size={26} />
              </div>
              <div className="text-center">
                <span className="text-sm font-bold text-[#001e00] block">Business Owner</span>
                <span className="text-[10px] text-[#5e6d55] mt-1 block">Post campaigns & find advertisers</span>
              </div>
              {selectedRole === 'business_owner' && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#14a800] flex items-center justify-center">
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
                  ? 'border-[#14a800] bg-[#14a800]/5 shadow-lg shadow-[#14a800]/10'
                  : 'border-gray-100 bg-white hover:border-[#14a800]/30 hover:shadow-md'
                }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${selectedRole === 'advertiser'
                  ? 'bg-[#14a800] text-white'
                  : 'bg-gray-50 text-[#5e6d55] group-hover:bg-[#14a800]/10 group-hover:text-[#14a800]'
                }`}>
                <Megaphone size={26} />
              </div>
              <div className="text-center">
                <span className="text-sm font-bold text-[#001e00] block">Advertiser</span>
                <span className="text-[10px] text-[#5e6d55] mt-1 block">Apply to campaigns & earn</span>
              </div>
              {selectedRole === 'advertiser' && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#14a800] flex items-center justify-center">
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
            className="w-full py-3.5 bg-[#14a800] text-white rounded-full font-bold shadow-lg shadow-[#14a800]/20 hover:bg-[#108a00] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {updateRoleMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue to Dashboard
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="mt-5 text-center text-[10px] text-[#5e6d55]">
            Your role can be updated later by contacting support.
          </p>
        </div>
      </div>
    );
  }

  return <Navigate to="/dashboard/advertiser" replace />;
}
