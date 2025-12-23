/**
 * @file invoice-service.ts
 * @description Service layer for managing finance invoices.
 * @path /services/invoice-service.ts
 */

import { isMockDataEnabled, apiClient } from '@/lib/api-client';
import { Invoice } from '@/lib/types';
import invoiceData from '@/data/invoices.json';
import { MockStorage, STORAGE_KEYS } from '@/lib/mock-storage';

/**
 * Accesses or initializes the local storage-based mock invoices.
 *
 * @returns {Invoice[]} The current set of invoices from mock storage.
 */
function getMockInvoices(): Invoice[] {
  return MockStorage.initialize(STORAGE_KEYS.INVOICES, invoiceData as Invoice[]);
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
    const invoice = getMockInvoices().find((i) => i.id === id);
    if (!invoice) {
      throw new Error(`Invoice with ID ${id} not found`);
    }
    return Promise.resolve(invoice);
  }

  return apiClient.get<Invoice>(`/invoices/${id}`);
}
