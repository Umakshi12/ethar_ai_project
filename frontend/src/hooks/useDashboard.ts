import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "@/api/dashboard";
import type { DashboardSummary } from "@/types";

export function useDashboard() {
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.getSummary,
    refetchInterval: 60_000,
  });
}

