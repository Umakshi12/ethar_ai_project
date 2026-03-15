import { api } from "./client";
import type { Attendance, AttendanceSummary } from "@/types";

type AttendanceFilters = {
  employee_id?: string;
  date?: string;
};

export const attendanceApi = {
  async getAll(filters?: AttendanceFilters): Promise<Attendance[]> {
    const res = await api.get<Attendance[]>("/attendance/", {
      params: filters,
    });
    return res.data;
  },

  async mark(payload: {
    employee_id: string;
    date: string;
    status: "Present" | "Absent";
  }): Promise<Attendance> {
    const res = await api.post<Attendance>("/attendance/", payload);
    return res.data;
  },

  async getSummary(employeeId: string): Promise<AttendanceSummary> {
    const res = await api.get<AttendanceSummary>(
      `/attendance/summary/${encodeURIComponent(employeeId)}`
    );
    return res.data;
  },
};

