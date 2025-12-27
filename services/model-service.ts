/**
 * @file model-service.ts
 * @description Service layer for managing hardware models using Supabase.
 * @path /services/model-service.ts
 */

import { supabase } from '@/lib/supabase';
import { Model, ModelFilters, PaginatedResponse, ModelCreate, ModelUpdate } from '@/lib/types';
import { paginateData } from '@/lib/utils';
import { parseModelsCsv } from '@/lib/csv-parser';
import { ImportResult } from '@/lib/types';

// Helper to map DB row to Model type
function mapModelFromDB(row: any): Model {
  return {
    id: row.id,
    name: row.name,
    make: row.make,
    category: row.category,
    specs: row.specs || {},
    tenantId: row.tenant_id,
    createdAt: row.created_at,
    createdBy: row.created_by,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
    rowVersion: row.row_version,
  };
}

// Helper to map ModelCreate to DB row
function mapModelToDB(model: ModelCreate | ModelUpdate) {
  const dbRow: any = {
    name: model.name,
    make: model.make,
    category: model.category,
    specs: model.specs,
  };
  
  // Only include defined fields
  Object.keys(dbRow).forEach(key => dbRow[key] === undefined && delete dbRow[key]);
  return dbRow;
}

/**
 * Retrieves a paginated list of models.
 * 
 * @param filters - Pagination and filtering parameters.
 * @returns {Promise<PaginatedResponse<Model>>}
 */
export async function getModels(filters: ModelFilters = {}): Promise<PaginatedResponse<Model>> {
  let query = supabase
    .from('models')
    .select('*', { count: 'exact' });

  if (filters.search) {
    const term = filters.search;
    query = query.or(`name.ilike.%${term}%,make.ilike.%${term}%,category.ilike.%${term}%`);
  }
  
  if (filters.category) {
    query = query.ilike('category', filters.category);
  }

  if (filters.make) {
    query = query.ilike('make', filters.make);
  }

  const page = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  query = query
    .order('name', { ascending: true })
    .range(start, end);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const models = (data || []).map(mapModelFromDB);

  return {
    data: models,
    pagination: {
      page,
      pageSize,
      totalItems: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  };
}

/**
 * Fetches a single model by ID.
 */
export async function getModelById(id: number): Promise<Model> {
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapModelFromDB(data);
}

/**
 * Creates a new model.
 */
export async function createModel(model: ModelCreate): Promise<Model> {
  const dbRow = mapModelToDB(model);
  dbRow.tenant_id = '00000000-0000-0000-0000-000000000000';
  dbRow.created_by = 'system';
  dbRow.updated_by = 'system';

  const { data, error } = await supabase
    .from('models')
    .insert(dbRow)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapModelFromDB(data);
}

/**
 * Updates an existing model.
 */
export async function updateModel(id: number, updates: ModelUpdate): Promise<Model> {
  const dbRow = mapModelToDB(updates);
  dbRow.updated_at = new Date().toISOString();
  dbRow.updated_by = 'system';

  const { data, error } = await supabase
    .from('models')
    .update(dbRow)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapModelFromDB(data);
}

/**
 * Deletes a model.
 */
export async function deleteModel(id: number): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('models')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

/**
 * Triggers a CSV file upload for bulk model creation.
 * 
 * @param file - The Multi-part form file data.
 * @returns {Promise<ImportResult>}
 */
export async function importModelsFromCSV(file: File): Promise<ImportResult> {
  try {
    const parsedModels = await parseModelsCsv(file);
    const results: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
    };

    const batchSize = 50;
    for (let i = 0; i < parsedModels.length; i += batchSize) {
      const batch = parsedModels.slice(i, i + batchSize);

      const dbRows = batch.map(model => ({
        name: model.name,
        make: model.make,
        category: model.category,
        specs: model.specs,
        tenant_id: '00000000-0000-0000-0000-000000000000',
        created_by: 'import',
        updated_by: 'import',
      }));

      const { error } = await supabase.from('models').insert(dbRows);

      if (error) {
        results.failed += batch.length;
        results.errors?.push({ row: i, message: error.message });
      } else {
        results.imported += batch.length;
      }
    }

    return results;
  } catch (err) {
    return {
      success: false,
      imported: 0,
      failed: 0,
      errors: [{ row: 0, message: (err as Error).message }]
    };
  }
}

/**
 * Generates and downloads a CSV export of the current filtered models.
 * 
 * @param filters - Search criteria.
 * @returns {Promise<Blob>}
 */
export async function exportModelsToCSV(filters: ModelFilters = {}): Promise<Blob> {
  const exportFilters = { ...filters, pageSize: 10000 };
  const result = await getModels(exportFilters);
  const models = result.data;

  if (models.length === 0) {
    return new Blob([''], { type: 'text/csv' });
  }

  const headers = ['ID', 'Name', 'Make', 'Category', 'CPU', 'RAM', 'Storage'];
  const csvContent = [
    headers.join(','),
    ...models.map(m => {
        const specs = m.specs as any || {};
        return [
          m.id,
          `"${m.name}"`,
          `"${m.make}"`,
          `"${m.category}"`,
          `"${specs.cpu || ''}"`,
          `"${specs.ram || ''}"`,
          `"${specs.storage || ''}"`
        ].join(',');
    })
  ].join('\n');

  return new Blob([csvContent], { type: 'text/csv' });
}
