/**
 * @file use-table-params.ts
 * @description Centralized hook for managing data table state (pagination, filtering, sorting) 
 * via URL search parameters. This ensures table state is shareable, bookmarkable, and 
 * persists through page refreshes.
 * @path /hooks/use-table-params.ts
 */

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

/**
 * Hook to read and write table state to the URL.
 * Automatically handles type conversion (e.g., string to int for page numbers)
 * and cleans up URL segments by removing default values.
 * 
 * @returns {Object} { params, setParams }
 */
export function useTableParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Memoized view of current URL parameters.
   * Provides sensible defaults when parameters are missing.
   */
  const params = useMemo(() => {
    return {
      page: parseInt(searchParams.get('page') || '1', 10),
      pageSize: parseInt(searchParams.get('pageSize') || '10', 10),
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || 'all',
      state: searchParams.get('state') || 'all',
      tab: searchParams.get('tab') || 'all',
      sortBy: searchParams.get('sortBy') || '',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
    };
  }, [searchParams]);

  /**
   * Updates the URL with new parameter values.
   * Logic:
   * 1. Clones existing search params.
   * 2. Iterates through updates.
   * 3. Deletes keys if value is default ('all', 1, empty string) to keep the URL clean.
   * 4. Pushes the new URL to the router without triggering a full page scroll.
   * 
   * @param newParams - Partial object containing fields to change.
   */
  const setParams = useCallback(
    (newParams: Partial<typeof params>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      
      Object.entries(newParams).forEach(([key, value]) => {
        // Optimization: Don't pollute URL with default values
        if (value === undefined || value === null || value === '' || value === 'all' || (key === 'page' && value === 1)) {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      const search = current.toString();
      const query = search ? `?${search}` : '';
      
      // Use replace instead of push to prevent full page resets
      // scroll: false prevents the page from jumping to top on filter change
      router.replace(`${pathname}${query}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return {
    params,
    setParams,
  };
}
