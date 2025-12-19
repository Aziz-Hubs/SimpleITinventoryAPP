"use client";

import * as React from "react";
import { IconBox, IconSearch, IconUser } from "@tabler/icons-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { getAssets } from "@/services/dashboard-service";
import { AssetLegacy } from "@/lib/types";

export function SearchPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [assets, setAssets] = React.useState<AssetLegacy[]>([]);

  React.useEffect(() => {
    // Fetch data for search
    getAssets().then(setAssets);
  }, []);

  // Derive employees from assets for the search demo
  // In a real app, this would be a separate API call
  const employees = React.useMemo(() => {
    const uniqueEmployees = new Set<string>();
    assets.forEach((asset) => {
      if (asset.Employee && asset.Employee !== "UNASSIGNED") {
        uniqueEmployees.add(asset.Employee);
      }
    });
    return Array.from(uniqueEmployees).map((name) => ({
      name,
      role: "Employee", // Mock role
    }));
  }, [assets]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type to search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Assets">
          {assets.map((asset) => (
            <CommandItem
              key={asset.id}
              value={`${asset.Make} ${asset.Model} ${asset["Service Tag"]}`}
            >
              <IconBox className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span>
                  {asset.Make} {asset.Model}
                </span>
                <span className="text-xs text-muted-foreground">
                  TAG: {asset["Service Tag"]} • {asset.Employee}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Employees">
          {employees.map((employee) => (
            <CommandItem key={employee.name} value={employee.name}>
              <IconUser className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span>{employee.name}</span>
                <span className="text-xs text-muted-foreground">
                  {employee.role}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
