import { api } from "./client";
import type { DashboardSummary } from "@/types";

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    const res = await api.get<DashboardSummary>("/dashboard");
    return res.data;
  },
};

