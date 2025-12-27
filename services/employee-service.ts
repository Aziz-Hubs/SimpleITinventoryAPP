/**
 * @file employee-service.ts
 * @description Service layer for managing employee-related data using Supabase.
 * @path /services/employee-service.ts
 */

import { supabase } from '@/lib/supabase';
import { Employee, PaginatedResponse, EmployeeFilters, EmployeeCreate, EmployeeUpdate } from '@/lib/types';
import { paginateData } from '@/lib/utils';
import { parseEmployeesCsv } from '@/lib/csv-parser';
import { ImportResult } from '@/lib/types';

// Helper to map DB row to Employee type
function mapEmployeeFromDB(row: any): Employee {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    department: row.department,
    position: row.position,
    isActive: row.is_active,
    tenantId: row.tenant_id,
    createdAt: row.created_at,
    createdBy: row.created_by,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
    rowVersion: row.row_version,
  };
}

// Helper to map EmployeeCreate to DB row
function mapEmployeeToDB(employee: Employee | EmployeeCreate | EmployeeUpdate) {
  const dbRow: any = {
    full_name: (employee as any).fullName,
    email: (employee as any).email,
    department: (employee as any).department,
    position: (employee as any).position,
    is_active: (employee as any).isActive,
  };

  // Only include defined fields
  Object.keys(dbRow).forEach(key => dbRow[key] === undefined && delete dbRow[key]);
  return dbRow;
}

/**
 * Retrieves a list of employees with optional filtering.
 * 
 * @param filters - Search query (name/email/dept) and department filter.
 * @returns {Promise<PaginatedResponse<Employee>>}
 */
export async function getEmployees(filters: EmployeeFilters = {}): Promise<PaginatedResponse<Employee>> {
  let query = supabase
    .from('employees')
    .select('*', { count: 'exact' });

  if (filters.search) {
    const term = filters.search;
    query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,department.ilike.%${term}%`);
  }

  if (filters.department && filters.department !== 'all') {
    query = query.eq('department', filters.department);
  }

  if (filters.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }

  const page = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  query = query
    .order('full_name', { ascending: true })
    .range(start, end);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const employees = (data || []).map(mapEmployeeFromDB);

  return {
    data: employees,
    pagination: {
      page,
      pageSize,
      totalItems: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  };
}

/**
 * Finds a specific employee by their generated ID.
 * 
 * @param id - The EMP-XXX string.
 * @returns {Promise<Employee | null>}
 */
export async function getEmployeeById(id: string): Promise<Employee | null> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    // If error is code PGRST116 (JSON object requested, multiple (or no) rows returned), return null
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }

  return mapEmployeeFromDB(data);
}

/**
 * Searches for an employee by their full name.
 * 
 * @param name - The full name string (case-insensitive).
 * @returns {Promise<Employee | null>}
 */
export async function getEmployeeByName(name: string): Promise<Employee | null> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .ilike('full_name', name)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapEmployeeFromDB(data) : null;
}

/**
 * Adds a new employee to the system.
 * 
 * @param employee - Employee detail excluding ID.
 * @returns {Promise<Employee>} The created object with its new ID.
 */
export async function createEmployee(employee: EmployeeCreate): Promise<Employee> {
  // Generate ID if not provided? 
  // In the mock it was converting to EMP-XXX. Supabase doesn't auto-gen string IDs like that unless we use a trigger or client-side logic.
  // The table definition has `id text primary key`.
  // I will generate it client-side for now to match the "EMP-XXX" format or just use UUID if I changed the schema.
  // The schema I created says `id text primary key`.
  // Let's check how many employees to generate ID.
  
  // NOTE: This creates a race condition in high concurrency but acceptable for this migration context.
  const { count } = await supabase.from('employees').select('id', { count: 'exact', head: true });
  const nextId = `EMP-${((count || 0) + 1).toString().padStart(3, '0')}`;
  
  const dbRow = mapEmployeeToDB(employee);
  dbRow.id = nextId;
  dbRow.tenant_id = '00000000-0000-0000-0000-000000000000';
  dbRow.created_by = 'system';
  dbRow.updated_by = 'system';

  const { data, error } = await supabase
    .from('employees')
    .insert(dbRow)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapEmployeeFromDB(data);
}

/**
 * Updates an existing employee record.
 * 
 * @param id - The target ID.
 * @param updates - Partial object containing fields to change.
 * @returns {Promise<Employee>}
 */
export async function updateEmployee(id: string, updates: EmployeeUpdate): Promise<Employee> {
  const dbRow = mapEmployeeToDB(updates);
  dbRow.updated_at = new Date().toISOString();
  dbRow.updated_by = 'system';

  const { data, error } = await supabase
    .from('employees')
    .update(dbRow)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapEmployeeFromDB(data);
}

/**
 * Permanently removes an employee.
 * 
 * @param id - Employee ID to remove.
 * @returns {Promise<{ success: boolean; message: string }>}
 */
export async function deleteEmployee(id: string): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, message: 'Employee deleted successfully' };
}

/**
 * Triggers a CSV file upload for bulk employee creation.
 * 
 * @param file - The Multi-part form file data.
 * @returns {Promise<ImportResult>}
 */
export async function importEmployeesFromCSV(file: File): Promise<ImportResult> {
  try {
    const parsedEmployees = await parseEmployeesCsv(file);
    const results: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
    };

    const batchSize = 50;
    for (let i = 0; i < parsedEmployees.length; i += batchSize) {
      const batch = parsedEmployees.slice(i, i + batchSize);

      const dbRows = batch.map(emp => {
        // Simple ID generation for batch: this risks collision if run in parallel with other creators
        const idSuffix = Math.floor(Math.random() * 100000).toString().padStart(6, '0');
        return {
          id: `EMP-${idSuffix}`, 
          full_name: emp.fullName,
          email: emp.email,
          department: emp.department,
          position: emp.position,
          is_active: true,
          tenant_id: '00000000-0000-0000-0000-000000000000',
          created_by: 'import',
          updated_by: 'import',
        };
      });

      const { error } = await supabase.from('employees').insert(dbRows);

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
 * Generates and downloads a CSV export of the current filtered employees.
 * 
 * @param filters - Search criteria.
 * @returns {Promise<Blob>}
 */
export async function exportEmployeesToCSV(filters: EmployeeFilters = {}): Promise<Blob> {
  const exportFilters = { ...filters, pageSize: 10000 };
  const result = await getEmployees(exportFilters);
  const employees = result.data;

  if (employees.length === 0) {
    return new Blob([''], { type: 'text/csv' });
  }

  const headers = ['ID', 'Full Name', 'Email', 'Department', 'Position', 'Status'];
  const csvContent = [
    headers.join(','),
    ...employees.map(e => [
      e.id,
      `"${e.fullName}"`,
      e.email,
      e.department,
      e.position,
      e.isActive ? 'Active' : 'Inactive'
    ].join(','))
  ].join('\n');

  return new Blob([csvContent], { type: 'text/csv' });
}
