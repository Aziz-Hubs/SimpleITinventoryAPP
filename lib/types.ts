import { z } from "zod";

// Extended asset schema matching inv.json structure
export const assetSchema = z.object({
  id: z.number().optional(),
  category: z.string(),
  state: z.string(),
  warrantyexpiry: z.string().optional(),
  make: z.string(),
  model: z.string(),
  cpu: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  dedicatedgpu: z.string().optional(),
  "usb-aports": z.string().optional(),
  "usb-cports": z.string().optional(),
  servicetag: z.string(),
  employee: z.string(),
  additionalcomments: z.string().optional(),
  location: z.string(),
  dimensions: z.string().optional(),
  resolution: z.string().optional(),
  refreshhertz: z.string().optional(),
});

export type Asset = z.infer<typeof assetSchema>;

// Category and State enums for type safety
export const ASSET_CATEGORIES = [
  "Laptop",
  "Monitor",
  "Docking",
  "Headset",
  "Desktop",
  "Network Switch",
  "Firewall",
  "Access Point",
  "5G/4G Modem",
  "UPS",
  "NVR",
  "Printer",
  "TV"
] as const;

export const ASSET_STATES = ["GOOD", "NEW", "FAIR", "BROKEN"] as const;
export const ASSET_LOCATIONS = ["Office", "Server"] as const;

export type AssetCategory = typeof ASSET_CATEGORIES[number];
export type AssetState = typeof ASSET_STATES[number];
export type AssetLocation = typeof ASSET_LOCATIONS[number];

// Legacy format for backward compatibility
export const assetLegacySchema = z.object({
  id: z.number(),
  Make: z.string(),
  Model: z.string(),
  Category: z.string(),
  "Service Tag": z.string(),
  State: z.string(),
  Employee: z.string(),
  Location: z.string(),
  "Warranty Expiry": z.string().optional(),
  // Extended hardware specs
  CPU: z.string().optional(),
  RAM: z.string().optional(),
  Storage: z.string().optional(),
  "Dedicated GPU": z.string().optional(),
  "USB-A Ports": z.string().optional(),
  "USB-C Ports": z.string().optional(),
  // Display specs
  Dimensions: z.string().optional(),
  Resolution: z.string().optional(),
  "Refresh Rate": z.string().optional(),
});

export type AssetLegacy = z.infer<typeof assetLegacySchema>;

export interface DashboardStats {
  totalAssets: {
    count: number;
    assigned: number;
    inStock: number;
  };
  deployment: {
    count: number;
    percentage: number;
  };
  stock: {
    count: number;
    ready: number;
  };
  maintenance: {
    count: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export type ChartDataPoint = {
  date: string;
  laptop: number;
  monitor: number;
  peripheral: number;
};

export interface Activity {
  id: number;
  user: {
    name: string;
    avatar: string;
    initials: string;
  };
  action: string;
  target: string;
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: never;
}

export interface ApiErrorResponse {
  data?: never;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Asset filter parameters
export interface AssetFilters {
  page?: number;
  pageSize?: number;
  category?: string;
  state?: string;
  employee?: string;
  location?: string;
  search?: string;
}

// Employee type
export interface Employee {
  id: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
}

// Deployment operation types
export interface AssignAssetRequest {
  assetId: number;
  employeeId: number;
  notes?: string;
}

export interface UnassignAssetRequest {
  assetId: number;
  notes?: string;
}

export interface OnboardRequest {
  employeeId: number;
  assetIds: number[];
  notes?: string;
}

export interface OffboardRequest {
  employeeId: number;
  notes?: string;
}

// Import/Export types
export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}
