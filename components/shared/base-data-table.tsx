/**
 * @file base-data-table.tsx
 * @description A highly reusable and stylistically consistent wrapper around TanStack Table.
 * Provides a standardized Glassmorphism UI, integrated URL-synced search, pagination UI,
 * and flexible "slots" for custom toolbar actions.
 * @path /components/shared/base-data-table.tsx
 */

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
  ChevronsLeft,
  ChevronsRight,
  Search,
  Settings2,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useTableParams } from "@/hooks/use-table-params";

/**
 * Props for the BaseDataTable component.
 * Supports both internal table state management and external (controlled) table instances.
 */
interface BaseDataTableProps<TData, TValue> {
  /** The standard ColumnDef array from TanStack Table. */
  columns: ColumnDef<TData, TValue>[];
  /** The array of data items to display. */
  data: TData[];
  /** The data key to use for the primary search input. */
  searchKey?: string;
  /** Custom placeholder for the search input. */
  searchPlaceholder?: string;
  /** Optional callback for bulk deletion action. */
  onDeleteSelected?: (selectedRows: TData[]) => void;
  /** Slot for adding custom buttons to the right side of the toolbar. */
  renderCustomActions?: (table: TableInstance<TData>) => React.ReactNode;
  /** Slot for adding custom widgets (like Tabs) to the left side of the toolbar. */
  renderToolbarLeft?: (table: TableInstance<TData>) => React.ReactNode;
  /** An optional external table instance (useful for multi-component orchestration). */
  table?: TableInstance<TData>;
  /** Event handler for row clicks (non-interactive areas). */
  onRowClick?: (row: TData) => void;
  /** Primary title of the data section. */
  title?: React.ReactNode;
  /** Supporting text or summary. */
  description?: React.ReactNode;
}

/**
 * A headless-ready UI wrapper for TanStack Table rows and headers.
 */
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
  // Access global table state from URL
  const { params, setParams } = useTableParams();

  // Local state for table if no external instance is provided
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
    // Sync pagination with URL params
    manualPagination: true,
    pageCount: Math.ceil(data.length / params.pageSize),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: (params.page || 1) - 1,
        pageSize: params.pageSize || 10,
      },
    },
  });

  // Use the provided table instance if available, otherwise fall back to internal
  const table = externalTable || internalTable;

  const hasSelected = Object.keys(rowSelection).length > 0;

  /**
   * Updates global URL state for searching.
   * Triggers a jump back to page 1 to prevent empty results on high page indices.
   */
  const handleSearchChange = (value: string) => {
    setParams({ search: value, page: 1 });
  };

  return (
    <Card className="flex flex-col overflow-hidden border border-primary/5 shadow-2xl bg-background">
      <CardHeader className="flex flex-col gap-8 px-8 py-8 border-b">
        {/* Top Row: Title, Description and Primary Actions */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {(title || description) && (
            <div className="flex flex-col gap-2 text-left">
              {title && (
                <CardTitle className="text-3xl font-extrabold tracking-tighter text-foreground lg:text-4xl">
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription className="text-base text-muted-foreground/80 max-w-2xl leading-relaxed">
                  {description}
                </CardDescription>
              )}
            </div>
          )}
        </div>

        {/* Bottom Row: Table Contextual Controls (Search, Tabs, Filter) */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pt-6 border-t border-primary/5">
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
            {searchKey && (
              <div className="relative group w-full sm:w-[280px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder={searchPlaceholder}
                  value={params.search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  className="h-10 w-full pl-10 bg-background border-input hover:border-primary/30 focus-visible:ring-1 focus-visible:ring-primary/40 transition-all shadow-xs"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Custom Left Widgets (e.g. Navigation Tabs) */}
              {renderToolbarLeft && renderToolbarLeft(table)}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-4 min-w-[100px] border-border/50 bg-background"
                >
                  <Settings2 className="mr-2 h-4 w-4" />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
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

            {/* Custom Right Widgets (e.g. Export Buttons) */}
            {renderCustomActions && renderCustomActions(table)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 px-4">
        <Table>
          <TableHeader className="bg-muted/50">
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
                    // Critical UX Check: Don't trigger row click if clicking on buttons or checkboxes
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
                      onClick={() =>
                        setParams({ search: "", category: "all", page: 1 })
                      }
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

      {/* Standardized Pagination Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t p-4 px-8">
        <div className="flex items-center gap-4">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={String(params.pageSize)}
              onValueChange={(value) => {
                const newSize = parseInt(value, 10);
                setParams({ pageSize: newSize, page: 1 });
              }}
            >
              <SelectTrigger className="h-8 w-[70px]" size="sm">
                <SelectValue placeholder={params.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 25, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
                <SelectItem value="9999">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row Count */}
          <div className="text-sm text-muted-foreground font-medium">
            Showing{" "}
            <span className="text-foreground font-bold">
              {table.getFilteredRowModel().rows.length}
            </span>{" "}
            rows
            {hasSelected && (
              <>
                {" "}
                ·{" "}
                <span className="text-primary font-bold">
                  {Object.keys(rowSelection).length} selected
                </span>
              </>
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setParams({ page: 1 })}
            disabled={params.page <= 1}
            className="h-8 w-8 bg-card border-border/50"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setParams({ page: Math.max(1, params.page - 1) })}
            disabled={params.page <= 1}
            className="h-8 w-8 bg-card border-border/50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 mx-2">
            <span className="text-sm font-medium">Page</span>
            <span className="text-sm font-bold bg-muted px-2 py-0.5 rounded text-primary">
              {params.page}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              of {table.getPageCount() || 1}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setParams({ page: params.page + 1 })}
            disabled={params.page >= (table.getPageCount() || 1)}
            className="h-8 w-8 bg-card border-border/50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setParams({ page: table.getPageCount() || 1 })}
            disabled={params.page >= (table.getPageCount() || 1)}
            className="h-8 w-8 bg-card border-border/50"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
