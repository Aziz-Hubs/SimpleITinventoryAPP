"use client";

import * as React from "react";
import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff, Filter, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface DataTableColumnHeaderProps<TData, TValue>
    extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>;
    title: string;
}

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    className,
}: DataTableColumnHeaderProps<TData, TValue>) {
    const [open, setOpen] = React.useState(false);

    if (!column.getCanSort()) {
        return <div className={cn(className)}>{title}</div>;
    }

    const selectedValues = new Set(column.getFilterValue() as string[]);
    const filterValue = (column.getFilterValue() ?? "") as string;

    // For faceted filtering (suggestions)
    const sortedUniqueValues = React.useMemo(() => {
        // If not faceted, we can't show suggestions effectively
        const valuesMap = column.getFacetedUniqueValues();
        if (!valuesMap) return [];
        return Array.from(valuesMap.keys()).sort().slice(0, 50); // Limit to 50 suggestions
    }, [column.getFacetedUniqueValues()]);


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
                        {(column.getFilterValue() as string)?.length > 0 && <span className="ml-1 flex h-2 w-2 rounded-full bg-primary" />}
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[200px] p-0">
                    <div className="p-2 border-b border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 h-8 justify-start"
                                onClick={() => column.toggleSorting(false)}
                            >
                                <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Asc
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 h-8 justify-start"
                                onClick={() => column.toggleSorting(true)}
                            >
                                <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Desc
                            </Button>
                        </div>
                    </div>

                    <Command>
                        <CommandInput
                            placeholder={`Filter ${title}...`}
                            value={(filterValue as any) instanceof Array ? "" : filterValue}
                            onValueChange={(val) => column.setFilterValue(val)}
                            className="h-9"
                        />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup heading="Suggestions">
                                {sortedUniqueValues.map((value) => (
                                    <CommandItem
                                        key={value}
                                        onSelect={() => {
                                            // Quick Filter: Set exact value
                                            if (column.getFilterValue() === value) {
                                                column.setFilterValue(undefined);
                                            } else {
                                                column.setFilterValue(value);
                                            }
                                            //    setOpen(false); // Optional: close on selection
                                        }}
                                    >
                                        <div className={cn(
                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                            column.getFilterValue() === value
                                                ? "bg-primary text-primary-foreground"
                                                : "opacity-50 [&_svg]:invisible"
                                        )}>
                                            <Check className={cn("h-4 w-4")} />
                                        </div>
                                        <span>{value}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            {filterValue && (
                                <>
                                    <CommandSeparator />
                                    <CommandGroup>
                                        <CommandItem
                                            onSelect={() => column.setFilterValue(undefined)}
                                            className="justify-center text-center"
                                        >
                                            Clear Filter
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
