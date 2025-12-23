"use client";

import * as React from "react";
import {
  ArrowUpDown,
  Box,
  Monitor,
  Laptop,
  Smartphone,
  Tablet,
  Printer,
  Headphones,
  Cable,
  Server,
  PcCase,
  Wifi,
  Settings2,
} from "lucide-react";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BaseDataTable } from "@/components/shared/base-data-table";
import { ModelActions } from "./model-actions";
import { Model } from "@/lib/types";
import { useModels } from "@/hooks/api/use-models";
import { useTableParams } from "@/hooks/use-table-params";
import { ModelsHeaderActions } from "./models-header-actions";
import { CategoryFilter } from "@/components/features/inventory/category-filter";
import { EditModelSheet } from "./edit-model-dialog";
import { useModelMutation } from "@/hooks/api/use-models";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ModelsTableProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "laptop":
      return <Laptop className="h-4 w-4" />;
    case "monitor":
      return <Monitor className="h-4 w-4" />;
    case "tablet":
      return <Tablet className="h-4 w-4" />;
    case "smartphone":
      return <Smartphone className="h-4 w-4" />;
    case "printer":
      return <Printer className="h-4 w-4" />;
    case "headset":
      return <Headphones className="h-4 w-4" />;
    case "docking":
      return <Cable className="h-4 w-4" />;
    case "server":
      return <Server className="h-4 w-4" />;
    case "desktop":
      return <PcCase className="h-4 w-4" />;
    case "network switch":
    case "firewall":
    case "access point":
    case "5g/4g modem":
      return <Wifi className="h-4 w-4" />;
    default:
      return <Settings2 className="h-4 w-4" />;
  }
};

export function ModelsTable({ title, description }: ModelsTableProps) {
  const { params, setParams } = useTableParams();

  const { data: response, isLoading } = useModels({
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    category: params.category === "all" ? undefined : params.category,
  });

  const models = response?.data || [];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const [selectedModel, setSelectedModel] = React.useState<Model | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  const { remove } = useModelMutation();

  const handleEdit = React.useCallback((model: Model) => {
    setSelectedModel(model);
    setIsEditOpen(true);
  }, []);

  const handleDelete = React.useCallback((model: Model) => {
    setSelectedModel(model);
    setIsDeleteOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (selectedModel?.id) {
      await remove(selectedModel.id);
      setIsDeleteOpen(false);
    }
  };

  const columns = React.useMemo<ColumnDef<Model>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Model Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground">
              {getCategoryIcon(row.original.category)}
            </div>
            <span className="font-medium">{row.getValue("name")}</span>
          </div>
        ),
      },
      {
        accessorKey: "make",
        header: "Make",
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-normal">
            {row.getValue("category")}
          </Badge>
        ),
      },
      {
        accessorKey: "cpu",
        header: "CPU",
        cell: ({ row }) => {
          const val = row.getValue("cpu");
          return val && val !== "N/A" ? (
            val
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        accessorKey: "ram",
        header: "RAM",
        cell: ({ row }) => {
          const val = row.getValue("ram");
          return val && val !== "N/A" ? (
            val
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        accessorKey: "storage",
        header: "Storage",
        cell: ({ row }) => {
          const val = row.getValue("storage");
          return val && val !== "N/A" ? (
            val
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <ModelActions
            model={row.original}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ),
      },
    ],
    [handleEdit, handleDelete]
  );

  const table = useReactTable({
    data: models,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
      pagination: {
        pageIndex: (params.page || 1) - 1,
        pageSize: params.pageSize || 10,
      },
    },
    manualPagination: true,
    pageCount: response?.pagination?.totalPages || -1,
  });
  return (
    <>
      <BaseDataTable
        table={table}
        data={models}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search models..."
        title={title}
        description={description}
        renderToolbarLeft={() => (
          <CategoryFilter
            selectedCategory={params.category}
            onCategoryChange={(cat) => setParams({ category: cat, page: 1 })}
          />
        )}
        renderCustomActions={() => <ModelsHeaderActions models={models} />}
        onRowClick={handleEdit}
      />

      <EditModelSheet
        model={selectedModel}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              model &quot;{selectedModel?.name}&quot;.
              <br />
              <span className="text-red-500 font-medium text-xs mt-2 block">
                Warning: This may affect assets currently assigned to this
                model.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
