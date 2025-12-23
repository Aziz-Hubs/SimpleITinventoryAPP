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
import { Asset, Employee } from "@/lib/types";
import { getAssets } from "@/services/dashboard-service";
import { getEmployees } from "@/services/employee-service";

export function SearchPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [assets, setAssets] = React.useState<Asset[]>([]);

  const [employees, setEmployees] = React.useState<Employee[]>([]);

  React.useEffect(() => {
    // Fetch data for search
    getAssets().then(setAssets);
    getEmployees().then((res) => setEmployees(res.data));
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
              value={`${asset.make} ${asset.model} ${asset.serviceTag}`}
            >
              <IconBox className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span>
                  {asset.make} {asset.model}
                </span>
                <span className="text-xs text-muted-foreground">
                  TAG: {asset.serviceTag} • {asset.employee}
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
