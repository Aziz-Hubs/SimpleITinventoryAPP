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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  IconClock,
  IconLoader,
  IconCheck,
  IconCalendar,
  IconAlertCircle,
  IconAlertTriangle,
  IconInfoCircle,
} from "@tabler/icons-react";

interface BulkUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: (updates: { status?: string; priority?: string }) => void;
}

export function BulkUpdateDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
}: BulkUpdateDialogProps) {
  const [status, setStatus] = React.useState<string>("");
  const [priority, setPriority] = React.useState<string>("");

  const handleConfirm = () => {
    const updates: { status?: string; priority?: string } = {};
    if (status && status !== "no-change") updates.status = status;
    if (priority && priority !== "no-change") updates.priority = priority;

    onConfirm(updates);
    setStatus("");
    setPriority("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Update Records</DialogTitle>
          <DialogDescription>
            Update {selectedCount} selected maintenance records.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="No Change" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-change">No Change</SelectItem>
                <SelectItem value="pending">
                  <div className="flex items-center gap-2">
                    <IconClock className="h-4 w-4 text-amber-500" />
                    <span>Pending</span>
                  </div>
                </SelectItem>
                <SelectItem value="in-progress">
                  <div className="flex items-center gap-2">
                    <IconLoader className="h-4 w-4 text-blue-500" />
                    <span>In Progress</span>
                  </div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4 text-emerald-500" />
                    <span>Completed</span>
                  </div>
                </SelectItem>
                <SelectItem value="scheduled">
                  <div className="flex items-center gap-2">
                    <IconCalendar className="h-4 w-4 text-purple-500" />
                    <span>Scheduled</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="No Change" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-change">No Change</SelectItem>
                <SelectItem value="critical">
                  <div className="flex items-center gap-2">
                    <IconAlertCircle className="h-4 w-4 text-red-500" />
                    <span>Critical</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <IconAlertTriangle className="h-4 w-4 text-orange-500" />
                    <span>High</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <IconInfoCircle className="h-4 w-4 text-blue-500" />
                    <span>Medium</span>
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <IconInfoCircle className="h-4 w-4 text-gray-500" />
                    <span>Low</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              (!status || status === "no-change") &&
              (!priority || priority === "no-change")
            }
          >
            Update Records
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
