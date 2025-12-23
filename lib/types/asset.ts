/**
 * @file asset.ts
 * @description Defines Zod schemas, TypeScript interfaces, and constant values for asset management.
 * @path /lib/types/asset.ts
 */

import { z } from "zod";
import { auditableEntitySchema } from "./common";

export enum AssetStateEnum {
  New = "NEW",
  Good = "GOOD",
  Fair = "FAIR",
  Broken = "BROKEN",
  Archived = "ARCHIVED", // Consistent with ASSET_STATES
}

export const assetSchema = auditableEntitySchema.extend({
  id: z.number(),
  serviceTag: z.string().min(1, "Service Tag is required"),
  modelId: z.number(),
  make: z.string().optional(),
  model: z.string().optional(),
  state: z.nativeEnum(AssetStateEnum),
  employeeId: z.string().uuid().nullable(),
  employee: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  category: z.string().optional(),
  invoiceLineItemId: z.number().nullable(),
  warrantyExpiry: z.string().datetime().nullable(),
  isDeleted: z.boolean().default(false),
  notes: z.string().nullable(),
  price: z.number().optional(),
});

export type Asset = z.infer<typeof assetSchema>;
export const assetCreateSchema = assetSchema.omit({ id: true, rowVersion: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true });
export type AssetCreate = z.infer<typeof assetCreateSchema>;
export type AssetUpdate = Partial<AssetCreate>;

export const ASSET_STATES = ["NEW", "GOOD", "FAIR", "BROKEN", "ARCHIVED"] as const;

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

export const ASSET_LOCATIONS = ["Office", "Server"] as const;

export type AssetCategory = typeof ASSET_CATEGORIES[number];
export type AssetLocation = typeof ASSET_LOCATIONS[number];

export interface AssetFilters {
  page?: number;
  pageSize?: number;
  category?: string;
  state?: AssetStateEnum;
  employeeId?: string;
  employee?: string;
  location?: string;
  search?: string;
}


