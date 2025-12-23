/**
 * @file asset.ts
 * @description Defines Zod schemas, TypeScript interfaces, and constant values for asset management.
 * @path /lib/types/asset.ts
 */

import { z } from "zod";
import { auditableEntitySchema } from "./common";

export enum AssetStateEnum {
  New = 1,
  Good = 2,
  Fair = 3,
  Broken = 4,
}

export const assetSchema = auditableEntitySchema.extend({
  id: z.number(),
  serviceTag: z.string().min(1, "Service Tag is required"),
  modelId: z.number(),
  state: z.nativeEnum(AssetStateEnum),
  employeeId: z.string().uuid().nullable(),
  location: z.string().min(1, "Location is required"),
  invoiceLineItemId: z.number().nullable(),
  warrantyExpiry: z.string().datetime().nullable(),
  isDeleted: z.boolean().default(false),
  additionalcomments: z.string().nullable(),
});

export type Asset = z.infer<typeof assetSchema>;
export type AssetCreate = z.infer<typeof assetSchema.omit({ id: true, rowVersion: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true })>;
export type AssetUpdate = Partial<AssetCreate>;

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
  state?: number;
  employeeId?: string;
  location?: string;
  search?: string;
}


