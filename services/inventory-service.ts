/**
 * Inventory Service
 * 
 * Handles all inventory-related API calls and data management.
 * Supports both mock data (from inv.json) and real API integration.
 */

import { apiClient, isMockDataEnabled } from '@/lib/api-client';
import { Asset, PaginatedResponse, AssetFilters, ImportResult } from '@/lib/types';
import inventoryData from '@/data/inv.json';

/**
 * Convert inv.json format to Asset type
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

function convertInventoryData(): Asset[] {
  return (inventoryData as InventoryItem[]).map((item, index) => ({
    id: index + 1,
    category: item.category || '',
    state: item.state || '',
    warrantyexpiry: item.warrantyexpiry || '',
    make: item.make || '',
    model: item.model || '',
    cpu: item.cpu || 'N/A',
    ram: item.ram || 'N/A',
    storage: item.storage || 'N/A',
    dedicatedgpu: item.dedicatedgpu || 'N/A',
    'usb-aports': item['usb-aports'] || 'N/A',
    'usb-cports': item['usb-cports'] || 'N/A',
    servicetag: item.servicetag || '',
    employee: item.employee || '',
    additionalcomments: item.additionalcomments || '',
    location: item.location || '',
    dimensions: item.dimensions || 'N/A',
    resolution: item.resolution || 'N/A',
    refreshhertz: item.refreshhertz || 'N/A',
  }));
}

/**
 * Mock data from inv.json
 */
const MOCK_INVENTORY: Asset[] = convertInventoryData();

/**
 * Apply filters to mock data
 */
function filterMockData(filters: AssetFilters): Asset[] {
  let filtered = [...MOCK_INVENTORY];

  if (filters.category) {
    filtered = filtered.filter(
      (asset) => asset.category?.toLowerCase() === filters.category?.toLowerCase()
    );
  }

  if (filters.state) {
    filtered = filtered.filter(
      (asset) => asset.state?.toLowerCase() === filters.state?.toLowerCase()
    );
  }

  if (filters.employee) {
    filtered = filtered.filter(
      (asset) => asset.employee?.toLowerCase().includes(filters.employee?.toLowerCase() || '')
    );
  }

  if (filters.location) {
    filtered = filtered.filter(
      (asset) => asset.location?.toLowerCase().includes(filters.location?.toLowerCase() || '')
    );
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter((asset) =>
      Object.values(asset).some((value) =>
        String(value).toLowerCase().includes(searchLower)
      )
    );
  }

  return filtered;
}

/**
 * Paginate data
 */
function paginateData<T>(data: T[], page: number = 1, pageSize: number = 50): PaginatedResponse<T> {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      page,
      pageSize,
      totalItems: data.length,
      totalPages: Math.ceil(data.length / pageSize),
    },
  };
}

/**
 * Get all assets with optional filtering and pagination
 */
export async function getAssets(filters: AssetFilters = {}): Promise<PaginatedResponse<Asset>> {
  if (isMockDataEnabled()) {
    // Use mock data from inv.json
    const filtered = filterMockData(filters);
    return Promise.resolve(paginateData(filtered, filters.page, filters.pageSize));
  }

  // Call real API
  return apiClient.get<PaginatedResponse<Asset>>('/assets', { params: filters as Record<string, string | number | boolean | undefined> });
}

/**
 * Get a single asset by ID
 */
export async function getAssetById(id: number): Promise<Asset> {
  if (isMockDataEnabled()) {
    const asset = MOCK_INVENTORY.find((a) => a.id === id);
    if (!asset) {
      throw new Error(`Asset with ID ${id} not found`);
    }
    return Promise.resolve(asset);
  }

  return apiClient.get<Asset>(`/assets/${id}`);
}

/**
 * Create a new asset
 */
export async function createAsset(asset: Omit<Asset, 'id'>): Promise<Asset> {
  if (isMockDataEnabled()) {
    const newAsset: Asset = {
      ...asset,
      id: MOCK_INVENTORY.length + 1,
    };
    MOCK_INVENTORY.push(newAsset);
    return Promise.resolve(newAsset);
  }

  return apiClient.post<Asset>('/assets', asset);
}

/**
 * Update an existing asset
 */
export async function updateAsset(id: number, asset: Partial<Asset>): Promise<Asset> {
  if (isMockDataEnabled()) {
    const index = MOCK_INVENTORY.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Asset with ID ${id} not found`);
    }
    MOCK_INVENTORY[index] = { ...MOCK_INVENTORY[index], ...asset };
    return Promise.resolve(MOCK_INVENTORY[index]);
  }

  return apiClient.put<Asset>(`/assets/${id}`, asset);
}

/**
 * Delete an asset
 */
export async function deleteAsset(id: number): Promise<{ success: boolean; message: string }> {
  if (isMockDataEnabled()) {
    const index = MOCK_INVENTORY.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Asset with ID ${id} not found`);
    }
    MOCK_INVENTORY.splice(index, 1);
    return Promise.resolve({ success: true, message: 'Asset deleted successfully' });
  }

  return apiClient.delete<{ success: boolean; message: string }>(`/assets/${id}`);
}

/**
 * Import assets from CSV
 */
export async function importAssetsFromCSV(file: File): Promise<ImportResult> {
  if (isMockDataEnabled()) {
    // Mock implementation
    return Promise.resolve({
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
    });
  }

  const formData = new FormData();
  formData.append('file', file);

  // Note: This would need a different fetch implementation for file upload
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/import/csv`, {
    method: 'POST',
    body: formData,
  });

  return response.json();
}

/**
 * Export assets to CSV
 */
export async function exportAssetsToCSV(filters: AssetFilters = {}): Promise<Blob> {
  if (isMockDataEnabled()) {
    // Generate CSV from mock data
    const filtered = filterMockData(filters);
    const headers = Object.keys(filtered[0] || {}).join(',');
    const rows = filtered.map((asset) => Object.values(asset).join(','));
    const csv = [headers, ...rows].join('\n');
    return Promise.resolve(new Blob([csv], { type: 'text/csv' }));
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/export/csv?${new URLSearchParams(filters as Record<string, string>)}`,
    { method: 'GET' }
  );

  return response.blob();
}

/**
 * Get inventory statistics
 */
export async function getInventoryStats() {
  const assets = isMockDataEnabled() ? MOCK_INVENTORY : (await getAssets({ pageSize: 9999 })).data;

  const totalAssets = assets.length;
  const assigned = assets.filter((a) => a.employee && a.employee !== 'UNASSIGNED').length;
  const inStock = totalAssets - assigned;

  const byCategory = assets.reduce((acc, asset) => {
    const category = asset.category || 'Unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byState = assets.reduce((acc, asset) => {
    const state = asset.state || 'Unknown';
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalAssets,
    assigned,
    inStock,
    byCategory,
    byState,
  };
}
