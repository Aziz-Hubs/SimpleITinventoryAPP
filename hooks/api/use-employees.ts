/**
 * @file use-employees.ts
 * @description TanStack Query hooks for employee management.
 * Provides hooks for fetching, creating, updating, and deleting employee records
 * while ensuring cache consistency across the application.
 * @path /hooks/api/use-employees.ts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } from '@/services/employee-service';
import { EmployeeCreate, EmployeeUpdate, EmployeeFilters } from '@/lib/types';
import { toast } from 'sonner';

/**
 * Key factory for consistent query key management.
 */
export const EMPLOYEE_KEYS = {
  all: ['employees'] as const,
  lists: () => [...EMPLOYEE_KEYS.all, 'list'] as const,
  list: (filters: EmployeeFilters) => [...EMPLOYEE_KEYS.lists(), { filters }] as const,
  details: () => [...EMPLOYEE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...EMPLOYEE_KEYS.details(), id] as const,
};

/**
 * Hook to retrieve a paginated or filtered list of employees.
 * 
 * @param filters - Search query and department filters.
 */
export function useEmployees(filters: EmployeeFilters = {}) {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.list(filters),
    queryFn: () => getEmployees(filters),
  });
}

/**
 * Hook to retrieve a single employee's profile by their unique ID.
 * 
 * @param id - The EMP-XXX string.
 */
export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.detail(id!),
    queryFn: () => getEmployeeById(id!),
    enabled: !!id,
  });
}

/**
 * Mutation hook for adding a new employee.
 * Logic: Validates, saves, and invalidates all employee list caches.
 */
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newEmployee: EmployeeCreate) => createEmployee(newEmployee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
      toast.success('Employee created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
}

/**
 * Mutation hook for updating employee attributes.
 * Updates both the general list cache and the specific detail cache for that employee.
 */
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, employee }: { id: string; employee: EmployeeUpdate }) => updateEmployee(id, employee),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.detail(data.id) });
      toast.success('Employee updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
}

/**
 * Mutation hook for deleting an employee.
 */
export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
      toast.success('Employee deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
}
