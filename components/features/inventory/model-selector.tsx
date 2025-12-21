"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import modelsData from "@/data/models.json";

export interface ModelSpec {
  name: string;
  category: string;
  make: string;
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    dedicatedgpu: string;
    "usb-aports": string;
    "usb-cports": string;
    dimensions: string;
    resolution: string;
    refreshhertz: string;
  };
}

interface ModelSelectorProps {
  category: string;
  value?: string;
  onSelect: (model: ModelSpec) => void;
  className?: string;
}

export function ModelSelector({
  category,
  value,
  onSelect,
  className,
}: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false);
  // local value state is removed, controlled by prop

  // Filter models by category if one is selected
  const availableModels = React.useMemo(() => {
    if (!category) return modelsData as ModelSpec[];
    return (modelsData as ModelSpec[]).filter(
      (m) => m.category.toLowerCase() === category.toLowerCase()
    );
  }, [category]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-background/50 border-muted-foreground/20",
            className
          )}
        >
          {value
            ? availableModels.find((model) => model.name === value)?.name
            : "Select model..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {availableModels.map((model) => (
                <CommandItem
                  key={model.name}
                  value={model.name}
                  onSelect={(currentValue) => {
                    onSelect(model);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === model.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {model.make}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
