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
  Package,
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
  LayoutGrid,
  UserCheck,
  Archive,
  Layers,
  Filter,
  Shield,
  MapPin,
  Settings2,
} from "lucide-react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ViewAssetSheet } from "@/components/features/inventory/view-asset-sheet";
import { AssignAssetDialog } from "@/components/features/inventory/assign-asset-dialog";
import { UpdateStateDialog } from "@/components/features/inventory/update-state-dialog";
import { QuickEditDialog } from "@/components/features/inventory/quick-edit-dialog";
import { BulkAssignDialog } from "@/components/features/inventory/bulk-assign-dialog";
import { BulkUpdateStateDialog } from "@/components/features/inventory/bulk-update-state-dialog";
import { BulkDeleteDialog } from "@/components/features/inventory/bulk-delete-dialog";
import { CopyButton } from "@/components/shared/copy-button";
import { BaseDataTable } from "@/components/shared/base-data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { AssetLegacy } from "@/lib/types";

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

  // Column Schema Definition
  const CATEGORY_COLUMN_SCHEMA: Record<string, string[]> = React.useMemo(() => ({
    Laptop: ["Warranty Expiry", "CPU", "RAM", "Storage", "USB-A Ports", "USB-C Ports"],
    Desktop: ["Warranty Expiry", "CPU", "RAM", "Storage", "Dedicated GPU", "USB-A Ports", "USB-C Ports"],
    Monitor: ["Dimensions", "Resolution", "Refresh Rate"],
    Docking: ["USB-A Ports", "USB-C Ports"],
    Headset: [], // Only standard columns
    Smartphone: ["Storage"],
    Tablet: ["Storage"],
    Server: ["Warranty Expiry", "CPU", "RAM", "Storage"],
    Printer: [],
    // Default fallback for others
  }), []);

  // Auto-hide columns based on Category Schema
  React.useEffect(() => {
    if (!initialData.length) return;

    // 1. Detect if we are viewing a Single Category or Mixed
    const uniqueCategories = Array.from(new Set(initialData.map((item) => item.Category)));
    const isSingleCategory = uniqueCategories.length === 1;
    const currentCategory = isSingleCategory ? uniqueCategories[0] : null;

    // 2. Define all optional/spec columns that should be toggled
    const allSpecColumns = [
      "Warranty Expiry",
      "CPU",
      "RAM",
      "Storage",
      "Dedicated GPU",
      "USB-A Ports",
      "USB-C Ports",
      "Dimensions",
      "Resolution",
      "Refresh Rate",
    ];

    // 3. Determine which columns should be visible
    let columnsToShow: string[] = [];

    if (isSingleCategory && currentCategory) {
      // If we have a schema for this category, use it. Otherwise, defaults (empty).
      columnsToShow = CATEGORY_COLUMN_SCHEMA[currentCategory] || [];

      // Special case: "Warranty Expiry" is generally useful, maybe keep it unless explicitly excluded? 
      // User asked for "schema/collection", so we'll stick strictly to the schema.
    } else {
      // Mixed / All Categories -> Hide all extended specs (User request: "return old columns")
      columnsToShow = [];
    }

    // 4. Update Visibility State
    setColumnVisibility((prev) => {
      const next = { ...prev };
      let changed = false;

      allSpecColumns.forEach((col) => {
        const shouldShow = columnsToShow.includes(col);
        if (next[col] !== shouldShow) {
          next[col] = shouldShow;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [initialData, CATEGORY_COLUMN_SCHEMA]);

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
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },

      // Asset Name Column
      {
        accessorKey: "Asset",
        accessorFn: (row) => `${row.Make} ${row.Model}`,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Asset" />
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
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Category" />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-normal">
            {row.getValue("Category")}
          </Badge>
        ),
      },

      // Service Tag Column
      {
        accessorKey: "Service Tag",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Service Tag" />
        ),
        cell: ({ row }) => {
          const tag = row.getValue("Service Tag") as string;
          return (
            <div className="flex items-center gap-2 group">
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-foreground">
                {tag}
              </code>
              <div onClick={(e) => e.stopPropagation()}>
                <CopyButton
                  value={tag}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          );
        },
      },

      // status Column
      {
        accessorKey: "State",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
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
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Assignee" />
        ),
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
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Location" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center text-sm text-muted-foreground">
            {row.getValue("Location")}
          </div>
        ),
      },

      // --- Dynamic / Optional Columns ---

      {
        accessorKey: "Warranty Expiry",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Warranty" />
        ),
        cell: ({ row }) => row.getValue("Warranty Expiry"),
      },
      {
        accessorKey: "CPU",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="CPU" />
        ),
        cell: ({ row }) => row.getValue("CPU"),
      },
      {
        accessorKey: "RAM",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="RAM" />
        ),
        cell: ({ row }) => row.getValue("RAM"),
      },
      {
        accessorKey: "Storage",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Storage" />
        ),
        cell: ({ row }) => row.getValue("Storage"),
      },
      {
        accessorKey: "Dedicated GPU",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="GPU" />
        ),
        cell: ({ row }) => row.getValue("Dedicated GPU"),
      },
      {
        accessorKey: "USB-A Ports",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="USB-A" />
        ),
        cell: ({ row }) => row.getValue("USB-A Ports"),
      },
      {
        accessorKey: "USB-C Ports",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="USB-C" />
        ),
        cell: ({ row }) => row.getValue("USB-C Ports"),
      },
      {
        accessorKey: "Dimensions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Dims" />
        ),
        cell: ({ row }) => row.getValue("Dimensions"),
      },
      {
        accessorKey: "Resolution",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Res" />
        ),
        cell: ({ row }) => row.getValue("Resolution"),
      },
      {
        accessorKey: "Refresh Rate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Hz" />
        ),
        cell: ({ row }) => row.getValue("Refresh Rate"),
      },

      // Actions Column
      {
        id: "actions",
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <AssetActions asset={row.original} onAction={handleAction} />
          </div>
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
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
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
      <Tabs value={tab} className="w-full" onValueChange={setTab}>
        <BaseDataTable
          table={table}
          data={filteredData}
          columns={columns}
          searchKey="Service Tag"
          renderToolbarLeft={() => (
            <TabsList className="mr-4">
              <TabsTrigger value="all">
                <LayoutGrid className="mr-2 h-4 w-4" />
                All Assets
              </TabsTrigger>
              <TabsTrigger value="active">
                <UserCheck className="mr-2 h-4 w-4" />
                Assigned
              </TabsTrigger>
              <TabsTrigger value="draft">
                <UserPlus className="mr-2 h-4 w-4" />
                Unassigned
              </TabsTrigger>
              <TabsTrigger value="archived" className="hidden md:flex">
                <Archive className="mr-2 h-4 w-4" />
                Retired
              </TabsTrigger>
            </TabsList>
          )}
          renderCustomActions={(table) => (
            <>
              {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <Layers className="mr-2 h-4 w-4" />
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
            </>
          )}
        />
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

      {/* Bulk Action Dialogs */}
      <BulkAssignDialog
        assets={table
          .getFilteredSelectedRowModel()
          .rows.map((row) => row.original)}
        open={activeBulkAction === "assign"}
        onOpenChange={(open) => !open && setActiveBulkAction(null)}
        onSuccess={() => setActiveBulkAction(null)}
      />
      <BulkUpdateStateDialog
        assets={table
          .getFilteredSelectedRowModel()
          .rows.map((row) => row.original)}
        open={activeBulkAction === "update"}
        onOpenChange={(open) => !open && setActiveBulkAction(null)}
        onSuccess={() => setActiveBulkAction(null)}
      />
      <BulkDeleteDialog
        assets={table
          .getFilteredSelectedRowModel()
          .rows.map((row) => row.original)}
        open={activeBulkAction === "delete"}
        onOpenChange={(open) => !open && setActiveBulkAction(null)}
        onSuccess={() => {
          setActiveBulkAction(null);
          setRowSelection({});
        }}
      />
    </div>
  );
}
