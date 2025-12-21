"use client";

import { useAssets } from "@/hooks/api/use-assets";
import { useTableParams } from "@/hooks/use-table-params";
import { DataTable } from "@/components/shared/data-table";
import { InventoryHeaderActions } from "@/components/features/inventory/inventory-header-actions";
import { InventoryStats } from "@/components/features/inventory/inventory-stats";
import { CategoryFilter } from "@/components/features/inventory/category-filter";
import { Skeleton } from "@/components/ui/skeleton";

interface InventoryMasterClientProps {
  totalAssetCount?: number;
}

export function InventoryMasterClient({
  totalAssetCount,
}: InventoryMasterClientProps) {
  const { params, setParams } = useTableParams();

  const { data: response, isLoading } = useAssets({
    category: params.category === "all" ? undefined : params.category,
    search: params.search,
    page: params.page,
    pageSize: params.pageSize,
  });

  const assets = response?.data || [];
  const selectedCategory = params.category;

  const handleCategoryChange = (category: string) => {
    setParams({ category, page: 1 });
  };

  if (isLoading && !response) {
    return (
      <div className="flex flex-col flex-1 h-full gap-8 p-8 max-w-(--breakpoint-2xl) mx-auto w-full">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full gap-8 p-8 max-w-(--breakpoint-2xl) mx-auto w-full">
      {/* Visual Stats Section */}
      <InventoryStats assets={assets} totalAssetCount={totalAssetCount} />

      {/* Main Data Table */}
      <div className="flex-1 h-full">
        <DataTable
          data={assets}
          title="Inventory"
          description="Manage, track, and audit all company assets in real-time."
          renderToolbarLeft={() => (
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          )}
          renderCustomActions={() => <InventoryHeaderActions />}
        />
      </div>
    </div>
  );
}
