export type MaintenanceCategory = "hardware" | "software" | "network" | "preventive";

export type MaintenanceStatus = "pending" | "in-progress" | "completed" | "scheduled" | "cancelled";

export type MaintenancePriority = "critical" | "high" | "medium" | "low";

export interface MaintenanceTimelineEvent {
  id: string;
  type: "status_change" | "comment" | "assignment" | "creation" | "update";
  title: string;
  description?: string;
  timestamp: string;
  user: string; // Name of the user who performed the action
}

export interface MaintenanceComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  isInternal: boolean; // If true, only visible to technicians/admins
}

export interface MaintenanceCost {
  partsCost: number;
  laborCost: number;
  currency: string;
  partsDescription?: string;
  invoiceNumber?: string;
}

export interface MaintenanceRecord {
  id: string;
  assetTag: string;
  assetCategory: string;
  assetMake?: string;
  assetModel?: string;
  
  // Issue Details
  issue: string;
  description: string;
  priority: MaintenancePriority;
  category: MaintenanceCategory;
  
  // Status & Assignment
  status: MaintenanceStatus;
  technician?: string;
  assignedToUser?: string; // ID or Email of the technician
  
  // Tracking
  reportedBy: string;
  reportedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  
  // Enhanced Fields
  timeline: MaintenanceTimelineEvent[];
  comments: MaintenanceComment[];
  cost?: MaintenanceCost;
  
  // Legacy/Simple fields support
  estimatedCost?: number;
  actualCost?: number;
  notes: string[]; // Keep for backward compatibility, but prefer comments
  attachments?: string[];
}

export interface WarrantyInfo {
  assetTag: string;
  assetCategory: string;
  make: string;
  model: string;
  employee: string;
  warrantyExpiry: string;
  daysUntilExpiry: number;
  status: "active" | "expiring-soon" | "expired";
}
