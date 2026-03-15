import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { attendanceApi } from "@/api/attendance";
import type { Attendance, AttendanceSummary } from "@/types";

type AttendanceFilters = {
  employee_id?: string;
  date?: string;
};

export function useAttendance(filters?: AttendanceFilters) {
  return useQuery<Attendance[]>({
    queryKey: ["attendance", filters ?? {}],
    queryFn: () => attendanceApi.getAll(filters),
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceApi.mark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Attendance saved");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to save attendance";
      toast.error(message);
    },
  });
}

export function useAttendanceSummary(employeeId: string | undefined) {
  return useQuery<AttendanceSummary>({
    queryKey: ["attendance-summary", employeeId],
    queryFn: () =>
      attendanceIdGuard(employeeId, () =>
        attendanceApi.getSummary(employeeId as string)
      ),
    enabled: Boolean(employeeId),
  });
}

async function attendanceIdGuard<T>(
  employeeId: string | undefined,
  fn: () => Promise<T>
): Promise<T> {
  if (!employeeId) {
    throw new Error("Employee ID is required");
  }
  return fn();
}

