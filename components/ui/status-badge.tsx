import * as React from "react";
import { cn } from "@/lib/utils";
import type {
  MaintenanceStatus,
  MaintenancePriority,
  MaintenanceCategory,
} from "@/lib/types";

interface StatusBadgeProps {
  variant:
    | MaintenanceStatus
    | MaintenancePriority
    | MaintenanceCategory
    | "new"
    | "good"
    | "fair"
    | "broken";
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  // Maintenance Status
  pending: "bg-red-400/10 text-red-500 ring-red-400/20",
  "in-progress": "bg-yellow-400/10 text-yellow-500 ring-yellow-400/20",
  completed: "bg-green-400/10 text-green-500 ring-green-400/20",
  scheduled: "bg-blue-400/10 text-blue-500 ring-blue-400/20",
  cancelled: "bg-gray-400/10 text-gray-500 ring-gray-400/20",

  // Priority
  critical: "bg-red-500/10 text-red-600 ring-red-500/30",
  high: "bg-orange-400/10 text-orange-600 ring-orange-400/30",
  medium: "bg-yellow-400/10 text-yellow-600 ring-yellow-400/30",
  low: "bg-blue-400/10 text-blue-600 ring-blue-400/30",

  // Categories
  hardware: "bg-zinc-400/10 text-zinc-600 ring-zinc-400/30",
  software: "bg-violet-400/10 text-violet-600 ring-violet-400/30",
  network: "bg-cyan-400/10 text-cyan-600 ring-cyan-400/30",
  preventive: "bg-indigo-400/10 text-indigo-600 ring-indigo-400/30",

  // Asset State
  new: "bg-emerald-400/10 text-emerald-600 ring-emerald-400/20",
  good: "bg-green-400/10 text-green-600 ring-green-400/20",
  fair: "bg-yellow-400/10 text-yellow-600 ring-yellow-400/20",
  broken: "bg-red-400/10 text-red-600 ring-red-400/20",
};

export function StatusBadge({
  variant,
  children,
  className,
}: StatusBadgeProps) {
  const variantKey = variant.toLowerCase();
  const styles = variantStyles[variantKey] || variantStyles.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
        styles,
        className
      )}
    >
      {children}
    </span>
  );
}
