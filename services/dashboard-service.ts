/**
 * @file dashboard-service.ts
 * @description Service layer for aggregating dashboard-level data, including KPI statistics, 
 * time-series chart data, and recent activity logs. Supports both mock data and real API integration.
 * @path /services/dashboard-service.ts
 */

import { Asset, DashboardStats, ChartDataPoint, Activity, ApiResponse, PaginatedResponse, AssetStateEnum } from "@/lib/types";
import { apiClient, isMockDataEnabled } from "@/lib/api-client";
import inventoryData from "@/data/inv.json";

/**
 * Interface representing the raw structure of individual items in the `inv.json` file.
 * Used for safe type assertion during the initial mock data conversion process.
 * @private
 */
interface InventoryItem {
  category?: string;
  state?: string;
  warrantyexpiry?: string;
  make?: string;
  model?: string;
  cpu?: string;
  ram?: string;
  storage?: string;
  dedicatedgpu?: string;
  'usb-aports'?: string;
  'usb-cports'?: string;
  servicetag?: string;
  employee?: string;
  additionalcomments?: string;
  location?: string;
  dimensions?: string;
  resolution?: string;
  refreshhertz?: string;
}

/** 
 * Transforms raw inventory JSON into the normalized camelCase format.
 */
export const MOCK_ASSETS: Asset[] = (inventoryData as InventoryItem[]).map((item, index) => ({
  id: index + 1,
  tenantId: '00000000-0000-0000-0000-000000000000',
  createdAt: new Date().toISOString(),
  createdBy: 'Initial Import',
  updatedAt: new Date().toISOString(),
  updatedBy: 'Initial Import',
  rowVersion: '1',
  serviceTag: item.servicetag || `TAG-${index}`,
  modelId: 1,
  make: item.make || '',
  model: item.model || '',
  category: item.category || '',
  state: (item.state?.toUpperCase() as AssetStateEnum) || AssetStateEnum.Good,
  employee: item.employee || 'UNASSIGNED',
  employeeId: null,
  location: item.location || 'Office',
  warrantyExpiry: (item.warrantyexpiry && !isNaN(new Date(item.warrantyexpiry).getTime())) ? new Date(item.warrantyexpiry).toISOString() : null,
  isDeleted: false,
  notes: item.additionalcomments || null,
  invoiceLineItemId: null,
} as Asset));


