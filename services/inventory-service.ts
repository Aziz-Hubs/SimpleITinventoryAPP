/**
 * @file inventory-service.ts
 * @description Core service layer for managing IT inventory assets.
 * Orchestrates data fetching, filtering, and CRUD operations, supporting both 
 * local mock storage (via `MockStorage`) and remote REST API integration.
 * @path /services/inventory-service.ts
 */

import { isMockDataEnabled, apiClient } from '@/lib/api-client';
import { Asset, AssetCreate, PaginatedResponse, AssetFilters, ImportResult, AssetStateEnum, ASSET_STATES } from '@/lib/types';
import inventoryData from '@/data/inv.json';
import employeeJson from '@/data/employees.json';
import modelsJson from '@/data/models.json';
import { MockStorage, STORAGE_KEYS } from '@/lib/mock-storage';
import { paginateData } from '@/lib/utils';

interface InventoryItem {
  id: number;
  category: string;
  state: string;
  make: string;
  model: string;
  servicetag: string;
  warrantyexpiry: string;
  location: string;
  additionalcomments: string;
  employee: string;
  specs?: Record<string, string | number | boolean | undefined>;
}

/**
 * Transforms the static mock JSON data into the application's unified `Asset` type.
 * 
 * @returns {Asset[]} An array of normalized Asset objects.
 */
function convertInventoryData(): Asset[] {
  const employeeNameToIdMap = new Map(employeeJson.employees.map(emp => [emp.fullName, emp.id]));
  const modelNameToIdMap = new Map(modelsJson.map((model, index) => [model.name, index + 1]));

  return (inventoryData as InventoryItem[]).map((item, index) => {
    const employeeId = item.employee ? employeeNameToIdMap.get(item.employee) : undefined;
    const modelId = item.model ? modelNameToIdMap.get(item.model) : undefined;
    
    // Map state string to Enum. Default to New if not found.
    const stateString = item.state?.toUpperCase() || "NEW";
    const state = Object.values(AssetStateEnum).includes(stateString as AssetStateEnum)
      ? (stateString as AssetStateEnum)
      : AssetStateEnum.New;

    return {
      id: index + 1,
      invoiceLineItemId: null,
      modelId: modelId || 0, // Default to 0 if not found
      make: item.make || '',
      model: item.model || '',
      state: state as AssetStateEnum,
      warrantyExpiry: item.warrantyexpiry || null,
      serviceTag: item.servicetag || '',
      employeeId: employeeId || null,
      employee: item.employee,
      notes: item.additionalcomments || null,
      location: item.location || '',
      category: item.category || '',
      tenantId: "default",
      isDeleted: false,
      rowVersion: "0x00",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "system",
      updatedBy: "system"
    };
  });
}

/**
 * Accesses or initializes the local storage-based mock inventory.
 * If no data exists in localStorage, it hydrates the storage with converted `inv.json` data.
 * 
 * @returns {Asset[]} The current set of assets from mock storage.
 */
function getMockInventory(): Asset[] {
  return MockStorage.initialize(STORAGE_KEYS.INVENTORY, convertInventoryData());
}

/**
 * Performs client-side filtering on the mock dataset.
 * Supports exact matches for category/state and fuzzy partial matches for employee/location/search.
 * 
 * @param filters - The filter criteria provided by the UI.
 * @returns {Asset[]} The filtered subset of assets.
 */
