import { z } from "zod";
import { auditableEntitySchema } from "./common";

export const invoiceLineItemSchema = auditableEntitySchema.extend({
  id: z.number(),
  invoiceId: z.number(),
  modelId: z.number(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().int().positive(),
  unitPrice: z.number(),
  taxAmount: z.number(),
});

export type InvoiceLineItem = z.infer<typeof invoiceLineItemSchema>;
export type InvoiceLineItemCreate = z.infer<typeof invoiceLineItemSchema.omit({ id: true, rowVersion: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true })>;
export type InvoiceLineItemUpdate = Partial<InvoiceLineItemCreate>;
