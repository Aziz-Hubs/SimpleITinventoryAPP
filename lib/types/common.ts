/**
 * @file common.ts
 * @description Defines shared interfaces for API responses, dashboard statistics, activities, and data import results.
 * @path /lib/types/common.ts
 */

/**
 * High-level metrics for the dashboard visualization.
 */
export interface DashboardStats {
  /** Overview of total assets and their current assignment status. */
  totalAssets: {
    count: number;
    assigned: number;
    inStock: number;
  };
  /** Percentage-based deployment metrics. */
  deployment: {
    count: number;
    percentage: number;
  };
  /** Current stock levels and readiness for deployment. */
  stock: {
    count: number;
    ready: number;
  };
  /** Summary of maintenance tasks across different lifecycle stages. */
  maintenance: {
    count: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
}

/**
 * Data structure for time-series charts (e.g., inventory over time).
 */
export type ChartDataPoint = {
  /** ISO date string or formatted date label. */
  date: string;
  laptop: number;
  monitor: number;
  peripheral: number;
};

/**
 * Representation of a system activity or audit log entry.
 */
export interface Activity {
  /** Unique identifier for the activity record. */
  id: number;
  /** Information about the user who performed the action. */
  user: {
    name: string;
    avatar: string;
    initials: string;
  };
  /** The action performed (e.g., "Updated Asset"). */
  action: string;
  /** The specific entity affected by the action. */
  target: string;
  /** ISO 8601 timestamp. */
  timestamp: string;
  /** Optional deployment or activity comment. */
  comment?: string;
}

/**
 * Generic successful API response wrapper.
 */
export interface ApiResponse<T> {
  data: T;
  error?: never;
}

/**
 * Standardized API error response structure.
 */
export interface ApiErrorResponse {
  data?: never;
  /** Error details following a consistent schema. */
  error: {
    /** Machine-readable error code (e.g., "UNAUTHORIZED"). */
    code: string;
    /** Human-readable error message. */
    message: string;
    /** Optional contextual details for debugging or UI display. */
    details?: unknown;
  };
}

/**
 * Metadata for paginated list responses.
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Generic wrapper for paginated entity lists.
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Summary of a bulk data import operation (e.g., CSV upload).
 */
export interface ImportResult {
  /** Whether the overall process succeeded (even if some rows failed). */
  success: boolean;
  /** Count of successfully processed records. */
  imported: number;
  /** Count of records that encountered errors. */
  failed: number;
  /** Detailed log of failures by row number. */
  errors: Array<{
    row: number;
    message: string;
  }>;
}
