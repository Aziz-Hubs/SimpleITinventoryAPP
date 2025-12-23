"use client";

import * as React from "react";
import { Invoice } from "@/lib/types";
import { BaseDataTable } from "@/components/shared/base-data-table";
import { getColumns } from "./columns";
import { CreateInvoiceSheet } from "./create-invoice-sheet";
import { EditInvoiceSheet } from "./edit-invoice-sheet";
import { DeleteInvoiceDialog } from "./delete-invoice-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";

interface InvoicesTableProps {
  data: Invoice[];
}

export function InvoicesTable({ data }: InvoicesTableProps) {
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(
    null
  );
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const columns = React.useMemo(
    () =>
      getColumns({
        onEdit: (invoice) => {
          setSelectedInvoice(invoice);
          setIsEditOpen(true);
        },
        onDelete: (invoice) => {
          setSelectedInvoice(invoice);
          setIsDeleteOpen(true);
        },
      }),
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <>
      <BaseDataTable
        table={table}
        data={data}
        columns={columns}
        title="Invoices"
        description="Manage your finance invoices."
        searchKey="invoiceNumber"
        onRowClick={(invoice) => {
          setSelectedInvoice(invoice);
          setIsEditOpen(true);
        }}
        renderCustomActions={() => (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Invoice
          </Button>
        )}
      />

      <CreateInvoiceSheet open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <EditInvoiceSheet
        invoice={selectedInvoice}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <DeleteInvoiceDialog
        invoice={selectedInvoice}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}
