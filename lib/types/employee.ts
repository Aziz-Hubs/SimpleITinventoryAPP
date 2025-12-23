import { z } from "zod";
import { auditableEntitySchema } from "./common";

export const employeeSchema = auditableEntitySchema.extend({
  id: z.string().min(1, "Employee ID is required"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email(),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  isActive: z.boolean().default(true),
});

export type Employee = z.infer<typeof employeeSchema>;
export type EmployeeCreate = z.infer<typeof employeeSchema.omit({ id: true, rowVersion: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true })>;
export type EmployeeUpdate = Partial<EmployeeCreate>;

export interface EmployeeFilters {
  page?: number;
  pageSize?: number;
  department?: string;
  search?: string;
  isActive?: boolean;
}


