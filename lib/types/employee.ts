/**
 * @file employee.ts
 * @description Defines TypeScript interfaces and types for employee management and filtering.
 * @path /lib/types/employee.ts
 */

/**
 * Represents an employee within the organization.
 */
export interface Employee {
  /** Unique identifier for the employee, typically a UUID or system-generated string. */
  id: string;
  /** Full name of the employee. */
  fullName: string;
  /** Primary contact email address. */
  email: string;
  /** Department where the employee is currently assigned. */
  department: string;
  /** Job title or role within the company. */
  position: string;
}

/** Type for creating a new employee; excludes the ID which is generated server-side. */
export type EmployeeCreate = Omit<Employee, 'id'>;

/** Type for updating existing employees; all fields except ID are optional. */
export type EmployeeUpdate = Partial<EmployeeCreate>;

/**
 * Parameters for filtering and paginating lists of employees.
 */
export interface EmployeeFilters {
  /** Current page number for pagination (starting from 1). */
  page?: number;
  /** Number of items to return per page. */
  pageSize?: number;
  /** Filter employees by department name. */
  department?: string;
  /** Search query to match against name, email, or position. */
  search?: string;
}