function filterMockData(filters: AssetFilters): Asset[] {
  let filtered = getMockInventory();

  // Category filtering - use the category field directly on Asset
  if (filters.category) {
    filtered = filtered.filter(
      (asset) => asset.category?.toLowerCase() === filters.category?.toLowerCase()
    );
  }

  if (filters.state) {
    filtered = filtered.filter(
      (asset) => asset.state === filters.state
    );
  }

  if (filters.employeeId) {
    filtered = filtered.filter(
      (asset) => asset.employeeId === filters.employeeId
    );
  } else if (filters.employee) {
    // Legacy string filter support if needed
    const employeeId = employeeJson.employees.find(e => e.fullName.toLowerCase().includes(filters.employee?.toLowerCase() || ''))?.id;
    filtered = filtered.filter(
      (asset) => asset.employeeId === employeeId
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
 * Retrieves a paginated list of assets.
 * 
 * @param filters - Pagination and filtering parameters.
 * @returns {Promise<PaginatedResponse<Asset>>}
 */
export async function getAssets(filters: AssetFilters = {}): Promise<PaginatedResponse<Asset>> {
  if (isMockDataEnabled()) {
    const filtered = filterMockData(filters);
    return Promise.resolve(paginateData(filtered, filters.page, filters.pageSize));
  }

  return apiClient.get<PaginatedResponse<Asset>>('/assets', { 
    params: filters as Record<string, string | number | boolean | undefined> 
  });
}

/**
 * Fetches a single asset by its unique numeric ID.
 * 
 * @param id - The asset ID.
 * @throws {Error} If in mock mode and the ID does not exist.
 * @returns {Promise<Asset>}
 */
export async function getAssetById(id: number): Promise<Asset> {
  if (isMockDataEnabled()) {
    const asset = getMockInventory().find((a) => a.id === id);
    if (!asset) {
      throw new Error(`Asset with ID ${id} not found`);
    }
    return Promise.resolve(asset);
  }

  return apiClient.get<Asset>(`/assets/${id}`);
}

/**
 * Convenience method to find an asset by its Hardware/Service tag.
 * Useful for scanning operations or deep-linking from serial numbers.
 * 
 * @param serviceTag - The service tag string to search for.
 * @returns {Promise<Asset | null>} The asset if found, otherwise null.
 */
export async function getAssetByServiceTag(serviceTag: string): Promise<Asset | null> {
  if (isMockDataEnabled()) {
    const asset = getMockInventory().find(
      (a: Asset) => a.serviceTag?.toLowerCase() === serviceTag.toLowerCase()
    );
    return Promise.resolve(asset || null);
  }

  const response = await getAssets({ search: serviceTag });
  return response.data.find(a => a.serviceTag?.toLowerCase() === serviceTag.toLowerCase()) || null;
}

/**
 * Performs a lightweight search intended for autocomplete fields.
 * Limited to first 10 matches for performance.
 * 
 * @param query - The search string.
 * @returns {Promise<Asset[]>} Top 10 matching assets.
 */
export async function searchAssets(query: string): Promise<Asset[]> {
  if (isMockDataEnabled()) {
    if (!query) return Promise.resolve([]);
    const lowerQuery = query.toLowerCase();
    const results = getMockInventory().filter(
      (a: Asset) =>
        a.serviceTag?.toLowerCase().includes(lowerQuery)
    ).slice(0, 10);
    return Promise.resolve(results);
  }

  const response = await getAssets({ search: query, pageSize: 10 });
  return response.data;
}

/**
 * Persists a new asset to the system.
 * 
 * @param asset - The asset data excluding auto-generated ID.
 * @sideeffect Updates localStorage in mock mode.
 * @returns {Promise<Asset>} The created asset with its new ID.
 */
/**
 * Persists a new asset to the system.
 * 
 * @param asset - The asset data excluding auto-generated ID.
 * @sideeffect Updates localStorage in mock mode.
 * @returns {Promise<Asset>} The created asset with its new ID.
 */
export async function createAsset(asset: AssetCreate): Promise<Asset> {
  if (isMockDataEnabled()) {
    const inventory = getMockInventory();
    const newAsset: Asset = {
      ...asset,
      id: inventory.length > 0 ? Math.max(...inventory.map(a => a.id || 0)) + 1 : 1,
      invoiceLineItemId: asset.invoiceLineItemId ?? null,
      rowVersion: "0x00",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "current-user",
      updatedBy: "current-user",
      tenantId: "default"
    };
    MockStorage.add(STORAGE_KEYS.INVENTORY, newAsset);
    return Promise.resolve(newAsset);
  }

  return apiClient.post<Asset>('/assets', asset);
}

/**
 * Updates an existing asset's details.
 * 
 * @param id - ID of the asset to update.
 * @param asset - Partial set of fields to change.
 * @throws {Error} If the asset is not found in mock mode.
 * @returns {Promise<Asset>} The updated asset.
 */
export async function updateAsset(id: number, asset: Partial<Asset>): Promise<Asset> {
  if (isMockDataEnabled()) {
    const updated = MockStorage.update<Asset>(STORAGE_KEYS.INVENTORY, id, asset);
    if (!updated) {
      throw new Error(`Asset with ID ${id} not found`);
    }
    return Promise.resolve(updated);
  }

  return apiClient.put<Asset>(`/assets/${id}`, asset);
}

/**
 * Removes an asset from the inventory.
 * 
 * @param id - The asset ID to delete.
 * @returns {Promise<{ success: boolean; message: string }>}
 */
export async function deleteAsset(id: number): Promise<{ success: boolean; message: string }> {
  if (isMockDataEnabled()) {
    const success = MockStorage.remove(STORAGE_KEYS.INVENTORY, id);
    if (!success) {
      throw new Error(`Asset with ID ${id} not found`);
    }
    return Promise.resolve({ success: true, message: 'Asset deleted successfully' });
  }

  return apiClient.delete<{ success: boolean; message: string }>(`/assets/${id}`);
}

/**
 * Triggers a CSV file upload for bulk asset creation/updates.
 * 
 * @param file - The multi-part form file data.
 * @returns {Promise<ImportResult>} Summary of success and failure counts.
 */
export async function importAssetsFromCSV(file: File): Promise<ImportResult> {
  if (isMockDataEnabled()) {
    return Promise.resolve({
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
    });
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/import/csv`, {
    method: 'POST',
    body: formData,
  });

  return response.json();
}

/**
 * Generates and downloads a CSV export of the current filtered inventory.
 * 
 * @param filters - Search criteria to filter the export results.
 * @returns {Promise<Blob>} A blob containing the CSV file data.
 */
export async function exportAssetsToCSV(filters: AssetFilters = {}): Promise<Blob> {
  if (isMockDataEnabled()) {
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
 * aggregates statistics about the inventory for overview charts and kpi cards.
 * 
 * @returns {Promise<Object>} aggregations by status, category, and assignment.
 */
export async function getInventoryStats() {
  const assets = isMockDataEnabled() ? getMockInventory() : (await getAssets({ pageSize: 9999 })).data;

  const totalAssets = assets.length;
  const assigned = assets.filter((a) => a.employeeId && a.employeeId !== 'UNASSIGNED').length;
  const inStock = totalAssets - assigned;

  // Since Asset doesn't have category string, we need to lookup via Model
  const modelIdToCategoryMap = new Map(modelsJson.map((model, index) => [index + 1, model.category]));
  
  const byCategory = assets.reduce((acc, asset) => {
    const category = modelIdToCategoryMap.get(asset.modelId) || 'Unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byState = assets.reduce((acc, asset) => {
    const state = asset.state as string || 'Unknown';
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
