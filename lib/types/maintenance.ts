import { z } from "zod";
import { auditableEntitySchema } from "./common";

export enum MaintenancePriorityEnum {
  Critical = 1,
  High = 2,
  Medium = 3,
  Low = 4,
}

export enum MaintenanceStatusEnum {
  Pending = 1,
  InProgress = 2,
  Completed = 3,
  Scheduled = 4,
  Cancelled = 5,
}

export const maintenanceRecordSchema = auditableEntitySchema.extend({
  id: z.number(),
  assetId: z.number(),
  assetSnapshot: z.record(z.any()), // JSONB
  issue: z.string().max(500),
  priority: z.nativeEnum(MaintenancePriorityEnum),
  status: z.nativeEnum(MaintenanceStatusEnum),
  technicianId: z.string().nullable(),
  reportedDate: z.string().datetime(),
  scheduledDate: z.string().datetime().nullable(),
  completedDate: z.string().datetime().nullable(),
});

export const maintenanceCostSchema = auditableEntitySchema.extend({
  id: z.number(),
  maintenanceRecordId: z.number(),
  estimatedCost: z.number().nullable(),
  actualPartsCost: z.number().nullable(),
  actualLaborCost: z.number().nullable(),
  totalActualCost: z.number().nullable(),
});

export type MaintenanceRecord = z.infer<typeof maintenanceRecordSchema>;
export type MaintenanceRecordCreate = z.infer<typeof maintenanceRecordSchema.omit({ id: true, rowVersion: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true })>;
export type MaintenanceRecordUpdate = Partial<MaintenanceRecordCreate>;

export type MaintenanceCost = z.infer<typeof maintenanceCostSchema>;
export type MaintenanceCostCreate = z.infer<typeof maintenanceCostSchema.omit({ id: true, rowVersion: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true })>;
export type MaintenanceCostUpdate = Partial<MaintenanceCostCreate>;

export interface MaintenanceFilters {
  page?: number;
  pageSize?: number;
  status?: number;
  priority?: number;
  search?: string;
}


