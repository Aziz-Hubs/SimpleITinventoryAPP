/**
 * @file utils.ts
 * @description General purpose utility functions for styling and data manipulation.
 * @path /lib/utils.ts
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PaginatedResponse } from "./types"

/**
 * Merges CSS class names using clsx and tailwind-merge.
 * This ensures that Tailwind utility classes are intelligently combined, 
 * resolving conflicts (e.g., 'p-2 p-4' becomes 'p-4').
 * 
 * @param inputs - Variadic list of class values (strings, objects, arrays).
 * @returns A single string of merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Manually paginates an array of data.
 * Used primarily for mocking backend pagination or handling small static datasets.
 * 
 * @param data - The full array of items to paginate.
 * @param page - The 1-indexed page number to retrieve.
 * @param pageSize - The number of items per page.
 * @returns A structured PaginatedResponse object containing the slice of data and metadata.
 */
export function paginateData<T>(data: T[], page: number = 1, pageSize: number = 50): PaginatedResponse<T> {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      page,
      pageSize,
      totalItems: data.length,
      totalPages: Math.ceil(data.length / pageSize),
    },
  };
}

