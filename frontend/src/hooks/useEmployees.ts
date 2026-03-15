import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { employeesApi } from "@/api/employees";
import type { Employee } from "@/types";

export function useEmployees() {
  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: employeesApi.getAll,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee added");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to add employee";
      toast.error(message);
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee removed");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to remove employee";
      toast.error(message);
    },
  });
}

