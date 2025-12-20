"use client";

import * as React from "react";
import { IconBox, IconUser } from "@tabler/icons-react";

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
import { getEmployees, type Employee } from "@/services/employee-service";
import { AssetLegacy } from "@/lib/types";

export function SearchPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [assets, setAssets] = React.useState<AssetLegacy[]>([]);

  const [employees, setEmployees] = React.useState<Employee[]>([]);

  React.useEffect(() => {
    // Fetch data for search
    getAssets().then(setAssets);
    getEmployees().then(setEmployees);
  }, []);

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
            <CommandItem key={employee.id} value={employee.fullName}>
              <IconUser className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span>{employee.fullName}</span>
                <span className="text-xs text-muted-foreground">
                  {employee.position} • {employee.department}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
