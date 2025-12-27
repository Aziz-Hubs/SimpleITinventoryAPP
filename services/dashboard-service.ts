/**
 * @file dashboard-service.ts
 * @description Service layer for aggregating dashboard-level data using Supabase.
 * @path /services/dashboard-service.ts
 */

import { Asset, DashboardStats, ChartDataPoint, Activity } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { getInventoryStats } from "./inventory-service";

/**
 * Fetches the full list of assets (legacy method support).
 * 
 * @returns {Promise<Asset[]>}
 */
export async function getAssets(): Promise<Asset[]> {
  const { data, error } = await supabase.from('assets').select('*');
  if (error) throw new Error(error.message);
  return data as any[]; // Type assertion needed or map it
}

/**
 * Fetches data points for inventory usage charts.
 * 
 * @returns {Promise<ChartDataPoint[]>}
 */
export async function getChartData(): Promise<ChartDataPoint[]> {
  // Placeholder: Real implementation would need a daily snapshot table or complex query.
  // For now, returning static mock data to keep the chart working until we have enough historical data.
  // TODO: Implement real historical tracking
  return [
    { date: "2024-06-25", laptop: 241, monitor: 190, peripheral: 125 },
    { date: "2024-06-26", laptop: 434, monitor: 380, peripheral: 220 },
    { date: "2024-06-27", laptop: 448, monitor: 390, peripheral: 230 },
    { date: "2024-06-28", laptop: 249, monitor: 200, peripheral: 130 },
    { date: "2024-06-29", laptop: 203, monitor: 160, peripheral: 110 },
    { date: "2024-06-30", laptop: 446, monitor: 400, peripheral: 230 },
  ];
}

/**
 * Retrieves the high-level summary statistics for the dashboard.
 * 
 * @returns {Promise<DashboardStats>}
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const stats = await getInventoryStats();
  
  // Calculate maintenance stats
  const { count: brokenCount } = await supabase
    .from('assets')
    .select('id', { count: 'exact', head: true })
    .in('state', ['BROKEN', 'FAIR']);

  const { count: pendingMnt } = await supabase
    .from('maintenance_records')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: inProgressMnt } = await supabase
    .from('maintenance_records')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'in-progress');

  const { count: completedMnt } = await supabase
    .from('maintenance_records')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'completed');

  // Stock ready count
  const { count: readyCount } = await supabase
    .from('assets')
    .select('id', { count: 'exact', head: true })
    .or('employee_id.is.null,employee_id.eq.UNASSIGNED')
    .in('state', ['GOOD', 'NEW']);

  return {
    totalAssets: {
      count: stats.totalAssets,
      assigned: stats.assigned,
      inStock: stats.inStock
    },
    deployment: {
      count: stats.assigned,
      percentage: stats.totalAssets > 0 ? Math.round((stats.assigned / stats.totalAssets) * 100) : 0
    },
    stock: {
      count: stats.inStock,
      ready: readyCount || 0
    },
    maintenance: {
      count: brokenCount || 0,
      pending: pendingMnt || 0,
      inProgress: inProgressMnt || 0,
      completed: completedMnt || 0
    }
  };
}

/**
 * Retrieves a list of recent activities/audit logs.
 * 
 * @returns {Promise<Activity[]>}
 */
export async function getActivities(): Promise<Activity[]> {
  // We haven't implemented an 'activities' table yet in the schema provided.
  // We can use a combination of created_at from various tables or a dedicated table.
  // For now, return empty or mock to prevet breakage until Activity Logging is properly scoped.
  // The 'maintenance_timeline_events' is somewhat an activity log but specific to maintenance.
  
  // Returning empty for now to avoid errors.
  return [];
}

/**
 * Creates a new activity log entry.
 * 
 * @param activity - The activity data to log.
 * @returns {Promise<Activity>} The created activity record.
 */
export async function logActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity> {
  console.log("Activity logging to Supabase not yet implemented", activity);
  // Return dummy
  return {
    ...activity,
    id: Math.random(),
    timestamp: new Date().toISOString()
  };
}
