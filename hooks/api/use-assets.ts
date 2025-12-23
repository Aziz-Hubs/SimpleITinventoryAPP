/**
 * @file use-assets.ts
 * @description specialized TanStack Query hooks for IT asset lifecycle management.
 * Encapsulates caching, optimistic updates, and unified error/success UI feedback
 * for the inventory feature.
 * @path /hooks/api/use-assets.ts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAssets, getAssetById, createAsset, updateAsset, deleteAsset } from '@/services/inventory-service';
import { Asset, AssetFilters, AssetCreate, AssetUpdate } from '@/lib/types';
import { toast } from 'sonner';

/**
 * Factory for consistent React Query keys.
 * Structured to allow fine-grained or broad cache invalidation.
 */
export const ASSET_KEYS = {
  all: ['assets'] as const,
  lists: () => [...ASSET_KEYS.all, 'list'] as const,
  list: (filters: AssetFilters) => [...ASSET_KEYS.lists(), { filters } ] as const,
  details: () => [...ASSET_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...ASSET_KEYS.details(), id] as const,
};

/**
 * Fetches a list of assets based on provided filters.
 * 
 * @param filters - Pagination and search/category criteria.
 */
export function useAssets(filters: AssetFilters = {}) {
  return useQuery({
    queryKey: ASSET_KEYS.list(filters),
    queryFn: () => getAssets(filters),
  });
}

/**
 * Fetches specific asset details by ID.
 * 
 * @param id - Numeric asset identifier.
 */
export function useAsset(id: number | undefined) {
  return useQuery({
    queryKey: ASSET_KEYS.detail(id!),
    queryFn: () => getAssetById(id!),
    enabled: !!id,
  });
}

/**
 * Mutation hook for adding a new asset.
 * Triggers re-fetch of asset lists on success.
 */
export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newAsset: AssetCreate) => createAsset(newAsset),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.lists() });
      toast.success('Asset created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
}

/**
 * Mutation hook for modifying an existing asset.
 * Invalidates both the list view and the individual detail cache.
 */
export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, asset }: { id: number; asset: AssetUpdate }) => updateAsset(id, asset),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.detail(data.id) });
      toast.success('Asset updated successfully');
    },
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ASSET_KEYS.detail(data.id) });
      }
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.lists() });
    },
    onError: (error) => {
      toast.error(`Failed to update asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
}

/**
 * Mutation hook for asset removal.
 */
export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.lists() });
      toast.success('Asset deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
}

/**
 * Specialized mutation for re-assigning hardware to an employee.
 * Implements Optimistic UI Updates: immediately reflects the assignment change
 * in the local cache while the network request is pending.
 */
export function useAssignAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, employee }: { id: number; employee: string }) => 
      updateAsset(id, { employeeId: employee }),
    onMutate: async ({ id, employee }) => {
      // Cancel any outgoing refetches to prevent them overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ASSET_KEYS.all });

      // Snapshot the current cache state for rollback on error
      const previousAssets = queryClient.getQueryData(ASSET_KEYS.lists());

      // Manually patch the list query data
      queryClient.setQueriesData({ queryKey: ASSET_KEYS.lists() }, (old: { data: Asset[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((asset: Asset) => 
            asset.id === id ? { ...asset, employeeId: employee } : asset
          ),
        };
      });

      return { previousAssets };
    },
    onError: (err, variables, context) => {
      // Rollback to previous state if API call fails
      queryClient.setQueryData(ASSET_KEYS.lists(), context?.previousAssets);
      toast.error(`Failed to assign asset: ${err instanceof Error ? err.message : 'Unknown error'}`);
    },
    onSettled: () => {
      // Sync with server regardless of success or failure
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.all });
    },
    onSuccess: () => {
      toast.success('Asset assigned successfully');
    },
  });
}