/** Sample time-series data for rendering the inventory growth chart. */
const MOCK_CHART_DATA: ChartDataPoint[] = [
  { date: "2024-04-01", laptop: 120, monitor: 80, peripheral: 45 },
  { date: "2024-04-02", laptop: 97, monitor: 60, peripheral: 30 },
  { date: "2024-04-03", laptop: 167, monitor: 120, peripheral: 55 },
  { date: "2024-04-04", laptop: 242, monitor: 160, peripheral: 85 },
  { date: "2024-04-05", laptop: 373, monitor: 190, peripheral: 110 },
  { date: "2024-04-06", laptop: 301, monitor: 240, peripheral: 95 },
  { date: "2024-04-07", laptop: 245, monitor: 180, peripheral: 70 },
  { date: "2024-04-08", laptop: 409, monitor: 220, peripheral: 130 },
  { date: "2024-04-09", laptop: 159, monitor: 110, peripheral: 60 },
  { date: "2024-04-10", laptop: 261, monitor: 190, peripheral: 105 },
  { date: "2024-04-11", laptop: 327, monitor: 250, peripheral: 140 },
  { date: "2024-04-12", laptop: 292, monitor: 210, peripheral: 120 },
  { date: "2024-04-13", laptop: 342, monitor: 280, peripheral: 155 },
  { date: "2024-04-14", laptop: 237, monitor: 120, peripheral: 90 },
  { date: "2024-04-15", laptop: 220, monitor: 170, peripheral: 80 },
  { date: "2024-04-16", laptop: 238, monitor: 190, peripheral: 110 },
  { date: "2024-04-17", laptop: 446, monitor: 260, peripheral: 180 },
  { date: "2024-04-18", laptop: 364, monitor: 310, peripheral: 150 },
  { date: "2024-04-19", laptop: 343, monitor: 180, peripheral: 140 },
  { date: "2024-04-20", laptop: 189, monitor: 150, peripheral: 85 },
  { date: "2024-04-21", laptop: 237, monitor: 200, peripheral: 115 },
  { date: "2024-04-22", laptop: 324, monitor: 170, peripheral: 130 },
  { date: "2024-04-23", laptop: 238, monitor: 230, peripheral: 110 },
  { date: "2024-04-24", laptop: 387, monitor: 290, peripheral: 165 },
  { date: "2024-04-25", laptop: 315, monitor: 250, peripheral: 140 },
  { date: "2024-04-26", laptop: 175, monitor: 130, peripheral: 80 },
  { date: "2024-04-27", laptop: 383, monitor: 320, peripheral: 185 },
  { date: "2024-04-28", laptop: 222, monitor: 180, peripheral: 110 },
  { date: "2024-04-29", laptop: 315, monitor: 240, peripheral: 145 },
  { date: "2024-04-30", laptop: 454, monitor: 280, peripheral: 210 },
  { date: "2024-05-01", laptop: 265, monitor: 220, peripheral: 130 },
  { date: "2024-05-02", laptop: 293, monitor: 310, peripheral: 160 },
  { date: "2024-05-03", laptop: 247, monitor: 190, peripheral: 120 },
  { date: "2024-05-04", laptop: 385, monitor: 320, peripheral: 190 },
  { date: "2024-05-05", laptop: 481, monitor: 390, peripheral: 230 },
  { date: "2024-05-06", laptop: 498, monitor: 420, peripheral: 250 },
  { date: "2024-05-07", laptop: 388, monitor: 300, peripheral: 180 },
  { date: "2024-05-08", laptop: 249, monitor: 210, peripheral: 110 },
  { date: "2024-05-09", laptop: 327, monitor: 180, peripheral: 140 },
  { date: "2024-05-10", laptop: 393, monitor: 330, peripheral: 190 },
  { date: "2024-05-11", laptop: 435, monitor: 270, peripheral: 210 },
  { date: "2024-05-12", laptop: 297, monitor: 240, peripheral: 150 },
  { date: "2024-05-13", laptop: 297, monitor: 160, peripheral: 140 },
  { date: "2024-05-14", laptop: 448, monitor: 390, peripheral: 220 },
  { date: "2024-05-15", laptop: 473, monitor: 380, peripheral: 240 },
  { date: "2024-05-16", laptop: 338, monitor: 400, peripheral: 170 },
  { date: "2024-05-17", laptop: 499, monitor: 420, peripheral: 260 },
  { date: "2024-05-18", laptop: 415, monitor: 350, peripheral: 210 },
  { date: "2024-05-19", laptop: 335, monitor: 180, peripheral: 160 },
  { date: "2024-05-20", laptop: 277, monitor: 230, peripheral: 140 },
  { date: "2024-05-21", laptop: 182, monitor: 140, peripheral: 90 },
  { date: "2024-05-22", laptop: 181, monitor: 120, peripheral: 85 },
  { date: "2024-05-23", laptop: 252, monitor: 290, peripheral: 130 },
  { date: "2024-05-24", laptop: 394, monitor: 220, peripheral: 180 },
  { date: "2024-05-25", laptop: 301, monitor: 250, peripheral: 150 },
  { date: "2024-05-26", laptop: 313, monitor: 170, peripheral: 160 },
  { date: "2024-05-27", laptop: 420, monitor: 360, peripheral: 210 },
  { date: "2024-05-28", laptop: 333, monitor: 190, peripheral: 170 },
  { date: "2024-05-29", laptop: 178, monitor: 130, peripheral: 80 },
  { date: "2024-05-30", laptop: 340, monitor: 280, peripheral: 170 },
  { date: "2024-05-31", laptop: 278, monitor: 230, peripheral: 140 },
  { date: "2024-06-01", laptop: 278, monitor: 200, peripheral: 150 },
  { date: "2024-06-02", laptop: 470, monitor: 410, peripheral: 240 },
  { date: "2024-06-03", laptop: 203, monitor: 160, peripheral: 110 },
  { date: "2024-06-04", laptop: 439, monitor: 380, peripheral: 220 },
  { date: "2024-06-05", laptop: 188, monitor: 140, peripheral: 95 },
  { date: "2024-06-06", laptop: 294, monitor: 250, peripheral: 150 },
  { date: "2024-06-07", laptop: 323, monitor: 370, peripheral: 160 },
  { date: "2024-06-08", laptop: 385, monitor: 320, peripheral: 195 },
  { date: "2024-06-09", laptop: 438, monitor: 380, peripheral: 220 },
  { date: "2024-06-10", laptop: 255, monitor: 200, peripheral: 130 },
  { date: "2024-06-11", laptop: 192, monitor: 150, peripheral: 100 },
  { date: "2024-06-12", laptop: 492, monitor: 420, peripheral: 250 },
  { date: "2024-06-13", laptop: 181, monitor: 130, peripheral: 95 },
  { date: "2024-06-14", laptop: 426, monitor: 380, peripheral: 220 },
  { date: "2024-06-15", laptop: 407, monitor: 350, peripheral: 210 },
  { date: "2024-06-16", laptop: 371, monitor: 310, peripheral: 190 },
  { date: "2024-06-17", laptop: 475, monitor: 420, peripheral: 240 },
  { date: "2024-06-18", laptop: 207, monitor: 170, peripheral: 110 },
  { date: "2024-06-19", laptop: 341, monitor: 290, peripheral: 175 },
  { date: "2024-06-20", laptop: 408, monitor: 350, peripheral: 210 },
  { date: "2024-06-21", laptop: 269, monitor: 210, peripheral: 140 },
  { date: "2024-06-22", laptop: 317, monitor: 270, peripheral: 160 },
  { date: "2024-06-23", laptop: 480, monitor: 430, peripheral: 250 },
  { date: "2024-06-24", laptop: 232, monitor: 180, peripheral: 120 },
  { date: "2024-06-25", laptop: 241, monitor: 190, peripheral: 125 },
  { date: "2024-06-26", laptop: 434, monitor: 380, peripheral: 220 },
  { date: "2024-06-27", laptop: 448, monitor: 390, peripheral: 230 },
  { date: "2024-06-28", laptop: 249, monitor: 200, peripheral: 130 },
  { date: "2024-06-29", laptop: 203, monitor: 160, peripheral: 110 },
  { date: "2024-06-30", laptop: 446, monitor: 400, peripheral: 230 },
];

