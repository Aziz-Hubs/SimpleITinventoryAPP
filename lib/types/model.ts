import { z } from "zod";
import { auditableEntitySchema } from "./common";

export const modelSchema = auditableEntitySchema.extend({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
  make: z.string().min(1, "Make is required"),
  category: z.string().min(1, "Category is required"),
  specs: z.record(z.string(), z.any()), // JSONB represented as a generic object
});

export type Model = z.infer<typeof modelSchema>;
export const modelCreateSchema = modelSchema.omit({ id: true, rowVersion: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, tenantId: true });
export type ModelCreate = z.infer<typeof modelCreateSchema>;
export type ModelUpdate = Partial<ModelCreate>;

export interface ModelFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  make?: string;
}
