import type { MaintenanceRecord, WarrantyInfo } from "@/lib/maintenance-types";

// Mock data for development - replace with actual API calls
const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: "MNT-001",
    assetTag: "F3XVC24",
    assetCategory: "Laptop",
    assetMake: "Dell",
    assetModel: "Vostro 3520",
    issue: "Screen flickering",
    description: "Display shows intermittent flickering, especially when on battery power",
    category: "hardware",
    status: "in-progress",
    priority: "high",
    technician: "Alex Doe",
    reportedBy: "Abdullah, Laila",
    reportedDate: "2024-12-15",
    scheduledDate: "2024-12-16",
    estimatedCost: 150,
    notes: ["Initial diagnosis: possible GPU issue", "Ordered replacement screen"],
  },
  {
    id: "MNT-002",
    assetTag: "CFNVC24",
    assetCategory: "Laptop",
    assetMake: "Dell",
    assetModel: "Vostro 3520",
    issue: "Keyboard replacement",
    description: "Several keys not responding properly",
    category: "hardware",
    status: "completed",
    priority: "medium",
    technician: "Jane Smith",
    reportedBy: "Abu Al Rous, Mohammed",
    reportedDate: "2024-12-10",
    scheduledDate: "2024-12-12",
    completedDate: "2024-12-12",
    estimatedCost: 80,
    actualCost: 75,
    notes: ["Keyboard replaced successfully", "Tested all keys - working properly"],
  },
  {
    id: "MNT-003",
    assetTag: "JHV69T3",
    assetCategory: "Laptop",
    assetMake: "Dell",
    assetModel: "Vostro 3510",
    issue: "OS Update failure",
    description: "Windows update keeps failing with error code 0x80070002",
    category: "software",
    status: "pending",
    priority: "low",
    reportedBy: "Abu Ghalyoun, Hasan",
    reportedDate: "2024-12-14",
    notes: ["Awaiting technician assignment"],
  },
];

export async function getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockMaintenanceRecords), 100);
  });
}

export async function getMaintenanceRecordById(id: string): Promise<MaintenanceRecord | null> {
  const records = await getMaintenanceRecords();
  return records.find((record) => record.id === id) || null;
}

export async function createMaintenanceRequest(
  data: Omit<MaintenanceRecord, "id" | "reportedDate" | "notes">
): Promise<MaintenanceRecord> {
  const newRecord: MaintenanceRecord = {
    ...data,
    id: `MNT-${String(mockMaintenanceRecords.length + 1).padStart(3, "0")}`,
    reportedDate: new Date().toISOString().split("T")[0],
    notes: [],
  };
  
  mockMaintenanceRecords.push(newRecord);
  return newRecord;
}

export async function updateMaintenanceStatus(
  id: string,
  status: MaintenanceRecord["status"],
  note?: string
): Promise<MaintenanceRecord | null> {
  const record = await getMaintenanceRecordById(id);
  if (!record) return null;

  record.status = status;
  if (note) {
    record.notes.push(`${new Date().toISOString().split("T")[0]}: ${note}`);
  }
  if (status === "completed" && !record.completedDate) {
    record.completedDate = new Date().toISOString().split("T")[0];
  }

  return record;
}

export async function getAssetMaintenanceHistory(assetTag: string): Promise<MaintenanceRecord[]> {
  const records = await getMaintenanceRecords();
  return records.filter((record) => record.assetTag === assetTag);
}

export async function getWarrantyExpirations(): Promise<WarrantyInfo[]> {
  // This would typically fetch from the inventory data
  // For now, return mock data
  return [];
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
