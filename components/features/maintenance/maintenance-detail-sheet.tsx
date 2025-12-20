"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
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
  IconClock,
  IconLoader,
  IconCheck,
  IconX,
  IconInfoCircle,
  IconAlertTriangle,
  IconFileText,
  IconHistory,
  IconDeviceLaptop,
  IconId
} from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      <SheetContent sheetColor={sheetColor} side="right" className="w-full sm:max-w-xl p-0 flex flex-col border-l shadow-2xl overflow-hidden">
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <div
            className="p-6 border-b"
            style={{
              background: `linear-gradient(to bottom right, color-mix(in srgb, var(--sheet-color) 10%, transparent), transparent)`
            }}
          >
            <SheetHeader>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="p-2.5 rounded-xl shadow-sm border"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--sheet-color) 10%, transparent)",
                    borderColor: "color-mix(in srgb, var(--sheet-color) 20%, transparent)"
                  }}
                >
                  <IconInfoCircle className="h-6 w-6" style={{ color: "var(--sheet-color)" }} />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold tracking-tight">Maintenance Details</SheetTitle>
                  <SheetDescription className="text-muted-foreground">
                    Record ID: <span className="font-mono font-bold text-foreground">{record.id}</span>
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8 pb-10">
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
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Current Status</div>
              </div>

              {/* Asset Information */}
              <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <IconDeviceLaptop className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Asset Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Service Tag</p>
                    <p className="font-mono font-bold" style={{ color: "var(--sheet-color)" }}>{record.assetTag}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category</p>
                    <p className="font-semibold">{record.assetCategory}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Manufacturer</p>
                    <p className="font-semibold">{record.assetMake || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Model</p>
                    <p className="font-semibold">{record.assetModel || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Issue Details */}
              <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <IconAlertTriangle className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Issue Description</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Summary</p>
                    <p className="text-lg font-bold leading-tight">{record.issue}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Detailed Description</p>
                    <p className="text-sm text-muted-foreground leading-relaxed bg-muted/20 p-4 rounded-xl border border-border/10 italic">
                      "{record.description}"
                    </p>
                  </div>
                </div>
              </div>

              {/* People & Cost */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                    <IconUser className="h-4 w-4 text-blue-500" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Assignment</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <IconUser className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Reporter</p>
                        <p className="text-sm font-semibold">{record.reportedBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconTool className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Technician</p>
                        <p className="text-sm font-semibold">{record.technician || "Awaiting Assignment"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                    <IconCoin className="h-4 w-4 text-emerald-500" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Financials</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estimated Cost</p>
                      <p className="text-lg font-bold text-emerald-600/80">${record.estimatedCost?.toFixed(2) || "0.00"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Actual Cost</p>
                      <p className="text-lg font-bold text-primary">${record.actualCost?.toFixed(2) || "---"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <IconHistory className="h-4 w-4 text-purple-500" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Timeline</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Reported</p>
                    <p className="text-sm font-medium">{formatDate(record.reportedDate)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Scheduled</p>
                    <p className="text-sm font-medium">{formatDate(record.scheduledDate)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completed</p>
                    <p className="text-sm font-medium">{formatDate(record.completedDate)}</p>
                  </div>
                </div>
              </div>

              {/* Activity Notes */}
              <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <IconFileText className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Activity Log</h3>
                </div>
                <div className="space-y-4">
                  {record.notes.length > 0 ? (
                    record.notes.map((note, index) => (
                      <div key={index} className="relative pl-6 pb-4 last:pb-0 border-l border-primary/20 last:border-0">
                        <div className="absolute left-[-5px] top-0 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_0_3px_rgba(var(--primary),0.1)]" />
                        <p className="text-sm text-muted-foreground leading-relaxed">{note}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic text-center py-4">No activity notes recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Update Status Area */}
              <div
                className="space-y-6 rounded-2xl border p-6 shadow-sm"
                style={{
                  borderColor: "color-mix(in srgb, var(--sheet-color) 20%, transparent)",
                  backgroundColor: "color-mix(in srgb, var(--sheet-color) 5%, transparent)"
                }}
              >
                <div
                  className="flex items-center gap-2 mb-2 pb-2 border-b"
                  style={{ borderColor: "color-mix(in srgb, var(--sheet-color) 10%, transparent)" }}
                >
                  <IconHistory className="h-4 w-4" style={{ color: "var(--sheet-color)" }} />
                  <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: "color-mix(in srgb, var(--sheet-color) 80%, black)" }}>Update Record</h3>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Transition to Status</Label>
                    <Select
                      value={selectedStatus}
                      onValueChange={(value) =>
                        setSelectedStatus(value as MaintenanceStatus)
                      }
                    >
                      <SelectTrigger id="status" className="h-10 transition-all border-primary/20 focus:ring-2 focus:ring-primary/20 bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending"><div className="flex items-center gap-2"><IconClock className="h-4 w-4 text-amber-500" /><span>Pending</span></div></SelectItem>
                        <SelectItem value="in-progress"><div className="flex items-center gap-2"><IconLoader className="h-4 w-4 text-blue-500 animate-spin" /><span>In Progress</span></div></SelectItem>
                        <SelectItem value="completed"><div className="flex items-center gap-2"><IconCheck className="h-4 w-4 text-emerald-500" /><span>Completed</span></div></SelectItem>
                        <SelectItem value="scheduled"><div className="flex items-center gap-2"><IconCalendar className="h-4 w-4 text-purple-500" /><span>Scheduled</span></div></SelectItem>
                        <SelectItem value="cancelled"><div className="flex items-center gap-2"><IconX className="h-4 w-4 text-red-500" /><span>Cancelled</span></div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Internal Note</Label>
                    <Textarea
                      id="note"
                      placeholder="Describe the update or work performed..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                      className="transition-all border-primary/20 focus:ring-2 focus:ring-primary/20 bg-background/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 bg-muted/30 border-t backdrop-blur-md">
            <SheetFooter className="items-center justify-end gap-3 flex-row">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">Close Details</Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={!selectedStatus || selectedStatus === record.status}
                className="flex-1 sm:flex-none px-8 font-bold shadow-lg shadow-primary/20"
              >
                Sync Changes
              </Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
