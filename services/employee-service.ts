/**
 * Employee Service
 * 
 * Handles all employee-related data management.
 * Pulls employee information from inv.json (single source of truth).
 */

import inventoryData from '@/data/inv.json';
import { isMockDataEnabled, apiClient } from '@/lib/api-client';

export interface Employee {
    id: string;
    fullName: string;
    email: string;
    department: string;
    position: string;
}


// Define the shape of the raw inventory JSON data
interface InventoryItem {
    category: string;
    state: string;
    employee: string;
    [key: string]: unknown;
}

/**
 * Extract unique employees from inventory data
 */
function extractEmployeesFromInventory(): Employee[] {
    const uniqueNames = new Set<string>();

    (inventoryData as InventoryItem[]).forEach(item => {
        if (item.employee && item.employee !== 'UNASSIGNED') {
            uniqueNames.add(item.employee);
        }
    });

    return Array.from(uniqueNames).sort().map((name, index) => {
        // Generate a consistent ID based on the index
        const id = `EMP-${(index + 1).toString().padStart(3, '0')}`;

        // Create a mock email from the name
        // Names are formatted as "Last, First" or "First Last"
        const cleanName = name.replace(',', '').split(' ');
        const firstName = cleanName[cleanName.length - 1].toLowerCase();
        const lastName = cleanName[0].toLowerCase();
        const email = `${firstName}.${lastName}@acme.inc`;

        // Mock department and position for now
        // In a real app, these would come from an employee database
        const departments = ['Engineering', 'Design', 'Product', 'Marketing', 'HR', 'Sales', 'Support', 'IT', 'Finance'];
        const positions = ['Specialist', 'Manager', 'Developer', 'Analyst', 'Lead', 'Senior'];

        return {
            id,
            fullName: name,
            email,
            department: departments[index % departments.length],
            position: positions[index % positions.length],
        };
    });
}

const MOCK_EMPLOYEES: Employee[] = extractEmployeesFromInventory();


/**
 * Get all employees
 */
export async function getEmployees(): Promise<Employee[]> {
    if (isMockDataEnabled()) {
        return Promise.resolve(MOCK_EMPLOYEES);
    }

    // Call real API
    const response = await apiClient.get<{ data: Employee[] }>('/employees');
    return response.data;
}

/**
 * Get employee by ID
 */
export async function getEmployeeById(id: string): Promise<Employee | null> {
    if (isMockDataEnabled()) {
        const employee = MOCK_EMPLOYEES.find(e => e.id === id);
        return Promise.resolve(employee || null);
    }

    return apiClient.get<Employee>(`/employees/${id}`);
}

/**
 * Get employee by Name
 */
export async function getEmployeeByName(name: string): Promise<Employee | null> {
    if (isMockDataEnabled()) {
        const employee = MOCK_EMPLOYEES.find(e => e.fullName.toLowerCase() === name.toLowerCase());
        return Promise.resolve(employee || null);
    }

    const employees = await getEmployees();
    return employees.find(e => e.fullName.toLowerCase() === name.toLowerCase()) || null;
}

/**
 * Create a new employee
 */
export async function createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    if (isMockDataEnabled()) {
        const newEmployee: Employee = {
            ...employee,
            id: `EMP-${(MOCK_EMPLOYEES.length + 1).toString().padStart(3, '0')}`,
        };
        MOCK_EMPLOYEES.push(newEmployee);
        return Promise.resolve(newEmployee);
    }

    return apiClient.post<Employee>('/employees', employee);
}

/**
 * Update an existing employee
 */
export async function updateEmployee(id: string, employee: Partial<Employee>): Promise<Employee> {
    if (isMockDataEnabled()) {
        const index = MOCK_EMPLOYEES.findIndex(e => e.id === id);
        if (index === -1) {
            throw new Error(`Employee with ID ${id} not found`);
        }
        MOCK_EMPLOYEES[index] = { ...MOCK_EMPLOYEES[index], ...employee };
        return Promise.resolve(MOCK_EMPLOYEES[index]);
    }

    return apiClient.put<Employee>(`/employees/${id}`, employee);
}

/**
 * Delete an employee
 */
export async function deleteEmployee(id: string): Promise<{ success: boolean; message: string }> {
    if (isMockDataEnabled()) {
        const index = MOCK_EMPLOYEES.findIndex(e => e.id === id);
        if (index === -1) {
            throw new Error(`Employee with ID ${id} not found`);
        }
        MOCK_EMPLOYEES.splice(index, 1);
        return Promise.resolve({ success: true, message: 'Employee deleted successfully' });
    }

    return apiClient.delete<{ success: boolean; message: string }>(`/employees/${id}`);
}
