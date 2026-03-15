import { api } from "./client";
import type { Employee } from "@/types";

export const employeesApi = {
  async getAll(): Promise<Employee[]> {
    const res = await api.get<Employee[]>("/employees/");
    return res.data;
  },

  async create(payload: {
    employee_id: string;
    full_name: string;
    email: string;
    department: string;
  }): Promise<Employee> {
    const res = await api.post<Employee>("/employees/", payload);
    return res.data;
  },

  async delete(employeeId: string): Promise<void> {
    await api.delete(`/employees/${encodeURIComponent(employeeId)}`);
  },
};

