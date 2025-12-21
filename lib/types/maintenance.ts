/**
 * @file maintenance.ts
 * @description Defines TypeScript interfaces, types, and constants for maintenance tracking, warranty info, and filtering.
 * @path /lib/types/maintenance.ts
 */

/** Broad categories for segmenting maintenance tasks. */
export type MaintenanceCategory = "hardware" | "software" | "network" | "preventive";

/** Current lifecycle status of a maintenance ticket. */
export type MaintenanceStatus = "pending" | "in-progress" | "completed" | "scheduled" | "cancelled";

/** Urgency levels for maintenance tasks. */
export type MaintenancePriority = "critical" | "high" | "medium" | "low";

/**
 * Represents a single point-in-time event for a maintenance ticket's history.
 */
export interface MaintenanceTimelineEvent {
  /** Unique identifier for the timeline entry. */
  id: string;
  /** The nature of the event recorded. */
  type: "status_change" | "comment" | "assignment" | "creation" | "update";
  /** Short, descriptive title of the event. */
  title: string;
  /** Detailed description or context for the event. */
  description?: string;
  /** ISO 8601 timestamp of when the event occurred. */
  timestamp: string;
  /** Name or ID of the user who triggered the event. */
  user: string;
}

/**
 * Professional comment associated with a maintenance record.
 */
export interface MaintenanceComment {
  /** Unique ID for the comment. */
  id: string;
  /** Name of the person who made the comment. */
  author: string;
  /** The text content of the comment. */
  content: string;
  /** ISO 8601 timestamp. */
  timestamp: string;
  /** If true, the comment is only visible to IT staff. */
  isInternal: boolean;
}

/**
 * Breakdown of financial costs incurred during a maintenance task.
 */
export interface MaintenanceCost {
  /** Cost of replacement parts or consumables. */
  partsCost: number;
  /** Cost of human labor/hours. */
  laborCost: number;
  /** ISO currency code (e.g., "USD"). */
  currency: string;
  /** Details on what parts were purchased or used. */
  partsDescription?: string;
  /** Associated invoice or receipt number for financial tracking. */
  invoiceNumber?: string;
}

/**
 * Comprehensive record of a maintenance activity performed on an asset.
 */
export interface MaintenanceRecord {
  /** Unique ID for the maintenance record. */
  id: string;
  /** Reference to the asset's service tag or unique identifier. */
  assetTag: string;
  /** Category of the asset being serviced (e.g., "Laptop"). */
  assetCategory: string;
  /** Manufacturer of the asset. */
  assetMake?: string;
  /** Specific model of the asset. */
  assetModel?: string;
  /** Brief summary of the problem or request. */
  issue: string;
  /** Detailed explanation of the maintenance needed or performed. */
  description: string;
  priority: MaintenancePriority;
  category: MaintenanceCategory;
  status: MaintenanceStatus;
  /** Technician assigned to perform the work. */
  technician?: string;
  /** User currently assigned to the ticket (for tracking responsibility). */
  assignedToUser?: string;
  /** Person who initiated the maintenance request. */
  reportedBy: string;
  reportedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  /** Historic log of all changes and actions taken on this record. */
  timeline: MaintenanceTimelineEvent[];
  /** User-provided comments and internal notes. */
  comments: MaintenanceComment[];
  cost?: MaintenanceCost;
  estimatedCost?: number;
  actualCost?: number;
  /** Miscellaneous text notes. */
  notes: string[];
  /** URIs or paths to relevant files (photos, PDFs, etc.). */
  attachments?: string[];
}

/** Type for creating a new maintenance record; omits system-generated ID. */
export type MaintenanceCreate = Omit<MaintenanceRecord, 'id'>;

/** Type for updating an existing maintenance record; all fields except ID are optional. */
export type MaintenanceUpdate = Partial<MaintenanceCreate>;

/**
 * Summary view of asset warranty status for tracking expirations.
 */
export interface WarrantyInfo {
  assetTag: string;
  assetCategory: string;
  make: string;
  model: string;
  employee: string;
  warrantyExpiry: string;
  daysUntilExpiry: number;
  /** Categorized status based on the proximity of the expiry date. */
  status: "active" | "expiring-soon" | "expired";
}

/**
 * Parameters for filtering and paginating maintenance record lists.
 */
export interface MaintenanceFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
}

