import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useApiClient, userApi } from "../../utils/api";
import { useUserSync } from "../../hooks/useUserSync";
import type { User } from "../../types";

type CurrentUserResponse = {
  data?: User;
};

export default function RoleDashboardRedirectPage() {
  const api = useApiClient();
  const [timedOut, setTimedOut] = useState(false);

  // Ensure social-login role is synced before we resolve redirect.
  useUserSync();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const response = await userApi.getCurrentUser(api);
      return response.data as CurrentUserResponse;
    },
    retry: 1,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setTimedOut(true), 4000);
    return () => window.clearTimeout(timer);
  }, []);

  const fallbackRole = useMemo(() => {
    const pendingRole = localStorage.getItem("pendingUserRole");
    const userRole = localStorage.getItem("userRole");
    return pendingRole || userRole || "";
  }, []);

  if (isLoading && !timedOut) {
    return <div className="p-6 text-sm text-gray-500">Loading dashboard...</div>;
  }

  const rawRole =
    (data as any)?.data?.role ??
    (data as any)?.role ??
    (data as any)?.data?.user?.role ??
    fallbackRole;
  const normalizedRole = String(rawRole || "")
    .toLowerCase()
    .replace(/[-\s]/g, "_");

  if (normalizedRole === "business" || normalizedRole === "business_owner") {
    return <Navigate to="/dashboard/business-owner" replace />;
  }

  if (normalizedRole === "advertiser") {
    return <Navigate to="/dashboard/advertiser" replace />;
  }

  if (normalizedRole === "admin" || normalizedRole === "super_admin") {
    return <Navigate to="/dashboard/admin" replace />;
  }

  if (isError || timedOut) {
    // Fail-safe: never keep user stuck on loading page.
    return <Navigate to="/dashboard/advertiser" replace />;
  }

  return <Navigate to="/dashboard/advertiser" replace />;
}
