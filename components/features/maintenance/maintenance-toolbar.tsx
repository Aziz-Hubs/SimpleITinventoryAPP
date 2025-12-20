"use client";

import * as React from "react";
import {
  IconLayoutList,
  IconLayoutKanban,
  IconSearch,
  IconFilter,
  IconPlus,
  IconRefresh,
  IconClock,
  IconTool,
  IconCheck,
  IconCalendar,
  IconX,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MaintenanceStatus } from "@/lib/maintenance-types";
import { cn } from "@/lib/utils";

interface MaintenanceToolbarProps {
  viewMode: "list" | "board";
  onViewChange: (mode: "list" | "board") => void;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: MaintenanceStatus | "all";
  onStatusFilterChange: (value: MaintenanceStatus | "all") => void;
  onRefresh: () => void;
  onCreate: () => void;
  loading?: boolean;
}

export function MaintenanceToolbar({
  viewMode,
  onViewChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  onCreate,
  loading,
}: MaintenanceToolbarProps) {
  return (
    <div className="flex flex-col gap-4 p-1">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: View Switcher & Search */}
        <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
          <div className="bg-muted/50 p-1 rounded-lg border">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(val) =>
                val && onViewChange(val as "list" | "board")
              }
            >
              <ToggleGroupItem value="list" aria-label="List View" size="sm">
                <IconLayoutList className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="board" aria-label="Board View" size="sm">
                <IconLayoutKanban className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets, issues..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-10 bg-background/50"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Select
            value={statusFilter}
            onValueChange={(v) =>
              onStatusFilterChange(v as MaintenanceStatus | "all")
            }
          >
            <SelectTrigger className="w-auto min-w-[160px] h-10 bg-background/50">
              <div className="flex items-center gap-2">
                <IconFilter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="All Statuses" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <span className="font-medium">All Statuses</span>
                </div>
              </SelectItem>
              <SelectItem value="pending">
                <div className="flex items-center gap-2">
                  <IconClock className="h-3.5 w-3.5 text-amber-500" />
                  <span>Pending</span>
                </div>
              </SelectItem>
              <SelectItem value="in-progress">
                <div className="flex items-center gap-2">
                  <IconTool className="h-3.5 w-3.5 text-blue-500" />
                  <span>In Progress</span>
                </div>
              </SelectItem>
              <SelectItem value="completed">
                <div className="flex items-center gap-2">
                  <IconCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Completed</span>
                </div>
              </SelectItem>
              <SelectItem value="scheduled">
                <div className="flex items-center gap-2">
                  <IconCalendar className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Scheduled</span>
                </div>
              </SelectItem>
              <SelectItem value="cancelled">
                <div className="flex items-center gap-2">
                  <IconX className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Cancelled</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            className="h-10 w-10 shrink-0"
            title="Refresh Data"
          >
            <IconRefresh className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>

          <Button
            onClick={onCreate}
            className="h-10 px-4 font-semibold shadow-md shadow-primary/20 shrink-0"
          >
            <IconPlus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>
    </div>
  );
}
