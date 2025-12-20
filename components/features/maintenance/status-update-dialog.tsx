"use client";

import * as React from "react";
import { MaintenanceRecord, MaintenanceStatus } from "@/lib/maintenance-types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateMaintenanceStatus } from "@/services/maintenance-service";
import { StatusBadge } from "@/components/ui/status-badge";

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: MaintenanceRecord | null;
  newStatus: MaintenanceStatus | null;
  onConfirm: () => void;
}

export function StatusUpdateDialog({
  open,
  onOpenChange,
  record,
  newStatus,
  onConfirm,
}: StatusUpdateDialogProps) {
  const [comment, setComment] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setComment("");
      setLoading(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!record || !newStatus) return;

    setLoading(true);
    try {
      // 1. Update the status
      await updateMaintenanceStatus(record.id, newStatus);

      // 2. Add the comment (if provided) - effectively simulated by the same "touch" in our mock,
      // but in real app we might call a separate endpoint or include it in update.
      // For this mock implementation, we assume the updateStatus handles the transition.
      // If we had a specific addComment API, we'd call it here.

      onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setLoading(false);
    }
  };

  if (!record || !newStatus) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Ticket Status</DialogTitle>
          <DialogDescription>
            Moving ticket <strong>{record.assetTag}</strong> to{" "}
            <StatusBadge variant={newStatus} className="inline-flex ml-1">
              {newStatus.replace("-", " ")}
            </StatusBadge>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="comment">Reason for change (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="e.g. Parts arrived, Diagnosis complete..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none h-24"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
