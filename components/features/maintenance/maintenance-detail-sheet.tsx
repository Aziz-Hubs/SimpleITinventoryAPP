"use client";

import * as React from "react";
import { BaseDetailSheet } from "@/components/shared/base-detail-sheet";
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
import {
  useUpdateMaintenanceStatus,
  useAddMaintenanceComment,
} from "@/hooks/api/use-maintenance";
import { MaintenanceRecord, MaintenanceStatus } from "@/lib/types";
import { MaintenanceTimeline } from "./maintenance-timeline";
import {
  IconCalendar,
  IconCoin,
  IconUser,
  IconTool,
  IconClock,
  IconLoader,
  IconCheck,
  IconX,
  IconInfoCircle,
  IconAlertTriangle,
  IconFileText,
  IconHistory,
  IconDeviceLaptop,
  IconSend,
  IconMessageCircle,
} from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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
  sheetColor = "#f59e0b", // Default to Amber/Yellow for maintenance
}: MaintenanceDetailSheetProps & { sheetColor?: string }) {
  const [newNote, setNewNote] = React.useState(""); // For status change note
  const [newComment, setNewComment] = React.useState(""); // For comments tab
  const [selectedStatus, setSelectedStatus] = React.useState<
    MaintenanceStatus | ""
  >("");

  const updateStatusMutation = useUpdateMaintenanceStatus();
  const addCommentMutation = useAddMaintenanceComment();

  React.useEffect(() => {
    if (record) {
      setSelectedStatus(record.status);
    }
  }, [record]);

  if (!record) return null;

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === record.status) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: record.id,
        status: selectedStatus as MaintenanceStatus,
        note: newNote,
      });
      setNewNote("");
      onUpdate?.();
    } catch (error) {
      // Toast handled by mutation hook
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addCommentMutation.mutateAsync({
        id: record.id,
        content: newComment,
      });
      setNewComment("");
      onUpdate?.();
    } catch (error) {
      // Toast handled by mutation hook
    }
  };

  const isSubmitting =
    updateStatusMutation.isPending || addCommentMutation.isPending;

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Merge legacy notes into timeline-like display for the "History" tab if needed,
  // currently standardizing on the new timeline component.

  return (
    <BaseDetailSheet
      open={open}
      onOpenChange={onOpenChange}
      sheetColor={sheetColor}
      title="Maintenance Details"
      description={
        <>
          Record ID:{" "}
          <span className="font-mono font-bold text-foreground">
            {record.id}
          </span>
        </>
      }
      icon={<IconInfoCircle className="h-6 w-6" />}
      footerContent={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            Close Details
          </Button>
          <Button
            onClick={handleStatusUpdate}
            disabled={
              !selectedStatus ||
              selectedStatus === record.status ||
              isSubmitting
            }
            className="flex-1 sm:flex-none px-8 font-bold shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              <IconLoader className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Apply Changes
          </Button>
        </div>
      }
    >
      {/* Status Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <StatusBadge variant={record.status}>
            {record.status.replace("-", " ").toUpperCase()}
          </StatusBadge>
          <StatusBadge variant={record.priority}>
            {record.priority.toUpperCase()}
          </StatusBadge>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          Current Status
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="details">Details & Actions</TabsTrigger>
          <TabsTrigger value="timeline">Timeline & Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-4">
          {/* Asset Information */}
          <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b">
              <IconDeviceLaptop className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                Asset Information
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Service Tag
                </p>
                <p
                  className="font-mono font-bold"
                  style={{ color: "var(--sheet-color)" }}
                >
                  {record.assetTag}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Category
                </p>
                <p className="font-semibold">{record.assetCategory}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Manufacturer
                </p>
                <p className="font-semibold">{record.assetMake || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Model
                </p>
                <p className="font-semibold">{record.assetModel || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Issue Details */}
          <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b">
              <IconAlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                Issue Description
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Summary
                </p>
                <p className="text-lg font-bold leading-tight">
                  {record.issue}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Detailed Description
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed bg-muted/20 p-4 rounded-xl border border-border/10 italic">
                  &quot;{record.description}&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Update Status Area */}
          <div
            className="space-y-6 rounded-2xl border p-6 shadow-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--sheet-color) 20%, transparent)",
              backgroundColor:
                "color-mix(in srgb, var(--sheet-color) 5%, transparent)",
            }}
          >
            <div
              className="flex items-center gap-2 mb-2 pb-2 border-b"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--sheet-color) 10%, transparent)",
              }}
            >
              <IconHistory
                className="h-4 w-4"
                style={{ color: "var(--sheet-color)" }}
              />
              <h3
                className="text-sm font-bold uppercase tracking-widest"
                style={{
                  color: "color-mix(in srgb, var(--sheet-color) 80%, black)",
                }}
              >
                Update Status
              </h3>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="status"
                  className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                >
                  Transition to Status
                </Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) =>
                    setSelectedStatus(value as MaintenanceStatus)
                  }
                >
                  <SelectTrigger
                    id="status"
                    className="h-10 transition-all border-primary/20 focus:ring-2 focus:ring-primary/20 bg-background/50"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <IconClock className="h-4 w-4 text-amber-500" />
                        <span>Pending</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="in-progress">
                      <div className="flex items-center gap-2">
                        <IconLoader className="h-4 w-4 text-blue-500 animate-spin" />
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
                    <SelectItem value="cancelled">
                      <div className="flex items-center gap-2">
                        <IconX className="h-4 w-4 text-red-500" />
                        <span>Cancelled</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="note"
                  className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                >
                  Reason / Note for Status Change
                </Label>
                <Textarea
                  id="note"
                  placeholder="Optional note about this status change..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={2}
                  className="transition-all border-primary/20 focus:ring-2 focus:ring-primary/20 bg-background/50"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6 mt-4">
          {/* Add Comment Area */}
          <div className="rounded-2xl border bg-card/40 p-4 shadow-sm backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-2">
              <IconMessageCircle className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                Add Comment
              </h3>
            </div>
            <Textarea
              placeholder="Type your comment here..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="bg-background/50"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                <IconSend className="h-3 w-3 mr-2" />
                Post Comment
              </Button>
            </div>
          </div>

          {/* Timeline Display */}
          <div className="rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm">
            <MaintenanceTimeline events={record.timeline || []} />
          </div>
        </TabsContent>
      </Tabs>
    </BaseDetailSheet>
  );
}
