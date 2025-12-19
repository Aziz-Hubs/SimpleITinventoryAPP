/**
 * This file contains the main DataTable component for displaying and managing assets.
 * It follows a "smart component" pattern where it handles its own state for actions
 * like sorting, filtering, and triggering modal dialogs for asset management.
 *
 * Key Features:
 * - Data rendering using @tanstack/react-table
 * - Sortable and filterable columns
 * - Row selection and batch actions
 * - Integrated actions for viewing, assigning, and updating assets
 */

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  CircleUser,
  Edit,
  Eye,
  Laptop,
  Monitor,
  MoreHorizontal,
  Search,
  Settings2,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  UserPlus,
  Wifi,
  Printer,
  Headphones,
  Cable,
  Server,
  PcCase,
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ViewAssetSheet } from "@/components/features/inventory/view-asset-sheet";
import { AssignAssetDialog } from "@/components/features/inventory/assign-asset-dialog";
import { UpdateStateDialog } from "@/components/features/inventory/update-state-dialog";
import { QuickEditDialog } from "@/components/features/inventory/quick-edit-dialog";
import { BulkAssignDialog } from "@/components/features/inventory/bulk-assign-dialog";
import { BulkUpdateStateDialog } from "@/components/features/inventory/bulk-update-state-dialog";
import { BulkDeleteDialog } from "@/components/features/inventory/bulk-delete-dialog";
import { CopyButton } from "@/components/shared/copy-button";
import { AssetLegacy, assetSchema as schema } from "@/lib/types";

// ----------------------------------------------------------------------
// Types & Schemas
// ----------------------------------------------------------------------

type ActionType = "view" | "assign" | "update" | "edit";

// ----------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------

/**
 * Generates a 2-letter initial string from a name.
 * Handles special cases like "UNASSIGNED" or "IT Department".
 */
function getInitials(name: string) {
  if (name === "UNASSIGNED") return "UA";
  if (name === "IT Department") return "IT";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Returns the appropriate Lucide icon for a given asset category.
 */
const getAssetIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "laptop":
      return <Laptop className="h-4 w-4" />;
    case "monitor":
      return <Monitor className="h-4 w-4" />;
    case "tablet":
      return <Tablet className="h-4 w-4" />;
    case "smartphone":
    case "phone":
      return <Smartphone className="h-4 w-4" />;
    case "firewall":
    case "switch":
    case "network":
      return <Wifi className="h-4 w-4" />;
    case "printer":
      return <Printer className="h-4 w-4" />;
    case "headset":
    case "headphones":
      return <Headphones className="h-4 w-4" />;
    case "docking":
    case "dock":
      return <Cable className="h-4 w-4" />;
    case "server":
      return <Server className="h-4 w-4" />;
    case "desktop":
    case "pc":
      return <PcCase className="h-4 w-4" />;
    default:
      return <Settings2 className="h-4 w-4" />;
  }
};

// ----------------------------------------------------------------------
// Sub-Components
// ----------------------------------------------------------------------

/**
 * Action menu component for individual rows.
 * Extracted to keep the column definition clean.
 */
interface AssetActionsProps {
  asset: AssetLegacy;
  onAction: (action: ActionType, asset: AssetLegacy) => void;
}

function AssetActions({ asset, onAction }: AssetActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => onAction("view", asset)}>
          <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
          View Details
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onAction("assign", asset)}>
          <UserPlus className="mr-2 h-4 w-4 text-muted-foreground" />
          Assign / Transfer
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onAction("edit", asset)}>
          <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
          Quick Edit
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onAction("update", asset)}>
          <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" />
          Update Status
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive"
          onClick={() => onAction("update", asset)} // Reusing update for now
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Retire Asset
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

const MotionTableBody = motion(TableBody);
const MotionTableRow = motion(TableRow);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 20,
    },
  },
};

