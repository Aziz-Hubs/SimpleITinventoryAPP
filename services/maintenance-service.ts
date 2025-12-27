/**
 * @file maintenance-service.ts
 * @description Service layer for managing maintenance tickets using Supabase.
 * @path /services/maintenance-service.ts
 */

import { supabase } from "@/lib/supabase";
import {
  MaintenanceRecord,
  MaintenanceTimelineEvent,
  MaintenanceComment,
  MaintenanceStatus,
  MaintenanceFilters,
  PaginatedResponse,
  MaintenanceCreate,
  MaintenanceUpdate
} from "@/lib/types";
import { paginateData } from "@/lib/utils";

// Helper to map DB row to MaintenanceRecord
function mapMaintenanceFromDB(row: any): MaintenanceRecord {
  return {
    id: row.id,
    assetTag: row.asset_tag,
    assetCategory: row.asset_category,
    assetMake: row.asset_make,
    assetModel: row.asset_model,
    issue: row.issue,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    technician: row.technician,
    reportedBy: row.reported_by,
    reportedDate: row.reported_date,
    completedDate: row.completed_date,
    actualCost: row.actual_cost,
    estimatedCost: row.estimated_cost,
    scheduledDate: row.scheduled_date,
    notes: [], // Legacy notes field logic might need adjustment if storing in generic array
    timeline: (row.maintenance_timeline_events || []).map(mapTimelineFromDB),
    comments: (row.maintenance_comments || []).map(mapCommentFromDB),
    tenantId: row.tenant_id,
    createdAt: row.created_at,
    createdBy: row.created_by,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
    rowVersion: row.row_version,
  };
}

function mapTimelineFromDB(row: any): MaintenanceTimelineEvent {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    timestamp: row.timestamp,
    user: row.user,
  };
}

function mapCommentFromDB(row: any): MaintenanceComment {
  return {
    id: row.id,
    content: row.content,
    author: row.author,
    timestamp: row.timestamp,
    isInternal: row.is_internal,
  };
}

function mapMaintenanceToDB(data: MaintenanceCreate | MaintenanceUpdate) {
  const dbRow: any = {
    asset_tag: (data as any).assetTag,
    asset_category: (data as any).assetCategory,
    asset_make: (data as any).assetMake,
    asset_model: (data as any).assetModel,
    issue: (data as any).issue,
    description: (data as any).description,
    category: (data as any).category,
    priority: (data as any).priority,
    status: (data as any).status,
    technician: (data as any).technician,
    reported_by: (data as any).reportedBy,
    reported_date: (data as any).reportedDate,
    completed_date: (data as any).completedDate,
    actual_cost: (data as any).actualCost,
    estimated_cost: (data as any).estimatedCost,
    scheduled_date: (data as any).scheduledDate,
  };
  
  Object.keys(dbRow).forEach(key => dbRow[key] === undefined && delete dbRow[key]);
  return dbRow;
}

/** 
 * Static identifier for the current user performing actions.
 * TODO: Replace with auth context user
 */
const CURRENT_USER = "Admin User"; 

/**
 * Retrieves a filtered and paginated list of maintenance records.
 * 
 * @param filters - Search criteria and status filter.
 * @returns {Promise<PaginatedResponse<MaintenanceRecord>>}
 */
