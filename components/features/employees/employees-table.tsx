"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  Box,
  Briefcase,
  Building2,
  Check,
  Edit2,
  History,
  Mail,
  MoreHorizontal,
  Plus,
  Trash2,
  User,
  UserPlus,
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { EmployeeAssetsDialog } from "./employee-assets-dialog";
import { EmployeeDetailSheet } from "./employee-detail-sheet";
import { BaseDataTable } from "@/components/shared/base-data-table";

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  type Employee,
} from "@/services/employee-service";

// ----------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function EmployeesTable() {
  // --- State Managment ---
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
        toast.error("Failed to load employees");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // --- Dialog States ---
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(
    null
  );
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [employeeToDelete, setEmployeeToDelete] =
    React.useState<Employee | null>(null);
  const [viewAssetsEmployee, setViewAssetsEmployee] = React.useState<
    string | null
  >(null);
  const [viewingEmployee, setViewingEmployee] = React.useState<Employee | null>(
    null
  );

  // --- Form Handlers ---
  const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEmployeeData: Omit<Employee, "id"> = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      department: formData.get("department") as string,
      position: formData.get("position") as string,
    };

    try {
      const newEmployee = await createEmployee(newEmployeeData);
      setEmployees((prev) => [newEmployee, ...prev]);
      setIsAddOpen(false);
      toast.success("Employee added successfully");
    } catch (error) {
      toast.error("Failed to add employee");
    }
  };

  const handleEditEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const formData = new FormData(e.currentTarget);
    const updatedData: Partial<Employee> = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      department: formData.get("department") as string,
      position: formData.get("position") as string,
    };

    try {
      const updatedEmployee = await updateEmployee(
        editingEmployee.id,
        updatedData
      );
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === editingEmployee.id ? updatedEmployee : emp
        )
      );
      setEditingEmployee(null);
      toast.success("Employee updated successfully");
    } catch (error) {
      toast.error("Failed to update employee");
    }
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    try {
      await deleteEmployee(employeeToDelete.id);
      setEmployees((prev) =>
        prev.filter((emp) => emp.id !== employeeToDelete.id)
      );
      setIsDeleteOpen(false);
      setEmployeeToDelete(null);
      toast.error("Employee deleted");
    } catch (error) {
      toast.error("Failed to delete employee");
    }
  };

  const handleBulkDelete = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);

    try {
      await Promise.all(selectedIds.map((id) => deleteEmployee(id)));
      setEmployees((prev) =>
        prev.filter((emp) => !selectedIds.includes(emp.id))
      );
      setRowSelection({});
      toast.error(`${selectedIds.length} employees deleted`);
    } catch (error) {
      toast.error("Failed to delete some employees");
    }
  };

  // --- Column Definitions ---

  const columns = React.useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "fullName",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3 h-8 hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          </Button>
        ),
        cell: ({ row }) => {
          const name = row.original.fullName;
          const email = row.original.email;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${name}`}
                  alt={name}
                />
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground/90 leading-none mb-1">
                  {name}
                </span>
                <span className="text-xs text-muted-foreground">{email}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "department",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3 h-8 hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Department
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          </Button>
        ),
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className="font-medium bg-secondary/50 hover:bg-secondary/70 transition-colors"
          >
            {row.getValue("department")}
          </Badge>
        ),
      },
      {
        accessorKey: "position",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3 h-8 hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Position
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center text-sm text-foreground/70 italic">
            {row.getValue("position")}
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={() => setEditingEmployee(row.original)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                setEmployeeToDelete(row.original);
                setIsDeleteOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(row.original.email)
                  }
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Copy Email
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setViewAssetsEmployee(row.original.fullName)}
                >
                  <Box className="mr-2 h-4 w-4" />
                  View Assets
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    []
  );

  // --- Table Instance ---

  const table = useReactTable({
    data: employees,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  // --- Render ---

  const hasSelected = Object.keys(rowSelection).length > 0;

  return (
    <div className="space-y-4">
      <BaseDataTable
        table={table}
        data={employees}
        columns={columns}
        searchKey="fullName"
        onRowClick={(employee) => setViewingEmployee(employee)}
        renderCustomActions={(table) => (
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {hasSelected && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="h-10 px-4 shadow-lg shadow-destructive/20"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({Object.keys(rowSelection).length})
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
              <Button
                onClick={() => setIsAddOpen(true)}
                className="h-10 px-4 bg-linear-to-r from-primary to-primary/80 hover:to-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
              <SheetContent
                side="right"
                className="w-full sm:max-w-[450px] p-0 flex flex-col"
              >
                <SheetHeader className="p-6 border-b bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm">
                      <UserPlus className="h-6 w-6" />
                    </div>
                    <div>
                      <SheetTitle>Add New Employee</SheetTitle>
                      <SheetDescription>
                        Create a new employee profile in the system.
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>
                <form
                  onSubmit={handleAddEmployee}
                  className="flex-1 flex flex-col h-full overflow-hidden"
                >
                  <ScrollArea className="flex-1">
                    <div className="p-6 space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="fullName"
                            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                          >
                            Full Name
                          </Label>
                          <Input
                            id="fullName"
                            name="fullName"
                            placeholder="e.g. Michael Scott"
                            required
                            className="h-11 focus:ring-1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                          >
                            Work Email
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="e.g. michael@dundermifflin.com"
                            required
                            className="h-11 focus:ring-1"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="department"
                              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                            >
                              Department
                            </Label>
                            <Input
                              id="department"
                              name="department"
                              placeholder="e.g. Sales"
                              required
                              className="h-11 focus:ring-1"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="position"
                              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                            >
                              Position
                            </Label>
                            <Input
                              id="position"
                              name="position"
                              placeholder="e.g. Manager"
                              required
                              className="h-11 focus:ring-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                  <SheetFooter className="p-6 border-t bg-muted/10 items-center justify-end gap-3 flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddOpen(false)}
                      className="flex-1 sm:flex-none"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 sm:flex-none px-8 font-bold"
                    >
                      Create Profile
                    </Button>
                  </SheetFooter>
                </form>
              </SheetContent>
            </Sheet>
          </div>
        )}
      />

      {/* Edit Employee Sheet */}
      <Sheet
        open={!!editingEmployee}
        onOpenChange={(open) => !open && setEditingEmployee(null)}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-[450px] p-0 flex flex-col border-l shadow-2xl"
        >
          {editingEmployee && (
            <>
              <SheetHeader className="p-6 border-b bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm">
                    <Edit2 className="h-6 w-6" />
                  </div>
                  <div>
                    <SheetTitle>Edit Employee</SheetTitle>
                    <SheetDescription>
                      Update profile information for{" "}
                      <span className="font-semibold text-foreground">
                        {editingEmployee.fullName}
                      </span>
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>
              <form
                onSubmit={handleEditEmployee}
                className="flex-1 flex flex-col h-full overflow-hidden"
              >
                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="edit-fullName"
                          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          Full Name
                        </Label>
                        <Input
                          id="edit-fullName"
                          name="fullName"
                          defaultValue={editingEmployee.fullName}
                          required
                          className="h-11 focus:ring-1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="edit-email"
                          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          Work Email
                        </Label>
                        <Input
                          id="edit-email"
                          name="email"
                          type="email"
                          defaultValue={editingEmployee.email}
                          required
                          className="h-11 focus:ring-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="edit-department"
                            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                          >
                            Department
                          </Label>
                          <Input
                            id="edit-department"
                            name="department"
                            defaultValue={editingEmployee.department}
                            required
                            className="h-11 focus:ring-1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="edit-position"
                            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                          >
                            Position
                          </Label>
                          <Input
                            id="edit-position"
                            name="position"
                            defaultValue={editingEmployee.position}
                            required
                            className="h-11 focus:ring-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <History className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Account Stats
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground leading-none">
                            ID
                          </span>
                          <span className="font-mono">{editingEmployee.id}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground leading-none">
                            Joined
                          </span>
                          <span>Jan 2024</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <SheetFooter className="p-6 border-t bg-muted/10 items-center justify-end gap-3 flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingEmployee(null)}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 sm:flex-none px-8 font-bold"
                  >
                    Save Changes
                  </Button>
                </SheetFooter>
              </form>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Sheet */}
      <Sheet open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[400px] p-0 flex flex-col border-l shadow-2xl"
        >
          <SheetHeader className="p-6 border-b bg-destructive/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive shadow-sm">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <SheetTitle className="text-destructive">
                  Delete Employee
                </SheetTitle>
                <SheetDescription>
                  This action is permanent and cannot be undone.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <div className="flex-1 p-6 space-y-6">
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex gap-4">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-destructive text-sm">
                  Are you sure?
                </p>
                <p className="text-xs text-destructive/80 leading-relaxed">
                  Removing <strong>{employeeToDelete?.fullName}</strong> will
                  also clear their asset associations and access logs.
                </p>
              </div>
            </div>

            {employeeToDelete && (
              <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/30">
                <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${employeeToDelete.fullName}`}
                  />
                  <AvatarFallback>
                    {getInitials(employeeToDelete.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-bold">{employeeToDelete.fullName}</span>
                  <span className="text-xs text-muted-foreground">
                    {employeeToDelete.email}
                  </span>
                </div>
              </div>
            )}
          </div>
          <SheetFooter className="p-6 border-t bg-muted/10 items-center justify-end gap-3 flex-row">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteEmployee}
              variant="destructive"
              className="flex-1 sm:flex-none font-bold shadow-lg shadow-destructive/20"
            >
              Confirm Deletion
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Employee Assets Dialog */}
      <EmployeeAssetsDialog
        employeeName={viewAssetsEmployee}
        open={!!viewAssetsEmployee}
        onOpenChange={(open) => !open && setViewAssetsEmployee(null)}
      />

      {/* View Employee Detail Sheet */}
      <EmployeeDetailSheet
        employee={viewingEmployee}
        open={!!viewingEmployee}
        onOpenChange={(open) => !open && setViewingEmployee(null)}
      />
    </div>
  );
}
