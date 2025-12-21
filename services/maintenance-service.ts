/**
 * @file maintenance-service.ts
 * @description Service layer for managing maintenance tickets, including status tracking, 
 * historical timelines, and technician assignments. Utilizes `MockStorage` for state persistence.
 * @path /services/maintenance-service.ts
 */

import { 
  MaintenanceRecord, 
  MaintenanceTimelineEvent, 
  MaintenanceComment, 
  MaintenanceStatus, 
  MaintenanceFilters, 
  PaginatedResponse 
} from "@/lib/types";
import initialMaintenanceData from "@/data/maintenance.json";
import { MockStorage, STORAGE_KEYS } from "@/lib/mock-storage";
import { paginateData } from "@/lib/utils";
import { apiClient, isMockDataEnabled } from "@/lib/api-client";

/** 
 * Static identifier for the current user performing actions.
 * // TODO: (Refactor) Replace with a dynamic user object from the authentication hook/context.
 * @private 
 */
const CURRENT_USER = "Admin User"; 

/**
 * Accesses or initializes the local storage-based maintenance database.
 * Hydrates with `maintenance.json` if storage is empty.
 * 
 * @returns {MaintenanceRecord[]} The current set of maintenance records.
 */
function getMockMaintenance(): MaintenanceRecord[] {
  return MockStorage.initialize(STORAGE_KEYS.MAINTENANCE, initialMaintenanceData as MaintenanceRecord[]);
}

/** 
 * Artificial delay to simulate network latency for a more realistic UI feel. 
 * @private
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retrieves a filtered and paginated list of maintenance records.
 * 
 * @param filters - Search criteria (asset tag, issue, technician) and status filter.
 * @returns {Promise<PaginatedResponse<MaintenanceRecord>>}
 */
export async function getMaintenanceRecords(filters: MaintenanceFilters = {}): Promise<PaginatedResponse<MaintenanceRecord>> {
  if (isMockDataEnabled()) {
    await delay(100);
    const records = getMockMaintenance();

    let filtered = [...records];
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.assetTag.toLowerCase().includes(search) ||
        r.issue.toLowerCase().includes(search) ||
        r.technician?.toLowerCase().includes(search)
      );
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    return paginateData(filtered, filters.page, filters.pageSize);
  }

  return apiClient.get<PaginatedResponse<MaintenanceRecord>>('/maintenance', {
    params: filters as Record<string, string | number | boolean | undefined>
  });
}

/**
 * Fetches a single maintenance record by its ID.
 * 
 * @param id - The MNT-XXX identifier.
 * @returns {Promise<MaintenanceRecord | null>}
 */
export async function getMaintenanceRecordById(id: string): Promise<MaintenanceRecord | null> {
  if (isMockDataEnabled()) {
    await delay(50);
    const records = getMockMaintenance();
    return records.find((record: MaintenanceRecord) => record.id === id) || null;
  }

  return apiClient.get<MaintenanceRecord>(`/maintenance/${id}`);
}

/**
 * Initiates a new maintenance request.
 * Automatically generates a new ID, sets the reported date, and creates an initial "Creation" timeline event.
 * 
 * @param data - The core record details.
 * @returns {Promise<MaintenanceRecord>} The initialized record.
 */
export async function createMaintenanceRequest(
  data: Omit<MaintenanceRecord, "id" | "reportedDate" | "timeline" | "comments"> & { notes?: string[] }
): Promise<MaintenanceRecord> {
  if (isMockDataEnabled()) {
    await delay(500);
    const records = getMockMaintenance();
    
    const newId = `MNT-${String(records.length + 1).padStart(3, "0")}`;
    const now = new Date().toISOString();
    
    const newRecord: MaintenanceRecord = {
      ...data,
      id: newId,
      reportedDate: now.split("T")[0], // YYYY-MM-DD
      notes: data.notes || [],
      comments: [],
      timeline: [
        {
          id: crypto.randomUUID(),
          type: "creation",
          title: "Ticket Created",
          description: `Ticket created by ${data.reportedBy}`,
          timestamp: now,
          user: CURRENT_USER 
        }
      ]
    };

    MockStorage.add(STORAGE_KEYS.MAINTENANCE, newRecord);
    return newRecord;
  }

  return apiClient.post<MaintenanceRecord>('/maintenance', data);
}

/**
 * Updates the lifecycle status of a maintenance ticket.
 * In addition to changing the status, it records a timeline event and optionally appends a legacy note.
 * 
 * @param id - The ticket ID.
 * @param status - The new MaintenanceStatus.
 * @param note - Optional text note for historical tracking.
 * @returns {Promise<MaintenanceRecord | null>} The updated record or null if not found.
 */
