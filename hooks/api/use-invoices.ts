/**
 * @file use-invoices.ts
 * @description React Query hooks for fetching invoice data.
 * @path /hooks/api/use-invoices.ts
 */

import { useQuery } from '@tanstack/react-query';
import { getInvoices, getInvoiceById } from '@/services/invoice-service';

const INVOICE_QUERY_KEY = 'invoices';

/**
 * Hook to fetch a list of all invoices.
 * @returns {QueryResult<Invoice[], Error>}
 */
export function useInvoices() {
  return useQuery({
    queryKey: [INVOICE_QUERY_KEY],
    queryFn: getInvoices,
  });
}

/**
 * Hook to fetch a single invoice by its ID.
 * @param {string} id - The ID of the invoice to fetch.
 * @returns {QueryResult<Invoice, Error>}
 */
export function useInvoiceById(id: string) {
  return useQuery({
    queryKey: [INVOICE_QUERY_KEY, id],
    queryFn: () => getInvoiceById(id),
    enabled: !!id, // Only run the query if an ID is provided
  });
}