/** 
 * Derived calculation for assigned, total, and in-stock counts 
 * based on the freshly mapped MOCK_ASSETS array.
 */
const assignedCount = MOCK_ASSETS.filter(a => a.employee && a.employee !== "UNASSIGNED").length;
const totalCount = MOCK_ASSETS.length;
const inStockCount = totalCount - assignedCount;

/** Aggregated statistics for top-level dashboard KPI cards. */
export const MOCK_STATS: DashboardStats = {
  totalAssets: {
    count: totalCount,
    assigned: assignedCount,
    inStock: inStockCount
  },
  deployment: {
    count: assignedCount,
    percentage: Math.round((assignedCount / totalCount) * 100)
  },
  stock: {
    count: inStockCount,
    ready: MOCK_ASSETS.filter(a => (a.employee === "UNASSIGNED" || !a.employee) && ["GOOD", "NEW"].includes(a.state)).length
  },
  maintenance: {
    count: MOCK_ASSETS.filter(a => ["BROKEN", "FAIR"].includes(a.state)).length,
    pending: 2,
    inProgress: 1,
    completed: 12
  }
};

/** Recent activity stream for the dashboard sidebar/main feed. */
const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 1,
    user: {
      name: "Jane Doe",
      avatar: "/avatars/01.png",
      initials: "JD",
    },
    action: "assigned to",
    target: "MacBook Pro 16",
    timestamp: "2024-05-30T10:00:00Z",
  },
  {
    id: 2,
    user: {
      name: "John Smith",
      avatar: "/avatars/02.png",
      initials: "JS",
    },
    action: "checked out",
    target: "iPad Pro 11",
    timestamp: "2024-05-30T09:30:00Z",
  },
  {
    id: 3,
    user: {
      name: "System",
      avatar: "",
      initials: "SYS",
    },
    action: "flagged for maintenance",
    target: "Server Rack B",
    timestamp: "2024-05-29T14:15:00Z",
  },
  {
    id: 4,
    user: {
      name: "Sarah Jones",
      avatar: "/avatars/03.png",
      initials: "SJ",
    },
    action: "returned",
    target: "Dell Latitude 7420",
    timestamp: "2024-05-29T11:45:00Z",
  },
  {
    id: 5,
    user: {
      name: "Michael Chen",
      avatar: "/avatars/04.png",
      initials: "MC",
    },
    action: "updated firmware on",
    target: "Cisco switch",
    timestamp: "2024-05-28T16:20:00Z",
  },
  {
    id: 6,
    user: {
      name: "Admin",
      avatar: "",
      initials: "AD",
    },
    action: "added new user",
    target: "Robert Fox",
    timestamp: "2024-05-28T09:10:00Z",
  },
  {
    id: 7,
    user: {
      name: "Jane Doe",
      avatar: "/avatars/01.png",
      initials: "JD",
    },
    action: "requested",
    target: "New Monitor",
    timestamp: "2024-05-27T15:00:00Z",
  },
  {
    id: 8,
    user: {
      name: "System",
      avatar: "",
      initials: "SYS",
    },
    action: "backup completed",
    target: "Main Database",
    timestamp: "2024-05-27T02:00:00Z",
  },
  {
    id: 9,
    user: {
      name: "John Smith",
      avatar: "/avatars/02.png",
      initials: "JS",
    },
    action: "logged in",
    target: "Portal",
    timestamp: "2024-05-26T08:55:00Z",
  },
  {
    id: 10,
    user: {
      name: "Michael Chen",
      avatar: "/avatars/04.png",
      initials: "MC",
    },
    action: "deployed",
    target: "Version 1.2.0",
    timestamp: "2024-05-25T18:30:00Z",
  },
  {
    id: 11,
    user: {
      name: "Sarah Jones",
      avatar: "/avatars/03.png",
      initials: "SJ",
    },
    action: "updated ticket",
    target: "INC-1234",
    timestamp: "2024-05-25T14:20:00Z",
  },
  {
    id: 12,
    user: {
      name: "Admin",
      avatar: "",
      initials: "AD",
    },
    action: "changed permissions for",
    target: "Guest Group",
    timestamp: "2024-05-24T11:00:00Z",
  },
  {
    id: 13,
    user: {
      name: "System",
      avatar: "",
      initials: "SYS",
    },
    action: "detected anomaly",
    target: "Firewall Log",
    timestamp: "2024-05-24T03:45:00Z",
  },
  {
    id: 14,
    user: {
      name: "Jane Doe",
      avatar: "/avatars/01.png",
      initials: "JD",
    },
    action: "commented on",
    target: "PR #56",
    timestamp: "2024-05-23T16:50:00Z",
  },
  {
    id: 15,
    user: {
      name: "Michael Chen",
      avatar: "/avatars/04.png",
      initials: "MC",
    },
    action: "restarted",
    target: "Service A",
    timestamp: "2024-05-23T09:15:00Z",
  },
];