export async function updateMaintenanceStatus(
  id: string,
  status: MaintenanceStatus,
  note?: string
): Promise<MaintenanceRecord | null> {
  if (isMockDataEnabled()) {
    await delay(300);
    const records = getMockMaintenance();
    const index = records.findIndex((r: MaintenanceRecord) => r.id === id);
    
    if (index === -1) return null;
    
    const record = { ...records[index] };
    const oldStatus = record.status;
    const now = new Date().toISOString();

    record.status = status;
    
    if (note) {
      record.notes = [...record.notes, `${now.split("T")[0]}: ${note}`];
    }

    if (status === "completed" && !record.completedDate) {
      record.completedDate = now.split("T")[0];
    }

    const newEvent: MaintenanceTimelineEvent = {
      id: crypto.randomUUID(),
      type: "status_change",
      title: "Status Updated",
      description: `Status changed from ${oldStatus} to ${status}`,
      timestamp: now,
      user: CURRENT_USER
    };
    record.timeline = [newEvent, ...record.timeline];

    return MockStorage.update<MaintenanceRecord>(STORAGE_KEYS.MAINTENANCE, id, record);
  }

  return apiClient.patch<MaintenanceRecord>(`/maintenance/${id}/status`, { status, note });
}

/**
 * Adds a user comment to a maintenance record.
 * 
 * @param id - The ticket ID.
 * @param content - The comment text.
 * @param isInternal - If true, flags as visible only to staff.
 * @returns {Promise<MaintenanceComment | null>} The created comment or null if the record was not found.
 */
export async function addMaintenanceComment(
  id: string,
  content: string,
  isInternal: boolean = false
): Promise<MaintenanceComment | null> {
  if (isMockDataEnabled()) {
    await delay(200);
    const records = getMockMaintenance();
    const index = records.findIndex((r: MaintenanceRecord) => r.id === id);
    
    if (index === -1) return null;
    
    const record = { ...records[index] };
    const now = new Date().toISOString();
    const newComment: MaintenanceComment = {
      id: crypto.randomUUID(),
      content,
      author: CURRENT_USER,
      timestamp: now,
      isInternal
    };

    record.comments = [newComment, ...record.comments];
    
    const newTimelineEvent: MaintenanceTimelineEvent = {
      id: crypto.randomUUID(),
      type: "comment",
      title: "Comment Added",
      description: isInternal ? "Internal note added" : "Public comment added",
      timestamp: now,
      user: CURRENT_USER
    };
    record.timeline = [newTimelineEvent, ...record.timeline];

    MockStorage.update<MaintenanceRecord>(STORAGE_KEYS.MAINTENANCE, id, record);
    return newComment;
  }

  return apiClient.post<MaintenanceComment>(`/maintenance/${id}/comments`, { content, isInternal });
}

/**
 * Updates generic fields on a maintenance record.
 * Automatically injects an "assignment" timeline event if the technician field is changed.
 * 
 * @param id - The target ticket ID.
 * @param updates - Partial record containing fields to update.
 * @returns {Promise<MaintenanceRecord | null>}
 */
export async function updateMaintenanceRecord(
  id: string,
  updates: Partial<MaintenanceRecord>
): Promise<MaintenanceRecord | null> {
  if (isMockDataEnabled()) {
    await delay(300);
    const records = getMockMaintenance();
    const index = records.findIndex((r: MaintenanceRecord) => r.id === id);
    if (index === -1) return null;

    const record = { ...records[index] };
    const updatedRecord = { ...record, ...updates };
    
    if (updates.technician && updates.technician !== record.technician) {
      const newEvent: MaintenanceTimelineEvent = {
        id: crypto.randomUUID(),
        type: "assignment",
        title: "Technician Assigned",
        description: `Assigned to ${updates.technician}`,
        timestamp: new Date().toISOString(),
        user: CURRENT_USER
      };
      updatedRecord.timeline = [newEvent, ...updatedRecord.timeline];
    }

    return MockStorage.update<MaintenanceRecord>(STORAGE_KEYS.MAINTENANCE, id, updatedRecord);
  }

  return apiClient.put<MaintenanceRecord>(`/maintenance/${id}`, updates);
}

/**
 * Retrieves the full maintenance history for a specific asset hardware identifier.
 * 
 * @param assetTag - The asset's unique hardware tag.
 * @returns {Promise<MaintenanceRecord[]>}
 */
export async function getAssetMaintenanceHistory(assetTag: string): Promise<MaintenanceRecord[]> {
  const response = await getMaintenanceRecords();
  return response.data.filter((record: MaintenanceRecord) => record.assetTag === assetTag);
}

/**
 * Transforms an array of maintenance records into a CSV-formatted string.
 * 
 * @param records - List of records to export.
 * @returns {Promise<string>} The generated CSV content.
 */
export async function exportMaintenanceReport(
  records: MaintenanceRecord[]
): Promise<string> {
  const headers = [
    "ID",
    "Asset Tag",
    "Category",
    "Issue",
    "Status",
    "Priority",
    "Technician",
    "Reported By",
    "Reported Date",
    "Completed Date",
    "Actual Cost",
  ];

  const rows = records.map((record) => [
    record.id,
    record.assetTag,
    record.category,
    record.issue,
    record.status,
    record.priority,
    record.technician || "Unassigned",
    record.reportedBy,
    record.reportedDate,
    record.completedDate || "N/A",
    record.actualCost?.toString() || "N/A",
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  return csv;
}
