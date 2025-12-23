/**
 * @file invoice-service.ts
 * @description Service layer for managing finance invoices.
 * @path /services/invoice-service.ts
 */

import { isMockDataEnabled, apiClient } from '@/lib/api-client';
import { Invoice, InvoiceCreate, InvoiceUpdate } from '@/lib/types';
import invoiceData from '@/data/invoices.json';
import { MockStorage, STORAGE_KEYS } from '@/lib/mock-storage';

// Define the shape of the raw JSON data
interface RawInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  vendor: string;
  assetIds: string[];
}

/**
 * Accesses or initializes the local storage-based mock invoices.
 * Adapts raw JSON data to the strict Invoice type.
 *
 * @returns {Invoice[]} The current set of invoices from mock storage.
 */
function getMockInvoices(): Invoice[] {
  // Transform raw data to valid Invoice objects
  const initialInvoices: Invoice[] = (invoiceData as RawInvoice[]).map((raw) => ({
    id: parseInt(raw.id, 10),
    invoiceNumber: raw.invoiceNumber,
    vendor: raw.vendor,
    purchaseDate: new Date(raw.invoiceDate).toISOString(), // Map invoiceDate to purchaseDate
    // Add missing auditable fields
    tenantId: '00000000-0000-0000-0000-000000000000',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    updatedBy: 'system',
    rowVersion: '1',
  }));

  return MockStorage.initialize(STORAGE_KEYS.INVOICES, initialInvoices);
}

/**
 * Retrieves a list of all invoices.
 *
 * @returns {Promise<Invoice[]>}
 */
export async function getInvoices(): Promise<Invoice[]> {
  if (isMockDataEnabled()) {
    return Promise.resolve(getMockInvoices());
  }

  return apiClient.get<Invoice[]>('/invoices');
}

/**
 * Fetches a single invoice by its unique ID.
 *
 * @param id - The invoice ID.
 * @throws {Error} If in mock mode and the ID does not exist.
 * @returns {Promise<Invoice>}
 */
export async function getInvoiceById(id: string): Promise<Invoice> {
  if (isMockDataEnabled()) {
    const idNum = parseInt(id, 10);
    const invoice = getMockInvoices().find((i) => i.id === idNum);
    if (!invoice) {
      throw new Error(`Invoice with ID ${id} not found`);
    }
    return Promise.resolve(invoice);
  }

  return apiClient.get<Invoice>(`/invoices/${id}`);
}

/**
 * Creates a new invoice.
 *
 * @param data - The invoice creation data.
 * @returns {Promise<Invoice>}
 */
export async function createInvoice(data: InvoiceCreate): Promise<Invoice> {
  if (isMockDataEnabled()) {
    const newInvoice: Invoice = {
      ...data,
      id: Math.floor(Math.random() * 100000),
      tenantId: '00000000-0000-0000-0000-000000000000',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      updatedBy: 'system',
      rowVersion: '1'
    };
    const invoices = getMockInvoices();
    MockStorage.save(STORAGE_KEYS.INVOICES, [...invoices, newInvoice]);
    return Promise.resolve(newInvoice);
  }

  return apiClient.post<Invoice>('/invoices', data);
}

/**
 * Updates an existing invoice.
 *
 * @param id - The ID of the invoice to update.
 * @param updates - The updates to apply.
 * @returns {Promise<Invoice>}
 */
export async function updateInvoice(id: string, updates: InvoiceUpdate): Promise<Invoice> {
  if (isMockDataEnabled()) {
    const invoices = getMockInvoices();
    const idNum = parseInt(id, 10);
    const index = invoices.findIndex((i) => i.id === idNum);
    
    if (index === -1) {
      throw new Error(`Invoice with ID ${id} not found`);
    }

    const updatedInvoice = { ...invoices[index], ...updates, updatedAt: new Date().toISOString() };
    invoices[index] = updatedInvoice;
    MockStorage.save(STORAGE_KEYS.INVOICES, invoices);
    return Promise.resolve(updatedInvoice);
  }

  return apiClient.put<Invoice>(`/invoices/${id}`, updates);
}

/**
 * Deletes an invoice.
 *
 * @param id - The ID of the invoice to delete.
 * @returns {Promise<void>}
 */
export async function deleteInvoice(id: string): Promise<void> {
  if (isMockDataEnabled()) {
    const invoices = getMockInvoices();
    const idNum = parseInt(id, 10);
    const filteredInvoices = invoices.filter((i) => i.id !== idNum);
    MockStorage.save(STORAGE_KEYS.INVOICES, filteredInvoices);
    return Promise.resolve();
  }

  return apiClient.delete(`/invoices/${id}`);
}
