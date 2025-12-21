/**
 * @file data-table.tsx
 * @description The primary data visualization and orchestration component for the IT inventory.
 * Implements a "Smart Component" pattern that manages complex state including view tabs (Active/Retired),
 * category-aware dynamic column visibility, and a suite of management dialogs.
 * @path /components/shared/data-table.tsx
 *
 * @example
 * <DataTable
 *   data={assets}
 *   title="Inventory Master"
 *   description="Manage your global hardware fleet"
 * />
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
import { Asset } from "@/lib/types";
import { useTableParams } from "@/hooks/use-table-params";

// ----------------------------------------------------------------------
// Types & Schemas
// ----------------------------------------------------------------------

/** Actions that can be performed on a single asset row. @private */
type ActionType = "view" | "assign" | "update" | "edit";

// ----------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------

/**
 * Extracts first letters of words to create a user avatar fallback.
 *
 * @param name - The full string to process.
 * @returns {string} 2-letter uppercase initials.
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
 * Strategy pattern to map asset categories to visual Lucide icons.
 *
 * @param category - Raw category string.
 * @returns {JSX.Element} The corresponding Icon component.
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
 * Individual row action menu.
 * @private
 */
interface AssetActionsProps {
  asset: Asset;
  onAction: (action: ActionType, asset: Asset) => void;
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

/**
 * Main IT Inventory Table.
 * Uses @tanstack/react-table for core logic and provides custom IT-specific
 * features like automatic column toggling based on hardware categories.
 */
export function DataTable({
  data: initialData,
  title,
  description,
  renderToolbarLeft: externalToolbarLeft,
  renderCustomActions: externalCustomActions,
}: {
  data: Asset[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  renderToolbarLeft?: (
    table: ReturnType<typeof useReactTable<Asset>>
  ) => React.ReactNode;
  renderCustomActions?: (
    table: ReturnType<typeof useReactTable<Asset>>
  ) => React.ReactNode;
}) {
  // Sync table filters/pagination with URL via custom hook
  const { params, setParams } = useTableParams();
  const tab = params.tab;

  // React-Table standard states
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // UI state for modals and sheets
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | null>(null);
  const [activeAction, setActiveAction] = React.useState<ActionType | null>(
    null
  );
  const [activeBulkAction, setActiveBulkAction] = React.useState<
    "assign" | "update" | "delete" | null
  >(null);

  /** Clear selections when switching between "Assigned" and "Retired" tabs. */
  React.useEffect(() => {
    setRowSelection({});
  }, [tab]);

  /**
   * Dictionary mapping asset categories to the specific technical columns they use.
   * This drives the automated UI hiding logic.
   */
  const CATEGORY_COLUMN_SCHEMA: Record<string, string[]> = React.useMemo(
    () => ({
      laptop: [
        "warrantyexpiry",
        "cpu",
        "ram",
        "storage",
        "usb-aports",
        "usb-cports",
      ],
      desktop: [
        "warrantyexpiry",
        "cpu",
        "ram",
        "storage",
        "dedicatedgpu",
        "usb-aports",
        "usb-cports",
      ],
      monitor: ["dimensions", "resolution", "refreshhertz"],
      docking: ["usb-aports", "usb-cports"],
      server: ["warrantyexpiry", "cpu", "ram", "storage"],
      smartphone: ["storage"],
      tablet: ["storage"],
    }),
    []
  );

  /**
   * Adaptive Header Logic:
   * If the data set only contains one type (e.g. all Laptops), automatically
   * show CPU/RAM/Warranty columns. If it's a mixed view, hide all specs to avoid
   * jagged/empty tables.
   */
  React.useEffect(() => {
    if (!initialData.length) return;

    // 1. Detect if we are viewing a Single Category or Mixed
    const uniqueCategories = Array.from(
      new Set(initialData.map((item) => item.category.toLowerCase()))
    );
    const isSingleCategory = uniqueCategories.length === 1;
    const currentCategory = isSingleCategory ? uniqueCategories[0] : null;

    // 2. Define all optional/spec columns that should be toggled
    const allSpecColumns = [
      "warrantyexpiry",
      "cpu",
      "ram",
      "storage",
      "dedicatedgpu",
      "usb-aports",
      "usb-cports",
      "dimensions",
      "resolution",
      "refreshhertz",
    ];

    // 3. Determine which columns should be visible
    const columnsToShow: string[] =
      isSingleCategory && currentCategory
        ? CATEGORY_COLUMN_SCHEMA[currentCategory] || []
        : [];

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

  /** Callback passed to individual rows to launch management dialogs. */
  const handleAction = React.useCallback((action: ActionType, asset: Asset) => {
    setSelectedAsset(asset);
    setActiveAction(action);
  }, []);

  /**
   * High-level filtering based on Tab status.
   * Logic is derived from hardware 'state' and assignee status.
   */
  const filteredData = React.useMemo(() => {
    switch (tab) {
      case "active":
        return initialData.filter(
          (item) =>
            item.employee !== "UNASSIGNED" &&
            item.state !== "BROKEN" &&
            item.state !== "RETIRED"
        );
      case "draft":
        return initialData.filter(
          (item) =>
            item.employee === "UNASSIGNED" &&
            item.state !== "BROKEN" &&
            item.state !== "RETIRED"
        );
      case "archived":
        return initialData.filter(
          (item) => item.state === "BROKEN" || item.state === "RETIRED"
        );
      default:
        return initialData;
    }
  }, [initialData, tab]);

  // Define column definitions with custom renders for IT data (Avatars, Status Badges, etc)
  const columns = React.useMemo<ColumnDef<Asset>[]>(
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
        accessorKey: "asset",
        accessorFn: (row) => `${row.make} ${row.model}`,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Asset" />
        ),
        cell: ({ row }) => {
          const make = row.original.make;
          const model = row.original.model;
          const category = row.original.category;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground">
                {getAssetIcon(category)}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-medium text-foreground">{make}</span>
                <span className="text-xs text-muted-foreground">{model}</span>
              </div>
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const a = `${rowA.original.make} ${rowA.original.model}`;
          const b = `${rowB.original.make} ${rowB.original.model}`;
          return a.localeCompare(b);
        },
      },

      // Category Column
      {
        accessorKey: "category",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Category" />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-normal">
            {row.getValue("category")}
          </Badge>
        ),
      },

      // Service Tag Column
      {
        accessorKey: "servicetag",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Service Tag" />
        ),
        cell: ({ row }) => {
          const tag = row.getValue("servicetag") as string;
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
        accessorKey: "state",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const state = row.getValue("state") as string;
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
        accessorKey: "employee",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Assignee" />
        ),
        cell: ({ row }) => {
          const employee = row.getValue("employee") as string;

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
        accessorKey: "location",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Location" />
        ),
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground text-left">
            {row.getValue("location")}
          </div>
        ),
      },

