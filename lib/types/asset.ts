/**
 * @file asset.ts
 * @description Defines Zod schemas, TypeScript interfaces, and constant values for asset management.
 * @path /lib/types/asset.ts
 */

import { z } from "zod";

/**
 * Core validation schema for an Asset.
 * Defines the structure for both hardware and general IT inventory items.
 */
export const assetSchema = z.object({
  id: z.number(),
  category: z.string().min(1, "Category is required"),
  state: z.string().min(1, "Status is required"),
  warrantyexpiry: z.string(),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  cpu: z.string(),
  ram: z.string(),
  storage: z.string(),
  dedicatedgpu: z.string(),
  "usb-aports": z.string(),
  "usb-cports": z.string(),
  servicetag: z.string().min(1, "Service Tag is required"),
  employee: z.string(),
  additionalcomments: z.string(),

  location: z.string().min(1, "Location is required"),
  dimensions: z.string(),
  resolution: z.string(),
  refreshhertz: z.string(),
});

/** Represents a full asset object with an ID. */
export type Asset = z.infer<typeof assetSchema>;

/** Schema for creating a new asset; omits the auto-generated ID. */
export const assetCreateSchema = assetSchema.omit({ id: true });

/** Type derived from assetCreateSchema for new asset payloads. */
export type AssetCreate = z.infer<typeof assetCreateSchema>;

/** Type for updating existing assets; all fields except ID are optional. */
export type AssetUpdate = Partial<AssetCreate>;

/** Supported hardware and device categories for inventory categorization. */
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

/** Standardized lifecycle states for IT assets. */
export const ASSET_STATES = ["GOOD", "NEW", "FAIR", "BROKEN"] as const;

/** physical locations where assets can be deployed. */
export const ASSET_LOCATIONS = ["Office", "Server"] as const;

export type AssetCategory = typeof ASSET_CATEGORIES[number];
export type AssetState = typeof ASSET_STATES[number];
export type AssetLocation = typeof ASSET_LOCATIONS[number];

/** Parameters for filtering and paginating asset lists. */
export interface AssetFilters {
  page?: number;
  pageSize?: number;
  category?: string;
  state?: string;
  employee?: string;
  location?: string;
  search?: string;
}

/** 
 * // TODO: (Refactor) Consider migrating away from AssetLegacy to a unified camelCase interface.
 * Represents the original data structure from legacy CSV/system imports.
 * Note the use of PascalCase and spaces in keys which deviates from modern standards.
 */
export interface AssetLegacy {
  id: number;
  Make: string;
  Model: string;
  Category: string;
  "Service Tag": string;
  State: string;
  Employee: string;
  Location: string;
  "Warranty Expiry"?: string;
  // Extended fields

  CPU?: string;
  RAM?: string;
  Storage?: string;
  "Dedicated GPU"?: string;
  "USB-A Ports"?: string;
  "USB-C Ports"?: string;
  Dimensions?: string;
  Resolution?: string;
  "Refresh Rate"?: string;
}