export async function getMaintenanceRecords(filters: MaintenanceFilters = {}): Promise<PaginatedResponse<MaintenanceRecord>> {
  let query = supabase
    .from('maintenance_records')
    .select(`
      *,
      maintenance_timeline_events ( * ),
      maintenance_comments ( * )
    `, { count: 'exact' });

  if (filters.search) {
    const term = filters.search;
    query = query.or(`asset_tag.ilike.%${term}%,issue.ilike.%${term}%,technician.ilike.%${term}%`);
  }

  if (filters.status && (filters.status as string) !== 'all') {
    query = query.eq('status', filters.status);
  }

  const page = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  query = query
    .order('created_at', { ascending: false })
    .range(start, end);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const records = (data || []).map(mapMaintenanceFromDB);

  return {
    data: records,
    pagination: {
      page,
      pageSize,
      totalItems: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  };
}

/**
 * Fetches a single maintenance record by its ID.
 * 
 * @param id - The MNT-XXX identifier.
 * @returns {Promise<MaintenanceRecord | null>}
 */
export async function getMaintenanceRecordById(id: string): Promise<MaintenanceRecord | null> {
  const { data, error } = await supabase
    .from('maintenance_records')
    .select(`
      *,
      maintenance_timeline_events ( * ),
      maintenance_comments ( * )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }

  // Sort timeline and comments (Supabase join order is not guaranteed)
  if (data.maintenance_timeline_events) {
    data.maintenance_timeline_events.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  
  if (data.maintenance_comments) {
    data.maintenance_comments.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  return mapMaintenanceFromDB(data);
}

/**
 * Initiates a new maintenance request.
 * 
 * @param data - The core record details.
 * @returns {Promise<MaintenanceRecord>} The initialized record.
 */
export async function createMaintenanceRequest(
  data: MaintenanceCreate
): Promise<MaintenanceRecord> {
  // Generate ID: MNT-XXX
  // We need to count existing to mimic the ID format
  const { count } = await supabase.from('maintenance_records').select('id', { count: 'exact', head: true });
  const newId = `MNT-${String((count || 0) + 1).padStart(3, "0")}`;
  const now = new Date().toISOString();

  const dbRow = mapMaintenanceToDB(data);
  dbRow.id = newId;
  dbRow.reported_date = now.split("T")[0];
  dbRow.tenant_id = '00000000-0000-0000-0000-000000000000';
  dbRow.created_by = CURRENT_USER;
  dbRow.updated_by = CURRENT_USER;

  // Insert Record
  const { data: record, error: recordError } = await supabase
    .from('maintenance_records')
    .insert(dbRow)
    .select()
    .single();

  if (recordError) throw new Error(recordError.message);

  // Insert Initial Timeline Event
  await supabase.from('maintenance_timeline_events').insert({
    maintenance_record_id: newId,
    type: "creation",
    title: "Ticket Created",
    description: `Ticket created by ${data.reportedBy}`,
    timestamp: now,
    user: CURRENT_USER
  });

  return getMaintenanceRecordById(newId) as Promise<MaintenanceRecord>;
}

/**
 * Updates the lifecycle status of a maintenance ticket.
 * 
 * @param id - The ticket ID.
 * @param status - The new MaintenanceStatus.
 * @param note - Optional text note for historical tracking.
 * @returns {Promise<MaintenanceRecord | null>} The updated record.
 */
export async function updateMaintenanceStatus(
  id: string,
  status: MaintenanceStatus,
  note?: string
): Promise<MaintenanceRecord | null> {
  const current = await getMaintenanceRecordById(id);
  if (!current) return null;

  const now = new Date().toISOString();
  const updates: any = { status, updated_at: now, updated_by: CURRENT_USER };

  if (status === "completed" && !current.completedDate) {
    updates.completed_date = now.split("T")[0];
  }

  // Update Record
  const { error } = await supabase
    .from('maintenance_records')
    .update(updates)
    .eq('id', id);

  if (error) throw new Error(error.message);

  // Add Timeline Event
  await supabase.from('maintenance_timeline_events').insert({
    maintenance_record_id: id,
    type: "status_change",
    title: "Status Updated",
    description: `Status changed from ${current.status} to ${status}${note ? '. ' + note : ''}`,
    timestamp: now,
    user: CURRENT_USER
  });

  return getMaintenanceRecordById(id);
}

/**
 * Adds a user comment to a maintenance record.
 * 
 * @param id - The ticket ID.
 * @param content - The comment text.
 * @param isInternal - If true, flags as visible only to staff.
 * @returns {Promise<MaintenanceComment | null>} The created comment.
 */
export async function addMaintenanceComment(
  id: string,
  content: string,
  isInternal: boolean = false
): Promise<MaintenanceComment | null> {
  const now = new Date().toISOString();

  // Insert Comment
  const { data: comment, error } = await supabase
    .from('maintenance_comments')
    .insert({
      maintenance_record_id: id,
      content,
      author: CURRENT_USER,
      timestamp: now,
      is_internal: isInternal
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Add Timeline Event
  await supabase.from('maintenance_timeline_events').insert({
    maintenance_record_id: id,
    type: "comment",
    title: "Comment Added",
    description: isInternal ? "Internal note added" : "Public comment added",
    timestamp: now,
    user: CURRENT_USER
  });

  return mapCommentFromDB(comment);
}

/**
 * Updates generic fields on a maintenance record.
 * 
 * @param id - The target ticket ID.
 * @param updates - Partial record containing fields to update.
 * @returns {Promise<MaintenanceRecord | null>}
 */
export async function updateMaintenanceRecord(
  id: string,
  updates: MaintenanceUpdate
): Promise<MaintenanceRecord | null> {
  const current = await getMaintenanceRecordById(id);
  if (!current) return null;

  const dbRow = mapMaintenanceToDB(updates);
  dbRow.updated_at = new Date().toISOString();
  dbRow.updated_by = CURRENT_USER;

  const { error } = await supabase
    .from('maintenance_records')
    .update(dbRow)
    .eq('id', id);

  if (error) throw new Error(error.message);

  // Check for assignment change
  if (updates.technician && updates.technician !== current.technician) {
    await supabase.from('maintenance_timeline_events').insert({
      maintenance_record_id: id,
      type: "assignment",
      title: "Technician Assigned",
      description: `Assigned to ${updates.technician}`,
      timestamp: new Date().toISOString(),
      user: CURRENT_USER
    });
  }

  return getMaintenanceRecordById(id);
}

/**
 * Retrieves the full maintenance history for a specific asset hardware identifier.
 * 
 * @param assetTag - The asset's unique hardware tag.
 * @returns {Promise<MaintenanceRecord[]>}
 */
export async function getAssetMaintenanceHistory(assetTag: string): Promise<MaintenanceRecord[]> {
  const { data, error } = await supabase
    .from('maintenance_records')
    .select('*')
    .eq('asset_tag', assetTag)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map(mapMaintenanceFromDB);
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
    "ID", "Asset Tag", "Category", "Issue", "Status",
    "Priority", "Technician", "Reported By",
    "Reported Date", "Completed Date", "Actual Cost",
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
