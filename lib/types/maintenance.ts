import { z } from "zod";
import { auditableEntitySchema } from "./common";

export enum MaintenancePriorityEnum {
  Critical = "critical",
  High = "high",
  Medium = "medium",
  Low = "low",
}

export enum MaintenanceStatusEnum {
  Pending = "pending",
  InProgress = "in-progress",
  Completed = "completed",
  Scheduled = "scheduled",
  Cancelled = "cancelled",
}

export type MaintenanceCategory = "hardware" | "software" | "network" | "preventive";

export const maintenanceTimelineEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string(),
  timestamp: z.string(),
  user: z.string(),
});
export type MaintenanceTimelineEvent = z.infer<typeof maintenanceTimelineEventSchema>;

export const maintenanceCommentSchema = z.object({
  id: z.string(),
  content: z.string(),
  author: z.string(),
  timestamp: z.string(),
  isInternal: z.boolean().default(false),
});
export type MaintenanceComment = z.infer<typeof maintenanceCommentSchema>;

export const maintenanceRecordSchema = auditableEntitySchema.extend({
  id: z.string(),
  assetTag: z.string(),
  assetCategory: z.string(),
  assetMake: z.string(),
  assetModel: z.string(),
  issue: z.string().max(500),
  description: z.string().optional(),
  category: z.enum(["hardware", "software", "network", "preventive"]),
  priority: z.nativeEnum(MaintenancePriorityEnum),
  status: z.nativeEnum(MaintenanceStatusEnum),
  technician: z.string().optional(),
  reportedBy: z.string(),
  reportedDate: z.string().datetime().or(z.string()), // Allow plain date string if needed, or strict ISO
  completedDate: z.string().nullable().optional(),
  notes: z.array(z.string()).optional(),
  timeline: z.array(maintenanceTimelineEventSchema).optional(),
  comments: z.array(maintenanceCommentSchema).optional(),
  actualCost: z.number().nullable().optional(),
  estimatedCost: z.number().nullable().optional(),
  scheduledDate: z.string().optional(),
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
export const maintenanceRecordCreateSchema = maintenanceRecordSchema.omit({ id: true, rowVersion: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true });
export type MaintenanceRecordCreate = z.infer<typeof maintenanceRecordCreateSchema>;
export type MaintenanceRecordUpdate = Partial<MaintenanceRecordCreate>;

export type MaintenanceCost = z.infer<typeof maintenanceCostSchema>;
export const maintenanceCostCreateSchema = maintenanceCostSchema.omit({ id: true, rowVersion: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true });
export type MaintenanceCostCreate = z.infer<typeof maintenanceCostCreateSchema>;
export type MaintenanceCostUpdate = Partial<MaintenanceCostCreate>;

export type MaintenanceCreate = MaintenanceRecordCreate;
export type MaintenanceUpdate = MaintenanceRecordUpdate;
export type MaintenanceStatus = MaintenanceStatusEnum;
export type MaintenancePriority = MaintenancePriorityEnum;

export interface MaintenanceFilters {
  page?: number;
  pageSize?: number;
  status?: MaintenanceStatusEnum;
  priority?: MaintenancePriorityEnum;
  search?: string;
}


