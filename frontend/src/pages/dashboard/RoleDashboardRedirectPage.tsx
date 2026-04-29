import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useApiClient, userApi } from "../../utils/api";
import { useUserSync } from "../../hooks/useUserSync";
import type { User } from "../../types";
import { useUser } from "../../shared/context/UserContext";

type CurrentUserResponse = {
  data?: User;
};

type UserRole = 'business' | 'advertiser' | 'admin' | 'business_owner' | 'super_admin' | null;

export default function RoleDashboardRedirectPage() {
  const api = useApiClient();
  const [timedOut, setTimedOut] = useState(false);
  const { setUserRole } = useUser();

  // Ensure social-login role is synced before we resolve redirect.
  useUserSync();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const response = await userApi.getCurrentUser(api);
      return response.data as any;
    },
    retry: 1,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setTimedOut(true), 6000); // Increased timeout
    return () => window.clearTimeout(timer);
  }, []);

  const fallbackRole = useMemo(() => {
    const pendingRole = localStorage.getItem("pendingUserRole");
    const userRole = localStorage.getItem("userRole");
    return pendingRole || userRole || "";
  }, []);

  if (isLoading && !timedOut) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#14a800] border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-lg font-medium text-gray-700">Verifying access permissions...</div>
        <div className="mt-2 text-sm text-gray-400">Connecting to secure database</div>
      </div>
    );
  }

  const rawRole =
    (data as any)?.user?.role ??
    (data as any)?.data?.user?.role ??
    (data as any)?.role ??
    (data as any)?.data?.role ??
    fallbackRole;
    
  const normalizedRole = String(rawRole || "")
    .toLowerCase()
    .replace(/[-\s]/g, "_") as any;

  if (normalizedRole && normalizedRole !== (localStorage.getItem('userRole'))) {
    console.log("[RoleDashboardRedirectPage] Updating UserContext role to:", normalizedRole);
    // Map roles to context types
    let contextRole = normalizedRole;
    if (contextRole === 'business_owner') contextRole = 'business';
    
    setUserRole(contextRole as any);
  }

  if (normalizedRole === "business" || normalizedRole === "business_owner") {
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
            Error details: {JSON.stringify(isError)}
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

  // Final fallback if data is loaded but role is missing
  if (!isLoading && !normalizedRole) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-gray-200 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">No Role Assigned</h2>
          <p className="text-gray-500 mb-6 text-sm">Your account exists but doesn't have a role assigned yet. Please contact support.</p>
          <button onClick={() => window.location.href = '/'} className="text-[#14a800] font-bold">Back to Home</button>
        </div>
      </div>
    );
  }

  return <Navigate to="/dashboard/advertiser" replace />;
}
