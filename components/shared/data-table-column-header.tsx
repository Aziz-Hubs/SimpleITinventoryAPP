/**
 * @file data-table-column-header.tsx
 * @description A multi-functional column header for TanStack Table.
 * Integrates sorting triggers and per-column faceted filtering (Quick Filter)
 * into a single unified popover interface.
 * @path /components/shared/data-table-column-header.tsx
 */

"use client";

import * as React from "react";
import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Props for the Column Header component.
 */
interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  /** The TanStack column object containing state and handlers. */
  column: Column<TData, TValue>;
  /** The visible text label for the column. */
  title: string;
}

/**
 * Intelligent Column Header.
 * Features:
 * 1. Sorting (Asc/Desc)
 * 2. Faceted Search (lists unique values found in the column for quick selection)
 * 3. Exact Value Filtering
 */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false);

  const filterValue = (column.getFilterValue() ?? "") as string;

  /**
   * Extracts unique values from the column data for the suggest-and-filter UI.
   * Leverages TanStack's faceted unique values core logic.
   */
  const sortedUniqueValues = React.useMemo(() => {
    const valuesMap = column.getFacetedUniqueValues();
    if (!valuesMap) return [];
    // Limit to 50 items to keep the popover performant
    return Array.from(valuesMap.keys()).sort().slice(0, 50);
  }, [column]);

  // If column is static (no sorting/filtering), render simple text
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}

            {/* Visual Dot: indicates an active filter is applied to this specific column */}
            {(column.getFilterValue() as string)?.length > 0 && (
              <span className="ml-1 flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[200px] p-0 shadow-xl border-primary/10"
        >
          {/* Sorting Actions */}
          <div className="p-2 border-b border-border/50 bg-muted/20">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8 justify-start text-xs font-semibold"
                onClick={() => {
                  column.toggleSorting(false);
                  setOpen(false);
                }}
              >
                <ArrowUp className="mr-2 h-3.5 w-3.5 text-primary" />
                Ascending
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8 justify-start text-xs font-semibold"
                onClick={() => {
                  column.toggleSorting(true);
                  setOpen(false);
                }}
              >
                <ArrowDown className="mr-2 h-3.5 w-3.5 text-primary" />
                Descending
              </Button>
            </div>
          </div>

          {/* Filtering Engine */}
          <Command className="rounded-none">
            <CommandInput
              placeholder={`Filter ${title}...`}
              value={Array.isArray(filterValue) ? "" : String(filterValue)}
              onValueChange={(val) => column.setFilterValue(val)}
              className="h-9 border-none focus:ring-0"
            />
            <CommandList className="max-h-[200px]">
              <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
                No suggestions found.
              </CommandEmpty>

              {sortedUniqueValues.length > 0 && (
                <CommandGroup
                  heading="Quick Selection"
                  className="px-1 text-[10px] uppercase font-bold text-muted-foreground/60"
                >
                  {sortedUniqueValues.map((value) => (
                    <CommandItem
                      key={value}
                      className="text-sm cursor-pointer"
                      onSelect={() => {
                        // Toggle Logic: If clicking the active filter, clear it.
                        if (column.getFilterValue() === value) {
                          column.setFilterValue(undefined);
                        } else {
                          column.setFilterValue(value);
                        }
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary transition-all",
                          column.getFilterValue() === value
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
                      <span className="truncate">{value}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {filterValue && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        column.setFilterValue(undefined);
                        setOpen(false);
                      }}
                      className="justify-center text-center text-xs font-bold text-destructive hover:bg-destructive/5"
                    >
                      Reset Column Filter
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
