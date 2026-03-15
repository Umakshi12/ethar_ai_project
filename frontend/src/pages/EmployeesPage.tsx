import { FormEvent, useMemo, useState } from "react";
import { CalendarCheck, Trash2, TrendingUp, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import {
  useCreateEmployee,
  useDeleteEmployee,
  useEmployees,
} from "@/hooks/useEmployees";
import type { Employee } from "@/types";

const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Operations",
  "Customer Support",
] as const;

type EmployeeFormState = {
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
};

type EmployeeFormErrors = Partial<Record<keyof EmployeeFormState, string>>;

export function EmployeesPage() {
  const { data: employees, isLoading, isError, refetch } = useEmployees();
  const createEmployee = useCreateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formState, setFormState] = useState<EmployeeFormState>({
    employee_id: "",
    full_name: "",
    email: "",
    department: "",
  });
  const [formErrors, setFormErrors] = useState<EmployeeFormErrors>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null
  );

  const totalEmployees = employees?.length ?? 0;

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    if (!searchQuery.trim()) return employees;

    const query = searchQuery.trim().toLowerCase();
    return employees.filter((emp) => {
      return (
        emp.full_name.toLowerCase().includes(query) ||
        emp.employee_id.toLowerCase().includes(query) ||
        emp.department.toLowerCase().includes(query)
      );
    });
  }, [employees, searchQuery]);

  const searchHasNoResults =
    !!employees && !!searchQuery.trim() && filteredEmployees.length === 0;

  const resetForm = () => {
    setFormState({
      employee_id: "",
      full_name: "",
      email: "",
      department: "",
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: EmployeeFormErrors = {};

    if (!formState.employee_id.trim()) {
      errors.employee_id = "Employee ID is required";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formState.employee_id.trim())) {
      errors.employee_id =
        "Employee ID must be alphanumeric and may include dashes or underscores";
    }

    if (!formState.full_name.trim()) {
      errors.full_name = "Full name is required";
    }

    if (!formState.email.trim()) {
      errors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())
    ) {
      errors.email = "Invalid email format";
    }

    if (!formState.department) {
      errors.department = "Department is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    createEmployee.mutate(
      {
        employee_id: formState.employee_id.trim(),
        full_name: formState.full_name.trim(),
        email: formState.email.trim(),
        department: formState.department,
      },
      {
        onSuccess: () => {
          resetForm();
          setIsAddModalOpen(false);
        },
      }
    );
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!employeeToDelete) return;
    deleteEmployee.mutate(employeeToDelete.employee_id, {
      onSuccess: () => {
        setEmployeeToDelete(null);
      },
    });
  };

  const isMutating = createEmployee.isPending || deleteEmployee.isPending;

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Employees</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            {totalEmployees} total employee{totalEmployees === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          <span>Add Employee</span>
        </Button>
      </div>

      {/* Search input */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="search"
          placeholder="Search by name, ID, or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:max-w-xs"
          aria-label="Search employees"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="self-start text-xs font-medium text-gray-500 hover:text-gray-700 sm:self-auto"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Table / states */}
      <div className="rounded-xl border border-gray-100 bg-white p-0 shadow-sm">
        {isLoading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 px-6 py-4"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="ml-auto h-4 w-16" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-6">
            <ErrorState
              message="Unable to load employees."
              onRetry={() => refetch()}
            />
          </div>
        ) : !employees || employees.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Users}
              title="No employees found"
              description="Add your first employee to get started with HRMS Lite."
              action={{
                label: "Add Employee",
                onClick: handleOpenAddModal,
              }}
            />
          </div>
        ) : searchHasNoResults ? (
          <div className="p-6 text-center text-xs text-gray-500">
            No results for &quot;{searchQuery}&quot;. Try adjusting your search
            terms.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Department
                  </th>
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Present Days
                  </th>
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {filteredEmployees.map((employee, index, array) => (
                  <tr
                    key={employee.employee_id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-xs">
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 font-mono text-[11px] text-gray-700">
                        {employee.employee_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-900">
                      {employee.full_name}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <Badge variant="info">{employee.department}</Badge>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                        <TrendingUp
                          className="h-3 w-3 text-emerald-500"
                          aria-hidden="true"
                        />
                        <span>{employee.total_present_days} days</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/attendance?employee_id=${encodeURIComponent(
                            employee.employee_id
                          )}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          aria-label={`View attendance for ${employee.full_name}`}
                        >
                          <CalendarCheck
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                        </a>
                        <button
                          type="button"
                          onClick={() => setEmployeeToDelete(employee)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${employee.full_name}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add employee modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          if (!createEmployee.isPending) {
            setIsAddModalOpen(false);
          }
        }}
        title="Add New Employee"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Employee ID"
            name="employee_id"
            placeholder="e.g. EMP001"
            value={formState.employee_id}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                employee_id: e.target.value,
              }))
            }
            error={formErrors.employee_id}
            disabled={createEmployee.isPending}
            required
          />
          <Input
            label="Full Name"
            name="full_name"
            placeholder="e.g. John Doe"
            value={formState.full_name}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                full_name: e.target.value,
              }))
            }
            error={formErrors.full_name}
            disabled={createEmployee.isPending}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="e.g. john@company.com"
            value={formState.email}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
            error={formErrors.email}
            disabled={createEmployee.isPending}
            required
          />
          <Select
            label="Department"
            name="department"
            value={formState.department}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                department: e.target.value,
              }))
            }
            options={[
              { value: "", label: "Select department" },
              ...DEPARTMENTS.map((dept) => ({
                value: dept,
                label: dept,
              })),
            ]}
            error={formErrors.department}
            disabled={createEmployee.isPending}
            required
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={createEmployee.isPending}
            disabled={isMutating}
            className="mt-2 w-full"
          >
            Add Employee
          </Button>
        </form>
      </Modal>

      {/* Delete confirm dialog */}
      <ConfirmDialog
        isOpen={!!employeeToDelete}
        onClose={() => {
          if (!deleteEmployee.isPending) {
            setEmployeeToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Employee"
        message={
          employeeToDelete
            ? `Are you sure you want to delete ${employeeToDelete.full_name}? This will also remove all their attendance records. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete Employee"
        loading={deleteEmployee.isPending}
      />
    </div>
  );
}

