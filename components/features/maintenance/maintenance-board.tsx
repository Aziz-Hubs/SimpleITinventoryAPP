"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  useDndContext,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MaintenanceRecord, MaintenanceStatus } from "@/lib/maintenance-types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SortableTicketCard } from "./sortable-ticket-card";
import { StatusUpdateDialog } from "./status-update-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconAlertTriangle, IconUser, IconCalendar } from "@tabler/icons-react";

interface MaintenanceBoardProps {
  records: MaintenanceRecord[];
  onRecordClick: (record: MaintenanceRecord) => void;
  onRefresh: () => void;
}

const COLUMNS: {
  id: MaintenanceStatus | "backlog";
  title: string;
  color: string;
}[] = [
  { id: "pending", title: "Pending Triage", color: "border-amber-500/50" },
  { id: "scheduled", title: "Scheduled", color: "border-blue-500/50" },
  { id: "in-progress", title: "In Progress", color: "border-indigo-500/50" },
  {
    id: "completed",
    title: "Recently Completed",
    color: "border-emerald-500/50",
  },
];

// Helper to get actual status from column ID (since we map backlog->pending)
const getStatusFromColumnId = (id: string): MaintenanceStatus => {
  if (id === "backlog") return "pending";
  return id as MaintenanceStatus;
};

// --- Column Component ---
function BoardColumn({
  column,
  records,
  onRecordClick,
}: {
  column: (typeof COLUMNS)[0];
  records: MaintenanceRecord[];
  onRecordClick: (record: MaintenanceRecord) => void;
}) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const { over } = useDndContext();

  const isOverColumn = over?.id === column.id;
  const isOverRecordInColumn = React.useMemo(() => {
    if (!over) return false;
    return records.some((r) => r.id.toString() === over.id.toString());
  }, [over, records]);

  const isHighlighted = isOverColumn || isOverRecordInColumn;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 min-w-[300px] flex flex-col gap-3 h-full rounded-xl border p-3 transition-colors",
        isHighlighted
          ? "bg-primary/5 border-primary ring-1 ring-primary"
          : "bg-muted/20 border-border"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between pb-2 border-b-2",
          column.color
        )}
      >
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
          {column.title}
        </h3>
        <Badge variant="secondary" className="font-mono text-xs">
          {records.length}
        </Badge>
      </div>

      <ScrollArea className="flex-1 pr-2.5 -mr-2.5">
        <div className="flex flex-col gap-3 pb-2 min-h-[100px]">
          <SortableContext
            items={records.map((r) => r.id.toString())}
            strategy={verticalListSortingStrategy}
          >
            {records.map((record) => (
              <SortableTicketCard
                key={record.id}
                record={record}
                onClick={onRecordClick}
              />
            ))}
          </SortableContext>
          {records.length === 0 && (
            <div className="h-full flex items-center justify-center text-muted-foreground/30 text-xs italic py-8 border-2 border-dashed border-muted rounded-lg">
              Drop tickets here
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// --- Main Board Component ---
export function MaintenanceBoard({
  records,
  onRecordClick,
  onRefresh,
}: MaintenanceBoardProps) {
  const [activeDragItem, setActiveDragItem] =
    React.useState<MaintenanceRecord | null>(null);

  // Status Update Dialog State
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [pendingUpdate, setPendingUpdate] = React.useState<{
    record: MaintenanceRecord;
    newStatus: MaintenanceStatus;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const record = records.find((r) => r.id.toString() === active.id);
    if (record) setActiveDragItem(record);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    // Find the record being dragged
    const activeRecord = records.find((r) => r.id.toString() === active.id);
    if (!activeRecord) return;

    // Determine target column status
    // 1. Dropped directly on a column
    let targetStatus: MaintenanceStatus | null = null;
    const overId = over.id.toString();

    const overColumn = COLUMNS.find((c) => c.id === overId);
    if (overColumn) {
      targetStatus = getStatusFromColumnId(overColumn.id);
    } else {
      // 2. Dropped on another card -> find that card's status
      const overRecord = records.find((r) => r.id.toString() === overId);
      if (overRecord) {
        targetStatus = overRecord.status;
      }
    }

    // Checking if status actually changed
    if (targetStatus && targetStatus !== activeRecord.status) {
      setPendingUpdate({
        record: activeRecord,
        newStatus: targetStatus,
      });
      setDialogOpen(true);
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-[calc(100vh-220px)] gap-4 overflow-x-auto pb-4 px-1 min-w-full">
          {COLUMNS.map((col) => {
            const columnRecords = records.filter(
              (r) => r.status === getStatusFromColumnId(col.id)
            );

            return (
              <BoardColumn
                key={col.id}
                column={col}
                records={columnRecords}
                onRecordClick={onRecordClick}
              />
            );
          })}
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeDragItem ? (
            <Card
              className={cn(
                "cursor-grabbing shadow-xl ring-2 ring-primary border-primary bg-card w-[300px]", // fixed width matching column min width roughly
                activeDragItem.priority === "critical"
                  ? "border-l-4 border-l-red-500"
                  : ""
              )}
            >
              <CardHeader className="p-3 pb-2 space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] text-muted-foreground px-1 h-5"
                  >
                    {activeDragItem.assetTag}
                  </Badge>
                  {activeDragItem.priority === "critical" && (
                    <IconAlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                  )}
                </div>
                <CardTitle className="text-sm font-medium leading-tight">
                  {activeDragItem.issue}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <IconUser className="h-3 w-3" />
                  <span>{activeDragItem.technician || "Unassigned"}</span>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      <StatusUpdateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        record={pendingUpdate?.record || null}
        newStatus={pendingUpdate?.newStatus || null}
        onConfirm={() => {
          onRefresh();
          setPendingUpdate(null);
        }}
      />
    </>
  );
}
