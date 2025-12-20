"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MaintenanceRecord } from "@/lib/maintenance-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconAlertTriangle,
  IconUser,
  IconCalendar,
  IconDeviceLaptop,
  IconDeviceDesktop,
  IconDeviceTablet,
  IconDeviceMobile,
  IconServer,
  IconPrinter,
  IconDeviceTv,
  IconDeviceWatch,
  IconHeadphones,
  IconHelp,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface SortableTicketCardProps {
  record: MaintenanceRecord;
  onClick: (record: MaintenanceRecord) => void;
}

const getCategoryIcon = (category: string) => {
  const normalized = category.toLowerCase().trim();
  if (normalized.includes("laptop"))
    return <IconDeviceLaptop className="h-4 w-4" />;
  if (
    normalized.includes("desktop") ||
    normalized.includes("pc") ||
    normalized.includes("workstation")
  )
    return <IconDeviceDesktop className="h-4 w-4" />;
  if (normalized.includes("tablet") || normalized.includes("ipad"))
    return <IconDeviceTablet className="h-4 w-4" />;
  if (normalized.includes("mobile") || normalized.includes("phone"))
    return <IconDeviceMobile className="h-4 w-4" />;
  if (normalized.includes("server")) return <IconServer className="h-4 w-4" />;
  if (normalized.includes("printer"))
    return <IconPrinter className="h-4 w-4" />;
  if (
    normalized.includes("monitor") ||
    normalized.includes("display") ||
    normalized.includes("tv")
  )
    return <IconDeviceTv className="h-4 w-4" />;
  if (normalized.includes("watch") || normalized.includes("wearable"))
    return <IconDeviceWatch className="h-4 w-4" />;
  if (
    normalized.includes("audio") ||
    normalized.includes("headphone") ||
    normalized.includes("headset")
  )
    return <IconHeadphones className="h-4 w-4" />;

  return <IconHelp className="h-4 w-4" />;
};

export function SortableTicketCard({
  record,
  onClick,
}: SortableTicketCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: record.id.toString(),
    data: {
      type: "Ticket",
      record,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-muted/50 border-2 border-primary border-dashed rounded-lg h-[140px] w-full"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className={cn(
          "cursor-grab active:cursor-grabbing hover:shadow-md transition-all hover:border-primary/50 group bg-card border-l-4",
          record.priority === "critical"
            ? "border-l-red-500"
            : "border-l-transparent"
        )}
        onClick={() => onClick(record)}
      >
        <CardHeader className="p-3 pb-2 space-y-1">
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className="font-mono text-[10px] text-muted-foreground px-1 h-5"
              >
                {record.assetTag}
              </Badge>
              <div className="text-muted-foreground/70" title={record.category}>
                {getCategoryIcon(record.category)}
              </div>
            </div>
            {record.priority === "critical" && (
              <IconAlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
            )}
          </div>
          <CardTitle className="text-sm font-medium leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {record.issue}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <IconUser className="h-3 w-3" />
            <span>{record.technician || "Unassigned"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <IconCalendar className="h-3 w-3" />
            <span>{record.reportedDate}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
