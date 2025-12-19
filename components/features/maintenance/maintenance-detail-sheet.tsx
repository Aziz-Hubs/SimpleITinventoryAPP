"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { updateMaintenanceStatus } from "@/services/maintenance-service";
import type {
  MaintenanceRecord,
  MaintenanceStatus,
} from "@/lib/maintenance-types";
import {
  IconCalendar,
  IconCoin,
  IconUser,
  IconTool,
} from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";

interface MaintenanceDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: MaintenanceRecord | null;
  onUpdate?: () => void;
}

export function MaintenanceDetailSheet({
  open,
  onOpenChange,
  record,
  onUpdate,
}: MaintenanceDetailSheetProps) {
  const [newNote, setNewNote] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<
    MaintenanceStatus | ""
  >("");

  React.useEffect(() => {
    if (record) {
      setSelectedStatus(record.status);
    }
  }, [record]);

  if (!record) return null;

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === record.status) return;

    await updateMaintenanceStatus(record.id, selectedStatus, newNote);
    setNewNote("");
    onUpdate?.();
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Maintenance Details</SheetTitle>
          <SheetDescription>ID: {record.id}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Asset Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Asset Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Service Tag</p>
                <p className="font-medium">{record.assetTag}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium">{record.assetCategory}</p>
              </div>
              {record.assetMake && (
                <div>
                  <p className="text-muted-foreground">Make</p>
                  <p className="font-medium">{record.assetMake}</p>
                </div>
              )}
              {record.assetModel && (
                <div>
                  <p className="text-muted-foreground">Model</p>
                  <p className="font-medium">{record.assetModel}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Issue Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Issue Details</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Summary</p>
                <p className="text-sm font-medium">{record.issue}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{record.description}</p>
              </div>
              <div className="flex gap-2">
                <StatusBadge variant={record.status}>
                  {record.status.replace("-", " ").toUpperCase()}
                </StatusBadge>
                <StatusBadge variant={record.priority}>
                  {record.priority.toUpperCase()}
                </StatusBadge>
                <StatusBadge variant={record.category}>
                  {record.category.toUpperCase()}
                </StatusBadge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Timeline</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <IconCalendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Reported:</span>
                <span className="font-medium">
                  {formatDate(record.reportedDate)}
                </span>
              </div>
              {record.scheduledDate && (
                <div className="flex items-center gap-2 text-sm">
                  <IconCalendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Scheduled:</span>
                  <span className="font-medium">
                    {formatDate(record.scheduledDate)}
                  </span>
                </div>
              )}
              {record.completedDate && (
                <div className="flex items-center gap-2 text-sm">
                  <IconCalendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="font-medium">
                    {formatDate(record.completedDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* People */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">People</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <IconUser className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Reported By:</span>
                <span className="font-medium">{record.reportedBy}</span>
              </div>
              {record.technician && (
                <div className="flex items-center gap-2 text-sm">
                  <IconTool className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Technician:</span>
                  <span className="font-medium">{record.technician}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Cost */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Cost</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {record.estimatedCost && (
                <div className="flex items-center gap-2">
                  <IconCoin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Estimated</p>
                    <p className="font-medium">
                      ${record.estimatedCost.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
              {record.actualCost && (
                <div className="flex items-center gap-2">
                  <IconCoin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Actual</p>
                    <p className="font-medium">
                      ${record.actualCost.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {record.notes.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Notes</h3>
                <div className="space-y-2">
                  {record.notes.map((note, index) => (
                    <div
                      key={index}
                      className="rounded-md bg-muted p-3 text-sm"
                    >
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Update Status */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Update Status</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="status">New Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) =>
                    setSelectedStatus(value as MaintenanceStatus)
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Add Note (Optional)</Label>
                <Textarea
                  id="note"
                  placeholder="Add a note about this status change..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleStatusUpdate}
                disabled={!selectedStatus || selectedStatus === record.status}
                className="w-full"
              >
                Update Status
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
