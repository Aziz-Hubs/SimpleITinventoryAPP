"use client";

import * as React from "react";
import {
  IconCircleCheck,
  IconMessageCircle,
  IconUser,
  IconClipboardList,
  IconPencil,
  IconCalendarEvent,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { MaintenanceTimelineEvent } from "@/lib/types";

interface MaintenanceTimelineProps {
  events: MaintenanceTimelineEvent[];
  className?: string;
}

export function MaintenanceTimeline({
  events,
  className,
}: MaintenanceTimelineProps) {
  const getIcon = (type: MaintenanceTimelineEvent["type"]) => {
    switch (type) {
      case "status_change":
        return <IconCircleCheck className="h-4 w-4" />;
      case "comment":
        return <IconMessageCircle className="h-4 w-4" />;
      case "assignment":
        return <IconUser className="h-4 w-4" />;
      case "creation":
        return <IconClipboardList className="h-4 w-4" />;
      case "update":
        return <IconPencil className="h-4 w-4" />;
      default:
        return <IconCalendarEvent className="h-4 w-4" />;
    }
  };

  const getColor = (type: MaintenanceTimelineEvent["type"]) => {
    switch (type) {
      case "status_change":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "comment":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "assignment":
        return "text-purple-500 bg-purple-500/10 border-purple-500/20";
      case "creation":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground italic text-sm">
        No history available.
      </div>
    );
  }

  // Sort events by timestamp (newest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className={cn("space-y-6", className)}>
      {sortedEvents.map((event, index) => (
        <div key={event.id || index} className="relative pl-6 sm:pl-8 group">
          {/* Vertical Line */}
          {index !== sortedEvents.length - 1 && (
            <div
              className="absolute left-[11px] sm:left-[15px] top-6 bottom-[-24px] w-px bg-border/50 group-hover:bg-primary/20 transition-colors"
              aria-hidden="true"
            />
          )}

          {/* Status Dot/Icon */}
          <div
            className={cn(
              "absolute left-0 top-0 h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center border shadow-sm transition-all duration-300",
              getColor(event.type)
            )}
          >
            {getIcon(event.type)}
          </div>

          {/* Content Card */}
          <div className="flex flex-col gap-1 pt-0.5 sm:pt-1">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <span className="text-sm font-bold text-foreground/90">
                {event.title}
              </span>
              <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">
                {new Date(event.timestamp).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {event.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mt-1 bg-muted/20 p-3 rounded-lg border border-border/30">
                {event.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                By {event.user}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
