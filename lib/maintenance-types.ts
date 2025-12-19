export type MaintenanceCategory = "hardware" | "software" | "network" | "preventive";

export type MaintenanceStatus = "pending" | "in-progress" | "completed" | "scheduled" | "cancelled";

export type MaintenancePriority = "critical" | "high" | "medium" | "low";

export interface MaintenanceRecord {
  id: string;
  assetTag: string;
  assetCategory: string;
  assetMake?: string;
  assetModel?: string;
  issue: string;
  description: string;
  category: MaintenanceCategory;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  technician?: string;
  reportedBy: string;
  reportedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  notes: string[];
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
