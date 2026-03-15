import {
  Building2,
  CalendarCheck,
  CalendarDays,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAttendance } from "@/hooks/useAttendance";
import { useDashboard } from "@/hooks/useDashboard";
import { useEmployees } from "@/hooks/useEmployees";

function formatTodayLabel() {
  const now = new Date();
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(now);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardPage() {
  const {
    data: dashboard,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
  } = useDashboard();
  const {
    data: employees,
    isLoading: isEmployeesLoading,
    isError: isEmployeesError,
  } = useEmployees();

  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);

  const {
    data: attendance,
    isLoading: isAttendanceLoading,
    isError: isAttendanceError,
  } = useAttendance({ date: todayISO });

  const greeting = getGreeting();
  const todayLabel = formatTodayLabel();

  const recentEmployees = employees
    ? [...employees].slice(-5).reverse()
    : [];

  const todaysAttendance = attendance ?? [];
  const limitedAttendance = todaysAttendance.slice(0, 8);
  const hasMoreAttendance = todaysAttendance.length > 8;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-gray-700">
            {greeting} <span className="align-middle">👋</span>
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Here&apos;s what&apos;s happening in your team today.
          </p>
        </div>
        <p className="text-xs font-medium text-gray-500">{todayLabel}</p>
      </div>

      {/* Stats row */}
      <section aria-label="Today statistics">
        {isDashboardLoading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <Skeleton className="mb-4 h-4 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : isDashboardError || !dashboard ? (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <ErrorState
              message="Unable to load dashboard metrics."
              onRetry={() => {
                window.location.reload();
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Total Employees"
              value={dashboard.total_employees}
              icon={
                <Users className="h-5 w-5 text-indigo-600" aria-hidden="true" />
              }
              iconBg="bg-indigo-50"
            />
            <StatCard
              label="Present Today"
              value={dashboard.present_today}
              icon={
                <UserCheck
                  className="h-5 w-5 text-emerald-600"
                  aria-hidden="true"
                />
              }
              iconBg="bg-emerald-50"
            />
            <StatCard
              label="Absent Today"
              value={dashboard.absent_today}
              icon={
                <UserX className="h-5 w-5 text-red-500" aria-hidden="true" />
              }
              iconBg="bg-red-50"
            />
            <StatCard
              label="Departments"
              value={dashboard.departments}
              icon={
                <Building2
                  className="h-5 w-5 text-purple-600"
                  aria-hidden="true"
                />
              }
              iconBg="bg-purple-50"
            />
          </div>
        )}
      </section>

      {/* Bottom grid */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent employees table */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-gray-900">
                Recent Employees
              </h2>
              <Link
                to="/employees"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all &rarr;
              </Link>
            </div>

            {isEmployeesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-full" />
                  </div>
                ))}
              </div>
            ) : isEmployeesError ? (
              <ErrorState message="Unable to load employees." />
            ) : !employees || employees.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No employees yet"
                description="Get started by adding your first employee record. You’ll see them appear here as soon as they are created."
                action={{
                  label: "Add your first employee →",
                  onClick: () => {
                    window.location.href = "/employees";
                  },
                }}
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 font-medium text-gray-500">
                        Name
                      </th>
                      <th className="px-4 py-2 font-medium text-gray-500">
                        Employee ID
                      </th>
                      <th className="px-4 py-2 font-medium text-gray-500">
                        Department
                      </th>
                      <th className="px-4 py-2 font-medium text-gray-500">
                        Present Days
                      </th>
                      <th className="px-4 py-2 font-medium text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {recentEmployees.map((employee) => (
                      <tr key={employee.employee_id}>
                        <td className="px-4 py-2 text-xs text-gray-900">
                          {employee.full_name}
                        </td>
                        <td className="px-4 py-2 text-xs">
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-700">
                            {employee.employee_id}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-700">
                          {employee.department}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-700">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-700">
                            <CalendarDays
                              className="h-3 w-3 text-gray-400"
                              aria-hidden="true"
                            />
                            <span>{employee.total_present_days} days</span>
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs">
                          <Link
                            to={`/attendance?employee_id=${encodeURIComponent(
                              employee.employee_id
                            )}`}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                          >
                            View attendance
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Today's attendance summary */}
        <div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Today&apos;s Attendance
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  {todayLabel}
                </p>
              </div>
              <CalendarCheck
                className="h-5 w-5 text-indigo-500"
                aria-hidden="true"
              />
            </div>

            {isAttendanceLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-8 w-full" />
                ))}
              </div>
            ) : isAttendanceError ? (
              <ErrorState message="Unable to load today's attendance." />
            ) : todaysAttendance.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title="No attendance marked today"
                description="Once you start marking attendance, you’ll see a quick summary here."
              />
            ) : (
              <div className="space-y-2">
                <ul className="space-y-1">
                  {limitedAttendance.map((record) => (
                    <li
                      key={record.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {record.employee_name ?? record.employee_id}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {record.employee_id}
                        </span>
                      </div>
                      <StatusBadge status={record.status} />
                    </li>
                  ))}
                </ul>

                {hasMoreAttendance && (
                  <div className="pt-2 text-right">
                    <Link
                      to="/attendance"
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      View all attendance &rarr;
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
};

function StatCard({ label, value, icon, iconBg }: StatCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
        aria-hidden="true"
      >
        {icon}
      </div>
    </div>
  );
}

type StatusBadgeProps = {
  status: "Present" | "Absent" | string;
};

function StatusBadge({ status }: StatusBadgeProps) {
  const isPresent = status === "Present";
  const classes = isPresent
    ? "bg-emerald-100 text-emerald-700"
    : "bg-red-100 text-red-600";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}
    >
      {status}
    </span>
  );
}

