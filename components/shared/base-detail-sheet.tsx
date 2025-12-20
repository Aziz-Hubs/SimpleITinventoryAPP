"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface BaseDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  sheetColor?: string;
  icon?: React.ReactNode;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}

export function BaseDetailSheet({
  open,
  onOpenChange,
  title,
  description,
  sheetColor = "#6366f1", // Default to Indigo if not specified
  icon,
  headerContent,
  footerContent,
  children,
  className,
  side = "right",
}: BaseDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        sheetColor={sheetColor}
        side={side}
        className={cn(
          "w-full sm:max-w-xl p-0 flex flex-col border-l shadow-2xl overflow-hidden",
          className
        )}
      >
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <div
            className="p-6 border-b"
            style={{
              background: `linear-gradient(to bottom right, color-mix(in srgb, var(--sheet-color) 10%, transparent), transparent)`,
            }}
          >
            <SheetHeader>
              <div className="flex items-center gap-3 mb-2">
                {icon && (
                  <div
                    className="p-2.5 rounded-xl shadow-sm border"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--sheet-color) 10%, transparent)",
                      borderColor:
                        "color-mix(in srgb, var(--sheet-color) 20%, transparent)",
                    }}
                  >
                    {/* Clone the icon element to inject color style if it helps, 
                        but usually the passed icon should/can handle its own color 
                        or we wrap it in a div that sets color via style. 
                        For simplicity here, we assume the icon inherits or is passed correctly.
                        However, looking at the pattern, we want the icon to have the sheet color.
                    */}
                    <div style={{ color: "var(--sheet-color)" }}>{icon}</div>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex flex-col gap-0.5">
                    {headerContent}
                    <SheetTitle className="text-2xl font-bold tracking-tight">
                      {title}
                    </SheetTitle>
                  </div>
                </div>
              </div>
              {description && (
                <SheetDescription className="text-sm">
                  {description}
                </SheetDescription>
              )}
            </SheetHeader>
          </div>

          {/* Main Content */}
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8 pb-10">{children}</div>
          </ScrollArea>

          {/* Footer */}
          {footerContent && (
            <div className="p-6 border-t bg-muted/20 backdrop-blur-md">
              {footerContent}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
