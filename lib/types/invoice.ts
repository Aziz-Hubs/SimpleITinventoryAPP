import { z } from "zod";
import { auditableEntitySchema } from "./common";

export const invoiceSchema = auditableEntitySchema.extend({
  id: z.number(),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  vendor: z.string().min(1, "Vendor is required"),
  purchaseDate: z.string().datetime(),
});

export type Invoice = z.infer<typeof invoiceSchema>;
export const invoiceCreateSchema = invoiceSchema.omit({ id: true, rowVersion: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, tenantId: true });
export type InvoiceCreate = z.infer<typeof invoiceCreateSchema>;
export type InvoiceUpdate = Partial<InvoiceCreate>;
