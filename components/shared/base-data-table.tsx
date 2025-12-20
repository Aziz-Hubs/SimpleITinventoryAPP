"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Table as TableInstance,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Settings2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BaseDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  onDeleteSelected?: (selectedRows: TData[]) => void;
  renderCustomActions?: (table: TableInstance<TData>) => React.ReactNode;
  renderToolbarLeft?: (table: TableInstance<TData>) => React.ReactNode;
  table?: TableInstance<TData>;
  onRowClick?: (row: TData) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
}

export function BaseDataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Filter...",
  onDeleteSelected,
  renderCustomActions,
  renderToolbarLeft,
  table: externalTable,
  onRowClick,
  title,
  description,
}: BaseDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const internalTable = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const table = externalTable || internalTable;

  const hasSelected = Object.keys(rowSelection).length > 0;

  return (
    <Card className="flex flex-col overflow-hidden border border-primary/5 shadow-2xl bg-background/50 backdrop-blur-xs">
      <CardHeader className="flex flex-col gap-6 space-y-0 border-b bg-muted/20 px-8 py-7 md:flex-row md:items-center md:justify-between">
        {(title || description) && (
          <div className="flex flex-col gap-1.5">
            {title && (
              <CardTitle className="text-xl font-bold tracking-tight">
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-sm text-muted-foreground/80">
                {description}
              </CardDescription>
            )}
          </div>
        )}

        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center md:justify-end">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {searchKey && (
              <div className="relative group w-full sm:w-auto">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder={searchPlaceholder}
                  value={
                    (table.getColumn(searchKey)?.getFilterValue() as string) ??
                    ""
                  }
                  onChange={(event) =>
                    table
                      .getColumn(searchKey)
                      ?.setFilterValue(event.target.value)
                  }
                  className="h-10 w-full sm:w-[250px] pl-10 bg-background border-input focus-visible:ring-1 focus-visible:ring-primary/50 transition-all shadow-sm"
                />
              </div>
            )}

            {renderToolbarLeft && renderToolbarLeft(table)}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-3 w-full sm:w-auto ml-auto sm:ml-0"
                >
                  <Settings2 className="mr-2 h-4 w-4" />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <AnimatePresence>
              {hasSelected && onDeleteSelected && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const selectedRows = table
                        .getFilteredSelectedRowModel()
                        .rows.map((r) => r.original);
                      onDeleteSelected(selectedRows);
                    }}
                    className="h-10 px-4 shadow-lg shadow-destructive/20"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({Object.keys(rowSelection).length})
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {renderCustomActions && renderCustomActions(table)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 px-4">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent px-2 border-b"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-12 py-0 px-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={(e) => {
                    // Don't trigger row click if clicking on interactive elements
                    const target = e.target as HTMLElement;
                    if (
                      target.closest("button") ||
                      target.closest("input") ||
                      target.closest("a") ||
                      target.closest('[role="checkbox"]')
                    ) {
                      return;
                    }
                    onRowClick?.(row.original);
                  }}
                  className={cn(
                    "group transition-colors border-b border-border/30 hover:bg-muted/30",
                    row.getIsSelected() && "bg-primary/5 hover:bg-primary/10",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-64 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-muted rounded-full">
                      {/* Default empty state icon */}
                      <Search className="h-10 w-10 opacity-20" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">
                        No results found
                      </p>
                      <p className="text-sm">
                        Try adjusting your filters or search terms.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.resetColumnFilters()}
                    >
                      Clear all filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t p-4">
        <div className="text-sm text-muted-foreground font-medium">
          Showing{" "}
          <span className="text-foreground">
            {table.getFilteredRowModel().rows.length}
          </span>{" "}
          rows
          {hasSelected && (
            <>
              {" "}
              ·{" "}
              <span className="text-primary">
                {Object.keys(rowSelection).length} selected
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-9 w-9 bg-card border-border/50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 mx-2">
            {/* Pagination visual */}
            <span className="text-sm font-medium">Page</span>
            <span className="text-sm font-bold bg-muted px-2 py-0.5 rounded text-primary">
              {table.getState().pagination.pageIndex + 1}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              of {table.getPageCount()}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-9 w-9 bg-card border-border/50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
