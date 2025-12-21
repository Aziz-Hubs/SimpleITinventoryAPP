"use client";

import { ModelsTable } from "@/components/features/models/models-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useModels } from "@/hooks/api/use-models"; // Importing just to check loading state if needed, or we rely on table

export function ModelsClient() {
  return (
    <div className="flex flex-col flex-1 h-full gap-8 p-8 max-w-(--breakpoint-2xl) mx-auto w-full">
      <ModelsTable
        title="Models Management"
        description="Catalog of approved hardware models and specifications."
      />
    </div>
  );
}
