/**
 * @file action-dialog.tsx
 * @description A high-utility confirmation dialog used for critical system actions.
 * Implements a standardized visual hierarchy including a color-coded top accent bar
 * to indicate action severity (Safe/Destructive).
 * @path /components/shared/action-dialog.tsx
 */

"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Interface for ActionDialog customization.
 */
export interface ActionDialogProps {
  /** 控制弹窗显隐的受控状态. */
  open: boolean;
  /** 状态变更回调. */
  onOpenChange: (open: boolean) => void;
  /** Primary headline. */
  title: string;
  /** Explanatory subtext. */
  description: string;
  /** Label for the positive action. */
  confirmText?: string;
  /** Label for the negative action. */
  cancelText?: string;
  /** Async or sync callback triggered on confirmation. */
  onConfirm: () => void | Promise<void>;
  /** Visual severity: 'destructive' (red) or 'default' (brand). */
  variant?: "default" | "destructive";
  /** If true, shows a spinner and disables buttons. */
  isLoading?: boolean;
  /** Custom icon override. */
  icon?: React.ReactNode;
  /** Optional body content for injecting warning logs or specific metadata. */
  children?: React.ReactNode;
}

/**
 * Standardized Confirmation UI.
 * Integrates with Shadcn UI Dialog but adds custom premium styling like the
 * top-border accent and glassmorphism influence.
 */
export function ActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm Action",
  cancelText = "Cancel",
  onConfirm,
  variant = "default",
  isLoading = false,
  icon,
  children,
}: ActionDialogProps) {
  /**
   * Wraps the confirm callback to support async/await logic gracefully.
   */
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden">
        {/* Visual Accent: A thin bar at the top provides immediate context for action severity */}
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{
            backgroundColor:
              variant === "destructive"
                ? "var(--destructive)"
                : "var(--primary)",
          }}
        />

        <DialogHeader className="pt-4">
          <div className="flex items-center gap-4 text-left">
            {icon || (
              <div
                className={cn(
                  "p-3 rounded-2xl shadow-sm border",
                  variant === "destructive"
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-primary/10 text-primary border-primary/20"
                )}
              >
                <AlertCircle className="h-6 w-6" />
              </div>
            )}
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold tracking-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="text-sm font-medium opacity-80 leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {children && <div className="py-4 px-1">{children}</div>}

        <DialogFooter className="mt-4 gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 font-semibold"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              "flex-1 font-bold",
              variant === "destructive"
                ? "shadow-lg shadow-destructive/20 active:scale-95 transition-all"
                : "shadow-lg shadow-primary/20 active:scale-95 transition-all"
            )}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
