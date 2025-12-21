/**
 * @file model-service.ts
 * @description Service layer for managing hardware models.
 * Handles data fetching, CRUD operations, and conversion between nested JSON specs and flat Model objects.
 * @path /services/model-service.ts
 */

import { isMockDataEnabled, apiClient } from '@/lib/api-client';
import { Model, ModelFilters, PaginatedResponse } from '@/lib/types';
import modelsData from '@/data/models.json';
import { MockStorage, STORAGE_KEYS } from '@/lib/mock-storage';
import { paginateData } from '@/lib/utils';

/**
 * Interface representing the raw structure of individual items in the the `models.json` file.
 * Used for safe type assertion during initial mock conversion.
 */
interface RawModel {
  name: string;
  category: string;
  make: string;
  specs: {
    cpu?: string;
    ram?: string;
    storage?: string;
    dedicatedgpu?: string;
    'usb-aports'?: string;
    'usb-cports'?: string;
    dimensions?: string;
    resolution?: string;
    refreshhertz?: string;
  };
}

/**
 * Transforms the nested static mock JSON data into the application's unified flat `Model` type.
 * 
 * @returns {Model[]} An array of normalized Model objects.
 */
function convertModelData(): Model[] {
  return (modelsData as RawModel[]).map((item, index) => ({
    id: index + 1,
    name: item.name,
    category: item.category,
    make: item.make,
    cpu: item.specs.cpu || 'N/A',
    ram: item.specs.ram || 'N/A',
    storage: item.specs.storage || 'N/A',
    dedicatedgpu: item.specs.dedicatedgpu || 'N/A',
    'usb-aports': item.specs['usb-aports'] || 'N/A',
    'usb-cports': item.specs['usb-cports'] || 'N/A',
    dimensions: item.specs.dimensions || 'N/A',
    resolution: item.specs.resolution || 'N/A',
    refreshhertz: item.specs.refreshhertz || 'N/A',
  }));
}

/**
 * Accesses or initializes the local storage-based mock models.
 * 
 * @returns {Model[]} The current set of models from mock storage.
 */
function getMockModels(): Model[] {
  return MockStorage.initialize(STORAGE_KEYS.MODELS, convertModelData());
}

/**
 * Retrieves a paginated list of models.
 * 
 * @param filters - Pagination and filtering parameters.
 * @returns {Promise<PaginatedResponse<Model>>}
 */
export async function getModels(filters: ModelFilters = {}): Promise<PaginatedResponse<Model>> {
  if (isMockDataEnabled()) {
    let filtered = getMockModels();

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((model) =>
        model.name.toLowerCase().includes(searchLower) ||
        model.make.toLowerCase().includes(searchLower) ||
        model.category.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.category) {
       filtered = filtered.filter(m => m.category.toLowerCase() === filters.category!.toLowerCase());
    }

    return Promise.resolve(paginateData(filtered, filters.page, filters.pageSize));
  }

  return apiClient.get<PaginatedResponse<Model>>('/models', {
    params: filters as Record<string, string | number | boolean | undefined>
  });
}

/**
 * Fetches a single model by ID.
 */
export async function getModelById(id: number): Promise<Model> {
  if (isMockDataEnabled()) {
    const model = getMockModels().find((m) => m.id === id);
    if (!model) {
      throw new Error(`Model with ID ${id} not found`);
    }
    return Promise.resolve(model);
  }
  
  return apiClient.get<Model>(`/models/${id}`);
}

/**
 * Creates a new model.
 */
export async function createModel(model: Omit<Model, 'id'>): Promise<Model> {
  if (isMockDataEnabled()) {
    const models = getMockModels();
    const newModel: Model = {
      ...model,
      id: models.length > 0 ? Math.max(...models.map(m => m.id || 0)) + 1 : 1,
    };
    MockStorage.add(STORAGE_KEYS.MODELS, newModel);
    return Promise.resolve(newModel);
  }
  
  return apiClient.post<Model>('/models', model);
}

/**
 * Updates an existing model.
 */
export async function updateModel(id: number, updates: Partial<Model>): Promise<Model> {
  if (isMockDataEnabled()) {
    // Assert Model type with required ID for storage compatibility
    const updated = MockStorage.update<Model & { id: number }>(STORAGE_KEYS.MODELS, id, updates);
    if (!updated) {
      throw new Error(`Model with ID ${id} not found`);
    }
    return Promise.resolve(updated);
  }
  
  return apiClient.put<Model>(`/models/${id}`, updates);
}

/**
 * Deletes a model.
 */
export async function deleteModel(id: number): Promise<{ success: boolean }> {
  if (isMockDataEnabled()) {
    const success = MockStorage.remove(STORAGE_KEYS.MODELS, id);
    if (!success) {
      throw new Error(`Model with ID ${id} not found`);
    }
    return Promise.resolve({ success: true });
  }

  return apiClient.delete<{ success: boolean }>(`/models/${id}`);
}
