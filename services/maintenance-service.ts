import type { 
  MaintenanceRecord, 
  MaintenanceTimelineEvent, 
  MaintenanceComment, 
  MaintenanceStatus 
} from "@/lib/maintenance-types";
import initialMaintenanceData from "@/data/maintenance.json";

// Key for storage
const STORAGE_KEY = "it_inventory_maintenance_data";

// Helper to get simulated user (in a real app, this would come from auth context)
const CURRENT_USER = "Admin User"; 

/**
 * Initialize data from local storage or seed with JSON file
 */
function getStoredData(): MaintenanceRecord[] {
  if (typeof window === "undefined") return initialMaintenanceData as MaintenanceRecord[];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    // Seed and save
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMaintenanceData));
    return initialMaintenanceData as MaintenanceRecord[];
  }
  
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse maintenance data", e);
    return initialMaintenanceData as MaintenanceRecord[];
  }
}

/**
 * Save data to local storage
 */
function saveData(data: MaintenanceRecord[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

// SIMULATED DELAY FOR REALISM
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
  await delay(100);
  return getStoredData();
}

export async function getMaintenanceRecordById(id: string): Promise<MaintenanceRecord | null> {
  await delay(50);
  const records = getStoredData();
  return records.find((record) => record.id === id) || null;
}

export async function createMaintenanceRequest(
  data: Omit<MaintenanceRecord, "id" | "reportedDate" | "notes" | "timeline" | "comments">
): Promise<MaintenanceRecord> {
  await delay(500);
  const records = getStoredData();
  
  const newId = `MNT-${String(records.length + 1).padStart(3, "0")}`;
  const now = new Date().toISOString();
  
  const newRecord: MaintenanceRecord = {
    ...data,
    id: newId,
    reportedDate: now.split("T")[0], // YYYY-MM-DD
    notes: [],
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

  records.push(newRecord);
  saveData(records);
  return newRecord;
}

export async function updateMaintenanceStatus(
  id: string,
  status: MaintenanceStatus,
  note?: string
): Promise<MaintenanceRecord | null> {
  await delay(300);
  const records = getStoredData();
  const index = records.findIndex(r => r.id === id);
  
  if (index === -1) return null;
  
  const record = records[index];
  const oldStatus = record.status;
  const now = new Date().toISOString();

  // Update Status
  record.status = status;
  
  // Add Note if exists (Legacy support)
  if (note) {
    record.notes.push(`${now.split("T")[0]}: ${note}`);
  }

  // Update Completed Date
  if (status === "completed" && !record.completedDate) {
    record.completedDate = now.split("T")[0];
  }

  // Add Timeline Event
  record.timeline.unshift({
    id: crypto.randomUUID(),
    type: "status_change",
    title: "Status Updated",
    description: `Status changed from ${oldStatus} to ${status}`,
    timestamp: now,
    user: CURRENT_USER
  });

  // Save
  records[index] = record;
  saveData(records);
  
  return record;
}

export async function addMaintenanceComment(
  id: string,
  content: string,
  isInternal: boolean = false
): Promise<MaintenanceComment | null> {
  await delay(200);
  const records = getStoredData();
  const index = records.findIndex(r => r.id === id);
  
  if (index === -1) return null;
  
  const now = new Date().toISOString();
  const newComment: MaintenanceComment = {
    id: crypto.randomUUID(),
    content,
    author: CURRENT_USER,
    timestamp: now,
    isInternal
  };

  records[index].comments.unshift(newComment);
  
  // Add Timeline Event for internal visibility primarily
  records[index].timeline.unshift({
    id: crypto.randomUUID(),
    type: "comment",
    title: "Comment Added",
    description: isInternal ? "Internal note added" : "Public comment added",
    timestamp: now,
    user: CURRENT_USER
  });

  saveData(records);
  return newComment;
}

export async function updateMaintenanceRecord(
  id: string,
  updates: Partial<MaintenanceRecord>
): Promise<MaintenanceRecord | null> {
  await delay(300);
  const records = getStoredData();
  const index = records.findIndex(r => r.id === id);
  if (index === -1) return null;

  const record = records[index];
  
  // Merge updates
  const updatedRecord = { ...record, ...updates };
  
  // Detect significant changes for timeline (simple version)
  if (updates.technician && updates.technician !== record.technician) {
    updatedRecord.timeline.unshift({
      id: crypto.randomUUID(),
      type: "assignment",
      title: "Technician Assigned",
      description: `Assigned to ${updates.technician}`,
      timestamp: new Date().toISOString(),
      user: CURRENT_USER
    });
  }

  records[index] = updatedRecord;
  saveData(records);
  return updatedRecord;
}

export async function getAssetMaintenanceHistory(assetTag: string): Promise<MaintenanceRecord[]> {
  const records = await getMaintenanceRecords();
  return records.filter((record) => record.assetTag === assetTag);
}

export async function exportMaintenanceReport(
  records: MaintenanceRecord[]
): Promise<string> {
  // Generate CSV content
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
