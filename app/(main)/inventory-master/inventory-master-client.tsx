"use client";

import { useState } from "react";
import { AssetLegacy } from "@/lib/types";
import { DataTable } from "@/components/shared/data-table";
import { InventoryHeaderActions } from "@/components/features/inventory/inventory-header-actions";
import { InventoryStats } from "@/components/features/inventory/inventory-stats";
import { CategoryFilter } from "@/components/features/inventory/category-filter";

interface InventoryMasterClientProps {
  initialAssets: AssetLegacy[];
}

export function InventoryMasterClient({
  initialAssets,
}: InventoryMasterClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filter assets based on selected category
  const filteredAssets =
    selectedCategory === "all"
      ? initialAssets
      : initialAssets.filter((asset) => asset.Category === selectedCategory);

  return (
    <div className="flex flex-col flex-1 h-full gap-8 p-8 max-w-(--breakpoint-2xl) mx-auto w-full">
      {/* Visual Stats Section */}
      <InventoryStats assets={filteredAssets} />

      {/* Main Data Table */}
      <div className="flex-1 h-full">
        <DataTable
          data={filteredAssets}
          title="Inventory Master"
          description="Manage, track, and audit all company assets in real-time."
          renderToolbarLeft={() => (
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          )}
          renderCustomActions={() => <InventoryHeaderActions />}
        />
      </div>
    </div>
  );
}
