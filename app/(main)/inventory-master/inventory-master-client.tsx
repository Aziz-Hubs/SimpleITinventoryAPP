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
    <div className="flex flex-col flex-1 h-full space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Inventory Master
          </h1>
          <p className="text-sm text-muted-foreground hidden md:block">
            Manage, track, and audit all company assets in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          <InventoryHeaderActions />
        </div>
      </div>

      {/* Visual Stats Section */}
      <InventoryStats assets={filteredAssets} />

      {/* Main Data Table */}
      <div className="flex-1 h-full">
        <DataTable data={filteredAssets} />
      </div>
    </div>
  );
}
