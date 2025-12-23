/**
 * @file use-maintenance.ts
 * @description TanStack Query hooks for the maintenance lifecycle.
 * Manages ticket creation, status updates, and threaded comments with automated 
 * cache invalidation to keep the helpdesk view in sync.
 * @path /hooks/api/use-maintenance.ts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getMaintenanceRecords, 
  getMaintenanceRecordById, 
  createMaintenanceRequest, 
  updateMaintenanceStatus, 
  addMaintenanceComment, 
  updateMaintenanceRecord 
} from '@/services/maintenance-service';
import { MaintenanceRecord, MaintenanceStatusEnum, MaintenanceCreate, MaintenanceUpdate, MaintenanceFilters } from '@/lib/types';
import { toast } from 'sonner';

/**
 * Key factory for consistent cache management.
 */
export const MAINTENANCE_KEYS = {
  all: ['maintenance'] as const,
  lists: () => [...MAINTENANCE_KEYS.all, 'list'] as const,
  list: (filters: MaintenanceFilters) => [...MAINTENANCE_KEYS.lists(), { filters }] as const,
  details: () => [...MAINTENANCE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...MAINTENANCE_KEYS.details(), id] as const,
};

/**
 * Hook to retrieve maintenance tickets with filtering.
 * 
 * @param filters - Search query and status filters.
 */
export function useMaintenanceRecords(filters: MaintenanceFilters = {}) {
  return useQuery({
    queryKey: MAINTENANCE_KEYS.list(filters),
    queryFn: () => getMaintenanceRecords(filters),
  });
}

/**
 * Hook to retrieve a specific maintenance ticket.
 * 
 * @param id - The MNT-XXX ticket ID.
 */
export function useMaintenanceRecord(id: string | undefined) {
  return useQuery({
    queryKey: MAINTENANCE_KEYS.detail(id!),
    queryFn: () => getMaintenanceRecordById(id!),
    enabled: !!id,
  });
}

/**
 * Mutation for creating a new maintenance request.
 * Invalidates the list view to show the new ticket immediately after creation.
 */
export function useCreateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MaintenanceCreate) => createMaintenanceRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.lists() });
      toast.success('Maintenance request created');
    },
    onError: (error) => {
      toast.error(`Failed to create request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
}

/**
 * Mutation for transitioning a ticket's status.
 * Invalidates both lists and the specific detail view to reflect the lifecycle change.
 */
export function useUpdateMaintenanceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: MaintenanceStatusEnum; note?: string }) => 
      updateMaintenanceStatus(id, status, note),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.lists() });
      if (data) {
        queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.detail(data.id) });
      }
      toast.success('Status updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
}

/**
 * Mutation to add a new comment or internal note to a ticket.
 */
export function useAddMaintenanceComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content, isInternal }: { id: string; content: string; isInternal?: boolean }) => 
      addMaintenanceComment(id, content, isInternal),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.detail(variables.id) });
      toast.success('Comment added');
    },
    onError: (error) => {
      toast.error(`Failed to add comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
}

/**
 * Mutation for generic updates to a maintenance record (e.g., technician assignment).
 */
export function useUpdateMaintenanceRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: MaintenanceUpdate }) => 
      updateMaintenanceRecord(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.lists() });
      if (data) {
        queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.detail(data.id) });
      }
      toast.success('Record updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
}
