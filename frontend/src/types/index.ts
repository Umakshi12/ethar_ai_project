export type Employee = {
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  total_present_days: number;
};

export type Attendance = {
  id: string;
  employee_id: string;
  date: string;
  status: "Present" | "Absent";
  employee_name?: string;
};

export type AttendanceSummary = {
  employee_id: string;
  employee_name: string;
  total_present: number;
  total_absent: number;
  total_days_recorded: number;
};

export type DashboardSummary = {
  total_employees: number;
  present_today: number;
  absent_today: number;
  departments: number;
};

