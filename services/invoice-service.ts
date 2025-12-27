/**
 * @file invoice-service.ts
 * @description Service layer for managing finance invoices using Supabase.
 * @path /services/invoice-service.ts
 */

import { supabase } from '@/lib/supabase';
import { Invoice, InvoiceCreate, InvoiceUpdate } from '@/lib/types';

// Helper to map DB row to Invoice type
function mapInvoiceFromDB(row: any): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    vendor: row.vendor,
    purchaseDate: row.purchase_date,
    tenantId: row.tenant_id,
    createdAt: row.created_at,
    createdBy: row.created_by,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
    rowVersion: row.row_version,
  };
}

// Helper to map InvoiceCreate to DB row
function mapInvoiceToDB(invoice: InvoiceCreate | InvoiceUpdate) {
  const dbRow: any = {
    invoice_number: (invoice as any).invoiceNumber,
    vendor: (invoice as any).vendor,
    purchase_date: (invoice as any).purchaseDate,
  };

  // Only include defined fields
  Object.keys(dbRow).forEach(key => dbRow[key] === undefined && delete dbRow[key]);
  return dbRow;
}

/**
 * Retrieves a list of all invoices.
 *
 * @returns {Promise<Invoice[]>}
 */
export async function getInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('purchase_date', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(mapInvoiceFromDB);
}

/**
 * Fetches a single invoice by its unique ID.
 *
 * @param id - The invoice ID.
 * @returns {Promise<Invoice>}
 */
export async function getInvoiceById(id: string): Promise<Invoice> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapInvoiceFromDB(data);
}

/**
 * Creates a new invoice.
 *
 * @param data - The invoice creation data.
 * @returns {Promise<Invoice>}
 */
export async function createInvoice(data: InvoiceCreate): Promise<Invoice> {
  const dbRow = mapInvoiceToDB(data);
  dbRow.tenant_id = '00000000-0000-0000-0000-000000000000';
  dbRow.created_by = 'system';
  dbRow.updated_by = 'system';

  const { data: created, error } = await supabase
    .from('invoices')
    .insert(dbRow)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapInvoiceFromDB(created);
}

/**
 * Updates an existing invoice.
 *
 * @param id - The ID of the invoice to update.
 * @param updates - The updates to apply.
 * @returns {Promise<Invoice>}
 */
export async function updateInvoice(id: string, updates: InvoiceUpdate): Promise<Invoice> {
  const dbRow = mapInvoiceToDB(updates);
  dbRow.updated_at = new Date().toISOString();
  dbRow.updated_by = 'system';

  const { data, error } = await supabase
    .from('invoices')
    .update(dbRow)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapInvoiceFromDB(data);
}

/**
 * Deletes an invoice.
 *
 * @param id - The ID of the invoice to delete.
 * @returns {Promise<void>}
 */
export async function deleteInvoice(id: string): Promise<void> {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Generates and downloads a CSV export of the current invoices.
 * 
 * @returns {Promise<Blob>}
 */
export async function exportInvoicesToCSV(): Promise<Blob> {
  // Reuse getInvoices just like other exports. For large data consider pagination or stream.
  const invoices = await getInvoices();

  if (invoices.length === 0) {
    return new Blob([''], { type: 'text/csv' });
  }

  const headers = ['ID', 'Invoice Number', 'Vendor', 'Purchase Date', 'Line Items Count'];
  
  // Note: getInvoices currently doesn't join line items, so count might be missing or require extra fetch.
  // For now let's export basic invoice data.
  
  const csvContent = [
    headers.join(','),
    ...invoices.map(inv => [
      inv.id,
      `"${inv.invoiceNumber}"`,
      `"${inv.vendor}"`,
      inv.purchaseDate,
      // inv.lineItems?.length || 0 // If we fetched them
      ''
    ].join(','))
  ].join('\n');

  return new Blob([csvContent], { type: 'text/csv' });
}