export function DataTable({ data: initialData }: { data: AssetLegacy[] }) {
  // --- State Managment ---
  const [tab, setTab] = React.useState("all");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Action Dialog States
  const [selectedAsset, setSelectedAsset] = React.useState<AssetLegacy | null>(
    null
  );
  const [activeAction, setActiveAction] = React.useState<ActionType | null>(
    null
  );
  const [activeBulkAction, setActiveBulkAction] = React.useState<
    "assign" | "update" | "delete" | null
  >(null);

  // Reset row selection and pagination when tab filters change
  React.useEffect(() => {
    setRowSelection({});
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [tab]);

  /**
   * Handler for triggering actions from the row menu.
   */
  const handleAction = React.useCallback(
    (action: ActionType, asset: AssetLegacy) => {
      setSelectedAsset(asset);
      setActiveAction(action);
    },
    []
  );

  // --- Filtering Logic ---

  const filteredData = React.useMemo(() => {
    switch (tab) {
      case "active":
        return initialData.filter(
          (item) =>
            item.Employee !== "UNASSIGNED" &&
            item.State !== "BROKEN" &&
            item.State !== "RETIRED"
        );
      case "draft":
        return initialData.filter(
          (item) =>
            item.Employee === "UNASSIGNED" &&
            item.State !== "BROKEN" &&
            item.State !== "RETIRED"
        );
      case "archived":
        return initialData.filter(
          (item) => item.State === "BROKEN" || item.State === "RETIRED"
        );
      default:
        return initialData;
    }
  }, [initialData, tab]);

  // --- Column Definitions ---

  const columns = React.useMemo<ColumnDef<AssetLegacy>[]>(
    () => [
      // Checkbox Column
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },

      // Asset Name Column
      {
        accessorKey: "Asset",
        accessorFn: (row) => `${row.Make} ${row.Model}`,
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            Asset
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const make = row.original.Make;
          const model = row.original.Model;
          const category = row.original.Category;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground">
                {getAssetIcon(category)}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{make}</span>
                <span className="text-xs text-muted-foreground">{model}</span>
              </div>
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const a = `${rowA.original.Make} ${rowA.original.Model}`;
          const b = `${rowB.original.Make} ${rowB.original.Model}`;
          return a.localeCompare(b);
        },
      },

      // Category Column
      {
        accessorKey: "Category",
        header: "Category",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-normal">
            {row.getValue("Category")}
          </Badge>
        ),
      },

      // Service Tag Column
      {
        accessorKey: "Service Tag",
        header: "Service Tag",
        cell: ({ row }) => {
          const tag = row.getValue("Service Tag") as string;
          return (
            <div className="flex items-center gap-2 group">
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-foreground">
                {tag}
              </code>
              <CopyButton
                value={tag}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          );
        },
      },

      // status Column
      {
        accessorKey: "State",
        header: "Status",
        cell: ({ row }) => {
          const state = row.getValue("State") as string;
          let className = "border-transparent";
          let icon = null;

          if (state === "GOOD") {
            className =
              "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20";
            icon = <CheckCircle2 className="mr-1 h-3 w-3" />;
          } else if (state === "NEW") {
            className =
              "bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20";
            icon = <Sparkles className="mr-1 h-3 w-3" />;
          } else if (state === "BROKEN") {
            className =
              "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20";
            icon = <AlertTriangle className="mr-1 h-3 w-3" />;
          } else {
            className = "bg-muted text-muted-foreground";
          }

          return (
            <Badge variant="outline" className={className}>
              {icon}
              {state}
            </Badge>
          );
        },
      },

      // Employee / Assignee Column
      {
        accessorKey: "Employee",
        header: "Assignee",
        cell: ({ row }) => {
          const employee = row.getValue("Employee") as string;

          if (employee === "UNASSIGNED") {
            return (
              <div className="flex items-center gap-2 text-muted-foreground/60 italic">
                <CircleUser className="h-8 w-8 p-1.5 border rounded-full border-dashed" />
                <span>Unassigned</span>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${employee}`}
                  alt={employee}
                />
                <AvatarFallback>{getInitials(employee)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{employee}</span>
            </div>
          );
        },
      },

      // Location Column
      {
        accessorKey: "Location",
        header: "Location",
        cell: ({ row }) => (
          <div className="flex items-center text-sm text-muted-foreground">
            {row.getValue("Location")}
          </div>
        ),
      },

      // Actions Column
      {
        id: "actions",
        cell: ({ row }) => (
          <AssetActions asset={row.original} onAction={handleAction} />
        ),
      },
    ],
    [handleAction]
  );

  // --- Table Instance ---

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getRowId: (row) => row["Service Tag"], // Use Service Tag as a stable unique ID
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  // --- Render ---

  return (
    <div className="space-y-4">
      {/* Table Toolbar & Tabs */}
      <Tabs value={tab} className="w-full" onValueChange={setTab}>
        <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between px-4 lg:px-6">
          <TabsList>
            <TabsTrigger value="all">All Assets</TabsTrigger>
            <TabsTrigger value="active">Assigned</TabsTrigger>
            <TabsTrigger value="draft">Unassigned</TabsTrigger>
            <TabsTrigger value="archived" className="hidden md:flex">
              Retired
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Service Tag..."
                value={
                  (table
                    .getColumn("Service Tag")
                    ?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table
                    .getColumn("Service Tag")
                    ?.setFilterValue(event.target.value)
                }
                className="h-9 w-[200px] pl-8 lg:w-[300px]"
              />
            </div>

            {/* Bulk Actions Menu */}
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    Bulk Actions (
                    {table.getFilteredSelectedRowModel().rows.length})
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Batch Operations</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setActiveBulkAction("assign")}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Bulk Assign
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setActiveBulkAction("update")}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Bulk Update Status
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setActiveBulkAction("delete")}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Column Visibility Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 ml-auto">
                  <Settings2 className="mr-2 h-4 w-4" />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
        </div>

        {/* Filtered Content */}
        <div className="mx-4 lg:mx-6">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
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
            <AnimatePresence mode="wait">
              <MotionTableBody
                key={tab + pagination.pageIndex}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <MotionTableRow
                      key={row.id}
                      variants={itemVariants}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(
                        "group transition-colors",
                        row.original.Employee === "INFRASTRUCTURE" &&
                          "bg-zinc-100/50 dark:bg-zinc-900/50 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-2.5">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </MotionTableRow>
                  ))
                ) : (
                  <MotionTableRow variants={itemVariants}>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No assets found.
                    </TableCell>
                  </MotionTableRow>
                )}
              </MotionTableBody>
            </AnimatePresence>
          </Table>
        </div>

        {/* Pagination & Selection Stats */}
        <div className="flex items-center justify-between px-4 lg:px-6 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </Tabs>

      {/* Action Dialogs */}
      <ViewAssetSheet
        asset={selectedAsset}
        open={activeAction === "view"}
        onOpenChange={(open) => !open && setActiveAction(null)}
      />

      <AssignAssetDialog
        asset={selectedAsset}
        open={activeAction === "assign"}
        onOpenChange={(open) => !open && setActiveAction(null)}
      />

      <UpdateStateDialog
        asset={selectedAsset}
        open={activeAction === "update"}
        onOpenChange={(open) => !open && setActiveAction(null)}
      />

      <QuickEditDialog
        asset={selectedAsset}
        open={activeAction === "edit"}
        onOpenChange={(open) => !open && setActiveAction(null)}
      />

      <BulkAssignDialog
        assets={table
          .getFilteredSelectedRowModel()
          .rows.map((row) => row.original)}
        open={activeBulkAction === "assign"}
        onOpenChange={(open) => !open && setActiveBulkAction(null)}
      />

      <BulkUpdateStateDialog
        assets={table
          .getFilteredSelectedRowModel()
          .rows.map((row) => row.original)}
        open={activeBulkAction === "update"}
        onOpenChange={(open) => !open && setActiveBulkAction(null)}
      />

      <BulkDeleteDialog
        assets={table
          .getFilteredSelectedRowModel()
          .rows.map((row) => row.original)}
        open={activeBulkAction === "delete"}
        onOpenChange={(open) => !open && setActiveBulkAction(null)}
      />
    </div>
  );
}
