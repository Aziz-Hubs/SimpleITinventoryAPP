"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconPlus,
  IconTrash,
  IconUserPlus,
  IconUserMinus,
  IconRefresh,
  IconTool,
  IconList,
  IconFilter,
  IconSearch,
  IconDownload,
  IconClock,
  IconCheck,
  IconCalendar,
  IconLoader,
  IconStack,
  IconFingerprint,
  IconTag,
  IconAlertCircle,
  IconId,
  IconEdit,
  IconX,
  IconAlertTriangle,
  IconInfoCircle,
} from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  OnboardAssetDialog,
  OffboardAssetDialog,
  AssignAssetDialog,
  UnassignAssetDialog,
  ReassignAssetDialog,
} from "@/components/features/deployment/operation-forms";
import { MaintenanceDialog } from "@/components/features/maintenance/maintenance-dialog";
import { BulkUpdateDialog } from "@/components/features/maintenance/bulk-update-dialog";
import { MaintenanceDetailSheet } from "@/components/features/maintenance/maintenance-detail-sheet";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  getMaintenanceRecords,
  updateMaintenanceRecord,
  exportMaintenanceReport,
} from "@/services/maintenance-service";
import type { MaintenanceRecord } from "@/lib/maintenance-types";

export default function DeploymentOperationsPage() {
  const [onboardOpen, setOnboardOpen] = React.useState(false);
  const [offboardOpen, setOffboardOpen] = React.useState(false);
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [unassignOpen, setUnassignOpen] = React.useState(false);
  const [reassignOpen, setReassignOpen] = React.useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = React.useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false);
  const [selectedRecord, setSelectedRecord] =
    React.useState<MaintenanceRecord | null>(null);

  const [maintenanceRecords, setMaintenanceRecords] = React.useState<
    MaintenanceRecord[]
  >([]);
  const [filteredRecords, setFilteredRecords] = React.useState<
    MaintenanceRecord[]
  >([]);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [priorityFilter, setPriorityFilter] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRecordIds, setSelectedRecordIds] = React.useState<Set<string>>(
    new Set()
  );
  const [bulkUpdateOpen, setBulkUpdateOpen] = React.useState(false);

  const loadMaintenanceRecords = React.useCallback(async () => {
    const records = await getMaintenanceRecords();
    setMaintenanceRecords(records);
    setFilteredRecords(records);
  }, []);

  React.useEffect(() => {
    loadMaintenanceRecords();
  }, [loadMaintenanceRecords]);

  React.useEffect(() => {
    let filtered = maintenanceRecords;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((record) => record.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.assetTag.toLowerCase().includes(query) ||
          record.issue.toLowerCase().includes(query) ||
          record.assetCategory.toLowerCase().includes(query)
      );
    }

    setFilteredRecords(filtered);
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((record) => record.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      filtered = filtered.filter((record) => record.priority === priorityFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.assetTag.toLowerCase().includes(query) ||
          record.issue.toLowerCase().includes(query) ||
          record.assetCategory.toLowerCase().includes(query)
      );
    }

    setFilteredRecords(filtered);
    // Clear selection when filters change
    setSelectedRecordIds(new Set());
  }, [maintenanceRecords, statusFilter, priorityFilter, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedRecordIds.size === filteredRecords.length && filteredRecords.length > 0) {
      setSelectedRecordIds(new Set());
    } else {
      setSelectedRecordIds(new Set(filteredRecords.map((r) => r.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const newSelected = new Set(selectedRecordIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecordIds(newSelected);
  };

  const handleBulkUpdate = async (updates: { status?: string; priority?: string }) => {
    const promises = Array.from(selectedRecordIds).map((id) =>
      updateMaintenanceRecord(id, updates as any)
    );
    await Promise.all(promises);
    loadMaintenanceRecords();
    setSelectedRecordIds(new Set());
  };

  const handleRecordClick = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setDetailSheetOpen(true);
  };

  const handleExport = async () => {
    const csv = await exportMaintenanceReport(filteredRecords);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `maintenance-report-${new Date().toISOString().split("T")[0]
      }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCategoryStats = () => {
    const stats = {
      hardware: 0,
      software: 0,
      network: 0,
    };

    maintenanceRecords.forEach((record) => {
      if (record.category in stats) {
        stats[record.category as keyof typeof stats]++;
      }
    });

    return stats;
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Deployment Operations
          </h2>
          <p className="text-muted-foreground">
            Manage asset lifecycle and track maintenance operations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card
          className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg bg-emerald-500/5 from-emerald-500/10 to-card border-emerald-500/20 hover:border-emerald-500/40"
          onClick={() => setOnboardOpen(true)}
        >
          <CardHeader>
            <CardDescription className="text-emerald-600/80 dark:text-emerald-400/80 font-medium">
              New Asset
            </CardDescription>
            <CardTitle className="text-xl font-bold">Onboard</CardTitle>
            <CardAction>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <IconPlus className="h-5 w-5 text-emerald-500" />
              </div>
            </CardAction>
          </CardHeader>
          <CardFooter>
            <div className="text-muted-foreground text-sm">
              Add new inventory
            </div>
          </CardFooter>
        </Card>

        <Card
          className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg bg-rose-500/5 from-rose-500/10 to-card border-rose-500/20 hover:border-rose-500/40"
          onClick={() => setOffboardOpen(true)}
        >
          <CardHeader>
            <CardDescription className="text-rose-600/80 dark:text-rose-400/80 font-medium">
              Retire Asset
            </CardDescription>
            <CardTitle className="text-xl font-bold">Offboard</CardTitle>
            <CardAction>
              <div className="p-2 rounded-lg bg-rose-500/10">
                <IconTrash className="h-5 w-5 text-rose-500" />
              </div>
            </CardAction>
          </CardHeader>
          <CardFooter>
            <div className="text-muted-foreground text-sm">
              Dispose or recycle
            </div>
          </CardFooter>
        </Card>

        <Card
          className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg bg-indigo-500/5 from-indigo-500/10 to-card border-indigo-500/20 hover:border-indigo-500/40"
          onClick={() => setAssignOpen(true)}
        >
          <CardHeader>
            <CardDescription className="text-indigo-600/80 dark:text-indigo-400/80 font-medium">
              Distribution
            </CardDescription>
            <CardTitle className="text-xl font-bold">Assign</CardTitle>
            <CardAction>
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <IconUserPlus className="h-5 w-5 text-indigo-500" />
              </div>
            </CardAction>
          </CardHeader>
          <CardFooter>
            <div className="text-muted-foreground text-sm">
              Issue to employee
            </div>
          </CardFooter>
        </Card>

        <Card
          className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg bg-amber-500/5 from-amber-500/10 to-card border-amber-500/20 hover:border-amber-500/40"
          onClick={() => setUnassignOpen(true)}
        >
          <CardHeader>
            <CardDescription className="text-amber-600/80 dark:text-amber-400/80 font-medium">
              Collection
            </CardDescription>
            <CardTitle className="text-xl font-bold">Unassign</CardTitle>
            <CardAction>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <IconUserMinus className="h-5 w-5 text-amber-500" />
              </div>
            </CardAction>
          </CardHeader>
          <CardFooter>
            <div className="text-muted-foreground text-sm">Return to stock</div>
          </CardFooter>
        </Card>

        <Card
          className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg bg-purple-500/5 from-purple-500/10 to-card border-purple-500/20 hover:border-purple-500/40"
          onClick={() => setReassignOpen(true)}
        >
          <CardHeader>
            <CardDescription className="text-purple-600/80 dark:text-purple-400/80 font-medium">
              Transfer
            </CardDescription>
            <CardTitle className="text-xl font-bold">Reassign</CardTitle>
            <CardAction>
              <div className="p-2 rounded-lg bg-purple-500/10">
                <IconRefresh className="h-5 w-5 text-purple-500" />
              </div>
            </CardAction>
          </CardHeader>
          <CardFooter>
            <div className="text-muted-foreground text-sm">User to user</div>
          </CardFooter>
        </Card>

        <Card
          className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg bg-sky-500/5 from-sky-500/10 to-card border-sky-500/20 hover:border-sky-500/40"
          onClick={() => setMaintenanceOpen(true)}
        >
          <CardHeader>
            <CardDescription className="text-sky-600/80 dark:text-sky-400/80 font-medium">
              Service Request
            </CardDescription>
            <CardTitle className="text-xl font-bold">Maintenance</CardTitle>
            <CardAction>
              <div className="p-2 rounded-lg bg-sky-500/10">
                <IconTool className="h-5 w-5 text-sky-500" />
              </div>
            </CardAction>
          </CardHeader>
          <CardFooter>
            <div className="text-muted-foreground text-sm">Create request</div>
          </CardFooter>
        </Card>
      </div>

      <OnboardAssetDialog open={onboardOpen} onOpenChange={setOnboardOpen} />
      <OffboardAssetDialog open={offboardOpen} onOpenChange={setOffboardOpen} />
      <AssignAssetDialog open={assignOpen} onOpenChange={setAssignOpen} />
      <UnassignAssetDialog open={unassignOpen} onOpenChange={setUnassignOpen} />
      <ReassignAssetDialog open={reassignOpen} onOpenChange={setReassignOpen} />
      <MaintenanceDialog
        open={maintenanceOpen}
        onOpenChange={setMaintenanceOpen}
        onSuccess={loadMaintenanceRecords}
      />
      <BulkUpdateDialog
        open={bulkUpdateOpen}
        onOpenChange={setBulkUpdateOpen}
        selectedCount={selectedRecordIds.size}
        onConfirm={handleBulkUpdate}
      />
      <MaintenanceDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        record={selectedRecord}
        onUpdate={loadMaintenanceRecords}
      />

      <Tabs defaultValue="maintenance-notes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="maintenance-notes">
            <IconTool className="mr-2 h-4 w-4" />
            Maintenance Tracker
          </TabsTrigger>
          <TabsTrigger value="categorized-items">
            <IconList className="mr-2 h-4 w-4" />
            Category Overview
          </TabsTrigger>
        </TabsList>
        <TabsContent value="maintenance-notes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Maintenance Records</CardTitle>
                <CardDescription>
                  Review and manage maintenance requests and updates.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assets..."
                    className="pl-8 w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <IconStack className="h-4 w-4" />
                        <span>All Status</span>
                      </div>
                    </SelectItem>
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
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <IconStack className="h-4 w-4" />
                        <span>All Priority</span>
                      </div>
                    </SelectItem>
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
                {selectedRecordIds.size > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="sm">
                        <IconEdit className="mr-2 h-4 w-4" />
                        Bulk Edit ({selectedRecordIds.size})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setBulkUpdateOpen(true)}>
                        <IconEdit className="mr-2 h-4 w-4" /> Update Selected
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setSelectedRecordIds(new Set())}
                      >
                        <IconX className="mr-2 h-4 w-4" /> Clear Selection
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <IconDownload className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedRecordIds.size === filteredRecords.length && filteredRecords.length > 0}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>
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
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <IconId className="h-4 w-4" />
                        Technician
                      </div>
                    </TableHead>
                    <TableHead className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <IconCalendar className="h-4 w-4" />
                        Date
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground"
                      >
                        No maintenance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow
                        key={record.id}
                        className="group cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRecordClick(record)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedRecordIds.has(record.id)}
                            onCheckedChange={() => toggleSelectOne(record.id)}
                            aria-label={`Select ${record.id}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {record.id}
                        </TableCell>
                        <TableCell>{record.assetTag}</TableCell>
                        <TableCell>{record.issue}</TableCell>
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
                        <TableCell>
                          {record.technician || "Unassigned"}
                        </TableCell>
                        <TableCell className="text-right">
                          {record.reportedDate}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categorized-items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance by Category</CardTitle>
              <CardDescription>
                View maintenance items grouped by issue category.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs">
                  <Card className="bg-primary/5 border-primary/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-primary">
                        Hardware Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {categoryStats.hardware}
                      </div>
                      <div className="w-full bg-primary/20 h-2 rounded-full mt-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (categoryStats.hardware /
                                maintenanceRecords.length) *
                              100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Physical component issues
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-500/5 border-blue-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-blue-500">
                        Software Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {categoryStats.software}
                      </div>
                      <div className="w-full bg-blue-500/20 h-2 rounded-full mt-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (categoryStats.software /
                                maintenanceRecords.length) *
                              100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        OS and application problems
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-500/5 border-green-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-green-500">
                        Network Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {categoryStats.network}
                      </div>
                      <div className="w-full bg-green-500/20 h-2 rounded-full mt-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (categoryStats.network /
                                maintenanceRecords.length) *
                              100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Connectivity problems
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead>In Progress</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {["hardware", "software", "network"].map((category) => {
                      const categoryRecords = maintenanceRecords.filter(
                        (r) => r.category === category
                      );
                      const pending = categoryRecords.filter(
                        (r) => r.status === "pending"
                      ).length;
                      const inProgress = categoryRecords.filter(
                        (r) => r.status === "in-progress"
                      ).length;
                      const completed = categoryRecords.filter(
                        (r) => r.status === "completed"
                      ).length;

                      return (
                        <TableRow key={category}>
                          <TableCell className="font-medium capitalize">
                            {category}
                          </TableCell>
                          <TableCell>{categoryRecords.length}</TableCell>
                          <TableCell>
                            <StatusBadge variant="pending">
                              {pending}
                            </StatusBadge>
                          </TableCell>
                          <TableCell>
                            <StatusBadge variant="in-progress">
                              {inProgress}
                            </StatusBadge>
                          </TableCell>
                          <TableCell>
                            <StatusBadge variant="completed">
                              {completed}
                            </StatusBadge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div >
  );
}
