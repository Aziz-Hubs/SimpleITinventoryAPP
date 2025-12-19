/**
 * React Hooks for API Integration
 * 
 * Custom hooks for data fetching with loading states, error handling,
 * and automatic retries.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '@/lib/api-client';
import { toast } from 'sonner';
import { getAssets } from '@/services/inventory-service';
import { getDashboardStats, getChartData, getActivities } from '@/services/dashboard-service';
import { AssetFilters } from '@/lib/types';

/**
 * Hook state interface
 */
export interface UseApiQueryState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching data with loading and error states
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
 * Hook for mutations (POST, PUT, DELETE)
 */
export interface UseApiMutationState<T, V> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  mutate: (variables: V) => Promise<T | null>;
  reset: () => void;
}

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
 * Hook for inventory data
 */
/**
 * Hook for inventory data
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
 * Hook for dashboard stats
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
 * Hook for chart data
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
 * Hook for activities
 */
export function useActivities() {
  return useApiQuery(
    () => getActivities(),
    {
      showErrorToast: true,
    }
  );
}
