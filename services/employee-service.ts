/**
 * @file employee-service.ts
 * @description Service layer for managing employee-related data.
 * Reads employee data from the dedicated `data/employees.json` file.
 * @path /services/employee-service.ts
 */

import employeesJson from '@/data/employees.json';
import { isMockDataEnabled, apiClient } from '@/lib/api-client';
import { Employee, PaginatedResponse, EmployeeFilters } from '@/lib/types';
import { MockStorage, STORAGE_KEYS } from '@/lib/mock-storage';
import { paginateData } from '@/lib/utils';

/**
 * Retrieves the initial employees list from the JSON file.
 * @returns {Employee[]} The list of employees from the data source.
 */
function getInitialEmployees(): Employee[] {
    return employeesJson.employees as Employee[];
}

/**
 * Retrieves the employee list from local storage or hydrates it from the employees.json data.
 * If cached data is empty but source has data, it refreshes the cache.
 * 
 * @returns {Employee[]}
 */
function getMockEmployees(): Employee[] {
    const sourceData = getInitialEmployees();
    const cachedData = MockStorage.getAll<Employee>(STORAGE_KEYS.EMPLOYEES);
    
    // If cache is empty but source has data, refresh from source
    if (cachedData.length === 0 && sourceData.length > 0) {
        return MockStorage.refresh(STORAGE_KEYS.EMPLOYEES, sourceData);
    }
    
    // Otherwise use standard initialize (returns cached if exists, or saves source)
    return MockStorage.initialize(STORAGE_KEYS.EMPLOYEES, sourceData);
}

/**
 * Retrieves a list of employees with optional filtering.
 * 
 * @param filters - Search query (name/email/dept) and department filter.
 * @returns {Promise<PaginatedResponse<Employee>>}
 */
export async function getEmployees(filters: EmployeeFilters = {}): Promise<PaginatedResponse<Employee>> {
    if (isMockDataEnabled()) {
        const employees = getMockEmployees();
        
        let filtered = [...employees];
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(e => 
                e.fullName.toLowerCase().includes(search) || 
                e.email.toLowerCase().includes(search) ||
                e.department.toLowerCase().includes(search)
            );
        }

        if (filters.department && filters.department !== 'all') {
            filtered = filtered.filter(e => e.department === filters.department);
        }

        return Promise.resolve(paginateData(filtered, filters.page, filters.pageSize));
    }

    return apiClient.get<PaginatedResponse<Employee>>('/employees', { 
        params: filters as Record<string, string | number | boolean | undefined> 
    });
}

/**
 * Finds a specific employee by their generated ID.
 * 
 * @param id - The EMP-XXX string.
 * @returns {Promise<Employee | null>}
 */
export async function getEmployeeById(id: string): Promise<Employee | null> {
    if (isMockDataEnabled()) {
        const employee = getMockEmployees().find((e: Employee) => e.id === id);
        return Promise.resolve(employee || null);
    }

    return apiClient.get<Employee>(`/employees/${id}`);
}

/**
 * Searches for an employee by their full name.
 * 
 * @param name - The full name string (case-insensitive).
 * @returns {Promise<Employee | null>}
 */
export async function getEmployeeByName(name: string): Promise<Employee | null> {
    if (isMockDataEnabled()) {
        const employee = getMockEmployees().find((e: Employee) => e.fullName.toLowerCase() === name.toLowerCase());
        return Promise.resolve(employee || null);
    }

    const response = await getEmployees();
    return response.data.find(e => e.fullName.toLowerCase() === name.toLowerCase()) || null;
}

/**
 * Adds a new employee to the system.
 * 
 * @param employee - Employee detail excluding ID.
 * @sideeffect Appends to mock storage if enabled.
 * @returns {Promise<Employee>} The created object with its new ID.
 */
export async function createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    if (isMockDataEnabled()) {
        const employees = getMockEmployees();
        const newEmployee: Employee = {
            ...employee,
            id: `EMP-${(employees.length + 1).toString().padStart(3, '0')}`,
        };
        MockStorage.add(STORAGE_KEYS.EMPLOYEES, newEmployee);
        return Promise.resolve(newEmployee);
    }

    return apiClient.post<Employee>('/employees', employee);
}

/**
 * Updates an existing employee record.
 * 
 * @param id - The target ID.
 * @param updates - Partial object containing fields to change.
 * @throws {Error} If the ID does not exist in mock storage.
 * @returns {Promise<Employee>}
 */
export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    if (isMockDataEnabled()) {
        const updated = MockStorage.update<Employee>(STORAGE_KEYS.EMPLOYEES, id, updates);
        if (!updated) {
            throw new Error(`Employee with ID ${id} not found`);
        }
        return Promise.resolve(updated);
    }

    return apiClient.put<Employee>(`/employees/${id}`, updates);
}

/**
 * Permanently removes an employee.
 * 
 * @param id - Employee ID to remove.
 * @throws {Error} If the ID does not exist in mock storage.
 * @returns {Promise<{ success: boolean; message: string }>}
 */
export async function deleteEmployee(id: string): Promise<{ success: boolean; message: string }> {
    if (isMockDataEnabled()) {
        const success = MockStorage.remove(STORAGE_KEYS.EMPLOYEES, id);
        if (!success) {
            throw new Error(`Employee with ID ${id} not found`);
        }
        return Promise.resolve({ success: true, message: 'Employee deleted successfully' });
    }

    return apiClient.delete<{ success: boolean; message: string }>(`/employees/${id}`);
}
