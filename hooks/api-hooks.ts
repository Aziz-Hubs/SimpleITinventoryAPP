/**
 * @file api-hooks.ts
 * @description Provides a reusable set of React hooks for interacting with the service layer.
 * Implements standard patterns for data fetching (queries) and state modification (mutations),
 * including unified loading/error states and global toast notifications.
 * @path /hooks/api-hooks.ts
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '@/lib/api-client';
import { toast } from 'sonner';
import { getAssets } from '@/services/inventory-service';
import { getDashboardStats, getChartData, getActivities } from '@/services/dashboard-service';
import { AssetFilters } from '@/lib/types';

/**
 * Common state structure for read-only data fetching hooks.
 */
export interface UseApiQueryState<T> {
  /** The data returned by the query function, or null if not yet loaded. */
  data: T | null;
  /** True if a request is currently in flight. */
  loading: boolean;
  /** Error object if the request failed. */
  error: ApiError | null;
  /** Function to manually re-trigger the data fetch. */
  refetch: () => Promise<void>;
}

/**
 * Flexible hook for data fetching that manages the boilerplate of loading states and error toast displays.
 * 
 * @param queryFn - Async function that returns the data.
 * @param options - Configuration for callbacks, toast visibility, and manual activation.
 */
export function useApiQuery<T>(
  queryFn: () => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
    showErrorToast?: boolean;
    enabled?: boolean;
  }
): UseApiQueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
      options?.onSuccess?.(result);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('Unknown error occurred');
      setError(apiError);
      options?.onError?.(apiError);
      
      if (options?.showErrorToast !== false) {
        toast.error(apiError.message);
      }
    } finally {
      setLoading(false);
    }
  }, [queryFn, options]);

  useEffect(() => {
    if (options?.enabled !== false) {
      fetchData();
    }
  }, [fetchData, options?.enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * State structure for write-based mutation hooks.
 */
export interface UseApiMutationState<T, V> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  /** 
   * Triggers the modification. 
   * @param variables - The payload for the mutation.
   */
  mutate: (variables: V) => Promise<T | null>;
  /** Clears the current data and error states. */
  reset: () => void;
}

/**
 * Hook for performing state-changing operations like POST, PUT, or DELETE.
 * Handles success/error toasts and loading state tracking.
 * 
 * @param mutationFn - Async function that performs the action.
 * @param options - Customization for messages and callbacks.
 */
export function useApiMutation<T, V = void>(
  mutationFn: (variables: V) => Promise<T>,
  options?: {
    onSuccess?: (data: T, variables: V) => void;
    onError?: (error: ApiError, variables: V) => void;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
  }
): UseApiMutationState<T, V> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(
    async (variables: V): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        const result = await mutationFn(variables);
        setData(result);
        options?.onSuccess?.(result, variables);
        
        if (options?.showSuccessToast) {
          toast.success(options.successMessage || 'Operation completed successfully');
        }
        
        return result;
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError('Unknown error occurred');
        setError(apiError);
        options?.onError?.(apiError, variables);
        
        if (options?.showErrorToast !== false) {
          toast.error(apiError.message);
        }
        
        return null;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  };
}

/**
 * Feature-specific hook to fetch assets with filtering support.
 */
export function useInventory(filters?: AssetFilters) {
  return useApiQuery(
    () => getAssets(filters),
    {
      showErrorToast: true,
    }
  );
}

/**
 * Fetches current aggregated metrics for the dashboard components.
 */
export function useDashboardStats() {
  return useApiQuery(
    () => getDashboardStats(),
    {
      showErrorToast: true,
    }
  );
}

/**
 * Fetches time-series data intended for graphical chart representation.
 */
export function useChartData() {
  return useApiQuery(
    () => getChartData(),
    {
      showErrorToast: true,
    }
  );
}

/**
 * Fetches a list of the most recent system activities.
 */
export function useActivities() {
  return useApiQuery(
    () => getActivities(),
    {
      showErrorToast: true,
    }
  );
}