/**
 * Fetches the full list of assets in legacy format.
 * 
 * @returns {Promise<Asset[]>}
 */// API Methods
export async function getAssets(): Promise<Asset[]> {
  if (isMockDataEnabled()) {
    return Promise.resolve(MOCK_ASSETS);
  }

  // Call real API and convert to legacy format if needed
  const response = await apiClient.get<{ data: Asset[] }>('/assets');
  return response.data || [];
}

/**
 * Fetches data points for inventory usage charts.
 * 
 * @returns {Promise<ChartDataPoint[]>}
 */
export async function getChartData(): Promise<ChartDataPoint[]> {
  if (isMockDataEnabled()) {
    return Promise.resolve(MOCK_CHART_DATA);
  }

  const response = await apiClient.get<ApiResponse<ChartDataPoint[]>>('/dashboard/chart-data');
  return response.data;
}

/**
 * Retrieves the high-level summary statistics for the dashboard.
 * 
 * @returns {Promise<DashboardStats>}
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  if (isMockDataEnabled()) {
    return Promise.resolve(MOCK_STATS);
  }

  return apiClient.get<DashboardStats>('/dashboard/stats');
}

/**
 * Retrieves a list of recent activities/audit logs.
 * 
 * @returns {Promise<Activity[]>}
 */
export async function getActivities(): Promise<Activity[]> {
  if (isMockDataEnabled()) {
    return Promise.resolve(MOCK_ACTIVITIES);
  }

  const response = await apiClient.get<ApiResponse<Activity[]>>('/activities');
  return response.data;
}

/**
 * Creates a new activity log entry.
 * 
 * @param activity - The activity data to log (excluding ID and timestamp which are auto-generated).
 * @returns {Promise<Activity>} The created activity record.
 */
export async function logActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity> {
  if (isMockDataEnabled()) {
    // Only access MockStorage in the browser context
    if (typeof window !== 'undefined') {
      const { MockStorage, STORAGE_KEYS } = await import('@/lib/mock-storage');
      const activities = MockStorage.getAll<Activity>(STORAGE_KEYS.ACTIVITIES);
      
      const newActivity: Activity = {
        ...activity,
        id: activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1,
        timestamp: new Date().toISOString(),
      };
      
      MockStorage.add(STORAGE_KEYS.ACTIVITIES, newActivity);
      return Promise.resolve(newActivity);
    }
    // Fallback if not in browser context (for SSR safety)
    return Promise.resolve({
      ...activity,
      id: Math.random(),
      timestamp: new Date().toISOString(),
    });
  }

  return apiClient.post<Activity>('/activities', activity);
}

