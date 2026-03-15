import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CalendarCheck,
  CalendarPlus,
  FilterX,
  Users,
} from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAttendance, useMarkAttendance } from "@/hooks/useAttendance";
import { useEmployees } from "@/hooks/useEmployees";
import { useAttendanceSummary } from "@/hooks/useAttendance";

type StatusOption = "Present" | "Absent" | null;

export function AttendancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlEmployeeId = searchParams.get("employee_id") || undefined;

  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  const todayLabel = format(today, "EEEE, MMM d, yyyy");

  const [filters, setFilters] = useState<{
    employee_id?: string;
    date?: string;
  }>({
    employee_id: urlEmployeeId,
    date: todayISO,
  });

  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [markEmployeeId, setMarkEmployeeId] = useState<string | "">(
    urlEmployeeId ?? ""
  );
  const [markDate, setMarkDate] = useState<string>(todayISO);
  const [markStatus, setMarkStatus] = useState<StatusOption>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const { data: employees, isLoading: isEmployeesLoading } = useEmployees();
  const {
    data: attendance,
    isLoading: isAttendanceLoading,
    isError: isAttendanceError,
    refetch: refetchAttendance,
  } = useAttendance(filters);
  const markAttendance = useMarkAttendance();
  const { data: summary } = useAttendanceSummary(filters.employee_id);

  useEffect(() => {
    // keep filters in sync with URL employee_id
    if (urlEmployeeId) {
      setFilters((prev) => ({
        ...prev,
        employee_id: urlEmployeeId,
      }));
      setMarkEmployeeId(urlEmployeeId);
    }
  }, [urlEmployeeId]);

  const handleFilterEmployeeChange = (value: string) => {
    const nextEmployeeId = value || undefined;
    setFilters((prev) => ({
      ...prev,
      employee_id: nextEmployeeId,
    }));
    const nextParams = new URLSearchParams(searchParams);
    if (nextEmployeeId) {
      nextParams.set("employee_id", nextEmployeeId);
    } else {
      nextParams.delete("employee_id");
    }
    setSearchParams(nextParams);
  };

  const handleFilterDateChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      date: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("employee_id");
    setSearchParams(nextParams);
  };

  const handleSubmitMarkAttendance = (event: FormEvent) => {
    event.preventDefault();
    setStatusError(null);

    if (!markEmployeeId) return;
    if (!markDate) return;
    if (!markStatus) {
      setStatusError("Please select a status");
      return;
    }

    markAttendance.mutate(
      {
        employee_id: markEmployeeId,
        date: markDate,
        status: markStatus,
      },
      {
        onSuccess: () => {
          setIsMarkModalOpen(false);
          setMarkDate(todayISO);
          setMarkStatus(null);
          if (urlEmployeeId) {
            setMarkEmployeeId(urlEmployeeId);
          }
        },
      }
    );
  };

  const isFiltersActive = Boolean(filters.employee_id || filters.date);
  const records = attendance ?? [];

  const overallStats = useMemo(() => {
    if (!records.length) {
      return {
        total: 0,
        present: 0,
        absent: 0,
        presentPct: 0,
        absentPct: 0,
      };
    }
    const present = records.filter((r) => r.status === "Present").length;
    const absent = records.filter((r) => r.status === "Absent").length;
    const total = records.length;
    const presentPct = Math.round((present / total) * 100);
    const absentPct = 100 - presentPct;
    return { total, present, absent, presentPct, absentPct };
  }, [records]);

  const selectedEmployee = useMemo(
    () =>
      employees?.find(
        (emp) => emp.employee_id === filters.employee_id
      ),
    [employees, filters.employee_id]
  );

  const isMutating = markAttendance.isPending;

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Attendance
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">{todayLabel}</p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setIsMarkModalOpen(true)}
          className="inline-flex items-center gap-2"
        >
          <CalendarPlus className="h-4 w-4" aria-hidden="true" />
          <span>Mark Attendance</span>
        </Button>
      </div>

      {/* Filters bar */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <div className="w-full md:w-1/2 lg:w-1/3">
              <Select
                label="Employee"
                value={filters.employee_id ?? ""}
                onChange={(e) =>
                  handleFilterEmployeeChange(e.target.value)
                }
                options={[
                  { value: "", label: "All Employees" },
                  ...(employees ?? []).map((emp) => ({
                    value: emp.employee_id,
                    label: emp.full_name,
                  })),
                ]}
                disabled={isEmployeesLoading}
              />
            </div>
            <div className="w-full md:w-1/2 lg:w-1/3">
              <Input
                label="Date"
                type="date"
                value={filters.date ?? ""}
                onChange={(e) =>
                  handleFilterDateChange(e.target.value)
                }
                max={todayISO}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isFiltersActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs text-gray-600"
              >
                <FilterX className="h-3 w-3" aria-hidden="true" />
                <span>Clear filters</span>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Table + summary */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Attendance table */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-gray-100 bg-white p-0 shadow-sm">
            {isAttendanceLoading ? (
              <div className="divide-y divide-gray-50">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 px-6 py-4"
                  >
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="ml-auto h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : isAttendanceError ? (
              <div className="p-6">
                <ErrorState
                  message="Unable to load attendance records."
                  onRetry={() => refetchAttendance()}
                />
              </div>
            ) : records.length === 0 ? (
              <div className="p-6">
                {isFiltersActive ? (
                  <div className="space-y-3 text-center text-xs text-gray-500">
                    <p>No records found for selected filters.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <EmptyState
                    icon={CalendarCheck}
                    title="No attendance records yet"
                    description="Mark attendance for your first employee to see records appear here."
                    action={{
                      label: "Mark attendance for your first employee →",
                      onClick: () => setIsMarkModalOpen(true),
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Date
                      </th>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Department
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {records.map((record) => {
                      const employee = employees?.find(
                        (emp) => emp.employee_id === record.employee_id
                      );
                      return (
                        <tr
                          key={record.id}
                          className="transition-colors hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 text-xs">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">
                                {record.employee_name ??
                                  employee?.full_name ??
                                  record.employee_id}
                              </span>
                              <span className="text-[11px] text-gray-500">
                                {record.employee_id}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-700">
                            {format(new Date(record.date), "EEE, dd MMM yyyy")}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <Badge
                              variant={
                                record.status === "Present"
                                  ? "present"
                                  : "absent"
                              }
                            >
                              {record.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            {employee?.department ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Summary sidebar */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            {filters.employee_id && selectedEmployee && summary ? (
              <>
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-900">
                    {selectedEmployee.full_name}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {selectedEmployee.department}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.total_present}
                  </p>
                  <p className="text-xs text-gray-500">Total present days</p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    {summary.total_days_recorded > 0 && (
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${
                            (summary.total_present /
                              summary.total_days_recorded) *
                            100
                          }%`,
                        }}
                      />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {summary.total_present} present, {summary.total_absent}{" "}
                    absent out of {summary.total_days_recorded} total days
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      Overall Attendance
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Current view summary
                    </p>
                  </div>
                  <Users className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {overallStats.total}
                  </p>
                  <p className="text-xs text-gray-500">
                    Total records in current view
                  </p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${overallStats.presentPct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {overallStats.present} present (
                    {overallStats.presentPct}
                    %) • {overallStats.absent} absent (
                    {overallStats.absentPct}
                    %)
                  </p>
                </div>
              </>
            )}
          </div>
        </aside>
      </section>

      {/* Mark attendance modal */}
      <Modal
        isOpen={isMarkModalOpen}
        onClose={() => {
          if (!isMutating) {
            setIsMarkModalOpen(false);
          }
        }}
        title="Mark Attendance"
      >
        <form className="space-y-4" onSubmit={handleSubmitMarkAttendance}>
          <Select
            label="Employee"
            value={markEmployeeId}
            onChange={(e) => setMarkEmployeeId(e.target.value)}
            options={[
              { value: "", label: "Select employee" },
              ...(employees ?? []).map((emp) => ({
                value: emp.employee_id,
                label: emp.full_name,
              })),
            ]}
            disabled={isEmployeesLoading || isMutating}
            required
          />
          <Input
            label="Date"
            type="date"
            value={markDate}
            onChange={(e) => setMarkDate(e.target.value)}
            max={todayISO}
            disabled={isMutating}
            required
          />
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-700">Status</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  markStatus === "Present"
                    ? "border-emerald-500 bg-emerald-100 text-emerald-700"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setMarkStatus("Present")}
                disabled={isMutating}
              >
                ✓ Present
              </button>
              <button
                type="button"
                className={`flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  markStatus === "Absent"
                    ? "border-red-500 bg-red-100 text-red-600"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setMarkStatus("Absent")}
                disabled={isMutating}
              >
                ✗ Absent
              </button>
            </div>
            {statusError && (
              <p className="text-[11px] text-red-500">{statusError}</p>
            )}
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={markAttendance.isPending}
            disabled={isMutating}
            className="mt-2 w-full"
          >
            Mark Attendance
          </Button>
        </form>
      </Modal>
    </div>
  );
}