      // Technical Extensions (Shown dynamically)
      {
        accessorKey: "warrantyexpiry",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Warranty" />
        ),
        cell: ({ row }) => row.getValue("warrantyexpiry"),
      },
      {
        accessorKey: "cpu",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="CPU" />
        ),
        cell: ({ row }) => row.getValue("cpu"),
      },
      {
        accessorKey: "ram",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="RAM" />
        ),
        cell: ({ row }) => row.getValue("ram"),
      },
      {
        accessorKey: "storage",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Storage" />
        ),
        cell: ({ row }) => row.getValue("storage"),
      },
      {
        accessorKey: "dedicatedgpu",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="GPU" />
        ),
        cell: ({ row }) => row.getValue("dedicatedgpu"),
      },
      {
        accessorKey: "usb-aports",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="USB-A" />
        ),
        cell: ({ row }) => row.getValue("usb-aports"),
      },
      {
        accessorKey: "usb-cports",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="USB-C" />
        ),
        cell: ({ row }) => row.getValue("usb-cports"),
      },
      {
        accessorKey: "dimensions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Dims" />
        ),
        cell: ({ row }) => row.getValue("dimensions"),
      },
      {
        accessorKey: "resolution",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Res" />
        ),
        cell: ({ row }) => row.getValue("resolution"),
      },
      {
        accessorKey: "refreshhertz",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Hz" />
        ),
        cell: ({ row }) => row.getValue("refreshhertz"),
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

  // Memoize table options to avoid unnecessary re-renders and lint warnings
  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getRowId: (row) => row.servicetag, // Use Service Tag as a stable unique ID
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    // Sync pagination with URL params
    manualPagination: true,
    pageCount: Math.ceil(filteredData.length / params.pageSize),
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

  // --- Render ---

  return (
    <div className="space-y-4">
      <Tabs
        value={tab}
        className="w-full"
        onValueChange={(v) => setParams({ tab: v, page: 1 })}
      >
        <BaseDataTable
          table={table}
          data={filteredData}
          columns={columns}
          searchKey="servicetag"
          renderToolbarLeft={() => (
            <div className="flex items-center gap-3">
              {externalToolbarLeft?.(table)}
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
            </div>
          )}
          title={title}
          description={description}
          renderCustomActions={(table) => (
            <div className="flex items-center gap-2">
              {externalCustomActions?.(table)}
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
            </div>
          )}
        />
      </Tabs>

      {/* Orchestration for individual row actions */}
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

      {/* Orchestration for multi-select batch actions */}
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
