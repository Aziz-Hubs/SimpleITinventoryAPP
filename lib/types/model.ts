/**
 * @file model.ts
 * @description Defines Zod schemas, TypeScript interfaces, and constant values for hardware models.
 * @path /lib/types/model.ts
 */

import { z } from "zod";
import { ASSET_CATEGORIES } from "./asset";

/**
 * Core validation schema for a Model.
 * This flattens the nested "specs" from the JSON for easier form handling.
 */
export const modelSchema = z.object({
  id: z.number().optional(), // ID might not be present in raw JSON but will be assigned
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  make: z.string().min(1, "Make is required"),
  
  // Specs fields (flattened)
  cpu: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  dedicatedgpu: z.string().optional(),
  "usb-aports": z.string().optional(),
  "usb-cports": z.string().optional(),
  dimensions: z.string().optional(),
  resolution: z.string().optional(),
  refreshhertz: z.string().optional(),
});

/** Represents a flattened Model object. */
export type Model = z.infer<typeof modelSchema>;

/** Schema for creating a new model. */
export const modelCreateSchema = modelSchema;

/** Type derived from modelCreateSchema. */
export type ModelCreate = z.infer<typeof modelCreateSchema>;

/** Type for updating existing models. */
export type ModelUpdate = Partial<ModelCreate>;

/** Parameters for filtering models. */
export interface ModelFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  make?: string;
}
