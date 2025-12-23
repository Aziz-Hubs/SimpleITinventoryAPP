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

  // Fetch filtered assets for the table
  const { data: response, isLoading } = useAssets({
    category: params.category === "all" ? undefined : params.category,
    search: params.search,
    page: params.page,
    pageSize: params.pageSize,
  });

  // Fetch ALL assets (unfiltered) for stats cards
  const { data: allAssetsResponse, isLoading: isLoadingAllAssets } = useAssets({
    pageSize: 9999, // Get all assets
  });

  const assets = response?.data || [];
  const allAssets = allAssetsResponse?.data || [];
  const selectedCategory = params.category;

  const handleCategoryChange = (category: string) => {
    setParams({ category, page: 1 });
  };

  if ((isLoading && !response) || (isLoadingAllAssets && !allAssetsResponse)) {
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
      <InventoryStats assets={allAssets} totalAssetCount={totalAssetCount} />

      {/* Category Filter Section */}
      <div className="flex items-center justify-between gap-4">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
        <InventoryHeaderActions />
      </div>

      {/* Main Data Table */}
      <div className="flex-1 h-full">
        <DataTable
          data={assets}
          title="Inventory"
          description="Manage, track, and audit all company assets in real-time."
          renderToolbarLeft={() => null}
          renderCustomActions={() => null}
        />
      </div>
    </div>
  );
}
