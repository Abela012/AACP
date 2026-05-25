import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../api/apiClient";

/**
 * Hook to fetch efficiency pulse metrics from admin analytics
 */
export const useEfficiencyPulse = () => {
  const api = useApiClient();

  return useQuery({
    queryKey: ["efficiencyPulse"],
    queryFn: async () => {
      const response = await api.get("/admin/analytics/efficiency-pulse");
      return (response.data as any)?.data || response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch trust score for a specific user
 */
export const useTrustScore = (userId: string | undefined) => {
  const api = useApiClient();

  return useQuery({
    queryKey: ["trustScore", userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await api.get(`/admin/analytics/trust-score/${userId}`);
      return (response.data as any)?.data || response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: !!userId,
  });
};

/**
 * Hook to fetch applicant reach and engagement metrics
 */
export const useApplicantMetrics = (limit: number = 6) => {
  const api = useApiClient();

  return useQuery({
    queryKey: ["applicantMetrics", limit],
    queryFn: async () => {
      const response = await api.get(
        `/admin/analytics/applicants/metrics?limit=${limit}`,
      );
      return (response.data as any)?.data || response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch profitability metrics for applicants
 */
export const useProfitabilityMetrics = (limit: number = 8) => {
  const api = useApiClient();

  return useQuery({
    queryKey: ["profitabilityMetrics", limit],
    queryFn: async () => {
      const response = await api.get(
        `/admin/analytics/applicants/profitability?limit=${limit}`,
      );
      return (response.data as any)?.data || response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for any authenticated user to fetch their OWN trust score.
 * Uses the /users/trust-score endpoint (no admin privileges required).
 */
export const useMyTrustScore = () => {
  const api = useApiClient();

  return useQuery({
    queryKey: ["myTrustScore"],
    queryFn: async () => {
      const response = await api.get("/users/trust-score");
      return (response.data as any)?.data || response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};
