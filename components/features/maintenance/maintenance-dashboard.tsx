"use client";

import * as React from "react";
import { MaintenanceRecord, MaintenanceStatus } from "@/lib/types";
import { useMaintenanceRecords } from "@/hooks/api/use-maintenance";
import { useTableParams } from "@/hooks/use-table-params";
import { MaintenanceDialog } from "./maintenance-dialog";
import { MaintenanceDetailSheet } from "./maintenance-detail-sheet";
import { MaintenanceToolbar } from "./maintenance-toolbar";
import { MaintenanceBoard } from "./maintenance-board";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconSearch,
  IconTool,
  IconFingerprint,
  IconTag,
  IconAlertCircle,
  IconStack,
  IconLoader,
  IconCalendar,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export function MaintenanceDashboard() {
  const { params, setParams } = useTableParams();

  const {
    data: response,
    isLoading: loading,
    refetch,
  } = useMaintenanceRecords({
    search: params.search,
    status: params.state as MaintenanceStatus,
  });

  const records = response?.data || [];

  const search = params.search;
  const statusFilter = params.state as MaintenanceStatus | "all";
  const viewMode = (params.tab as "list" | "board") || "board";

  const setViewMode = (mode: "list" | "board") => setParams({ tab: mode });
  const setSearch = (s: string) => setParams({ search: s, page: 1 });
  const setStatusFilter = (s: MaintenanceStatus | "all") =>
    setParams({ state: s, page: 1 });

  // Dialog/Sheet states
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedRecord, setSelectedRecord] =
    React.useState<MaintenanceRecord | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const filteredRecords = React.useMemo(() => {
    // Note: The hook already filters if implemented in service,
    // but for mock demo we might still do some client-side or rely on hook data.
    // If the hook returns already filtered data, we just use it.
    return records;
  }, [records]);

  const handleCreateSuccess = () => {
    // Success is handled by mutation callbacks in the dialog usually,
    // but we can trigger invalidation if needed. Hook already handles success toast.
  };

  const handleUpdate = () => {
    // Invalidation handled by mutation hooks
  };

  const handleRowClick = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setIsSheetOpen(true);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col">
      {/* Main Content Area */}
      <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-xl bg-background/50 backdrop-blur-xs">
        <CardHeader className="border-b bg-muted/20 p-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <IconTool className="h-6 w-6 text-primary" />
              Maintenance Console
            </h2>
            <p className="text-sm text-muted-foreground/80">
              Manage, track, and resolve maintenance tickets for all assets.
            </p>
          </div>
          <MaintenanceToolbar
            viewMode={viewMode}
            onViewChange={setViewMode}
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onRefresh={() => refetch()}
            onCreate={() => setIsDialogOpen(true)}
            loading={loading}
          />
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          {viewMode === "list" ? (
            <div className="h-full overflow-auto p-6">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="pl-6">
                      <div className="flex items-center gap-2">
                        <IconFingerprint className="h-4 w-4" />
                        ID
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <IconTag className="h-4 w-4" />
                        Asset Tag
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <IconAlertCircle className="h-4 w-4" />
                        Issue
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <IconStack className="h-4 w-4" />
                        Status
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <IconLoader className="h-4 w-4" />
                        Priority
                      </div>
                    </TableHead>
                    {/* Technician column hidden as per requirement */}
                    <TableHead className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <IconCalendar className="h-4 w-4" />
                        Date
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <TableRow
                        key={record.id}
                        className="cursor-pointer hover:bg-muted/30 transition-colors border-b last:border-0"
                        onClick={() => handleRowClick(record)}
                      >
                        <TableCell className="font-medium pl-6">
                          {record.id}
                        </TableCell>
                        <TableCell>{record.assetTag}</TableCell>
                        <TableCell
                          className="max-w-[250px] truncate"
                          title={record.issue}
                        >
                          {record.issue}
                        </TableCell>
                        <TableCell>
                          <StatusBadge variant={record.status}>
                            {record.status.replace("-", " ").toUpperCase()}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge variant={record.priority}>
                            {record.priority.toUpperCase()}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          {record.reportedDate}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <IconSearch className="h-8 w-8 mb-2 opacity-20" />
                          <p>
                            No maintenance records found fitting your criteria.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="h-full bg-muted/10 p-4 overflow-hidden">
              <MaintenanceBoard
                records={filteredRecords}
                onRecordClick={handleRowClick}
                onRefresh={() => refetch()}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <MaintenanceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <MaintenanceDetailSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        record={selectedRecord}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
