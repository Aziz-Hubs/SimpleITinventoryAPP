"use client";

import * as React from "react";
import {
  ArrowUpDown,
  ChevronDown,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  Trash2,
  User,
  Edit2,
  Check,
  X,
  Box,
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
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { EmployeeAssetsDialog } from "./employee-assets-dialog";

// ----------------------------------------------------------------------
// Types & Schemas
// ----------------------------------------------------------------------

export const employeeSchema = z.object({
  id: z.string(),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
});

export type Employee = z.infer<typeof employeeSchema>;

// ----------------------------------------------------------------------
// Mock Data
// ----------------------------------------------------------------------

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "EMP-001",
    fullName: "Alice Johnson",
    email: "alice.johnson@acme.inc",
    department: "Engineering",
    position: "Senior Frontend Engineer",
  },
  {
    id: "EMP-002",
    fullName: "Bob Smith",
    email: "bob.smith@acme.inc",
    department: "Engineering",
    position: "Backend Developer",
  },
  {
    id: "EMP-003",
    fullName: "Charlie Davis",
    email: "charlie.davis@acme.inc",
    department: "Design",
    position: "Product Designer",
  },
  {
    id: "EMP-004",
    fullName: "Diana Evans",
    email: "diana.evans@acme.inc",
    department: "Product",
    position: "Product Manager",
  },
  {
    id: "EMP-005",
    fullName: "Evan Wright",
    email: "evan.wright@acme.inc",
    department: "Marketing",
    position: "Marketing Specialist",
  },
  {
    id: "EMP-006",
    fullName: "Fiona Scott",
    email: "fiona.scott@acme.inc",
    department: "HR",
    position: "HR Manager",
  },
  {
    id: "EMP-007",
    fullName: "George Baker",
    email: "george.baker@acme.inc",
    department: "Sales",
    position: "Sales Representative",
  },
  {
    id: "EMP-008",
    fullName: "Hannah Clark",
    email: "hannah.clark@acme.inc",
    department: "Support",
    position: "Customer Support Lead",
  },
  {
    id: "EMP-009",
    fullName: "Ian Hall",
    email: "ian.hall@acme.inc",
    department: "IT",
    position: "System Administrator",
  },
  {
    id: "EMP-010",
    fullName: "Julia King",
    email: "julia.king@acme.inc",
    department: "Finance",
    position: "Financial Analyst",
  },
];

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

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export function EmployeesTable() {
  // --- State Managment ---
  const [employees, setEmployees] =
    React.useState<Employee[]>(INITIAL_EMPLOYEES);
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

  // --- Form Handlers ---
  const handleAddEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEmployee: Employee = {
      id: `EMP-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      department: formData.get("department") as string,
      position: formData.get("position") as string,
    };

    setEmployees((prev) => [newEmployee, ...prev]);
    setIsAddOpen(false);
    toast.success("Employee added successfully");
  };

  const handleEditEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const formData = new FormData(e.currentTarget);
    const updatedEmployee: Employee = {
      ...editingEmployee,
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      department: formData.get("department") as string,
      position: formData.get("position") as string,
    };

    setEmployees((prev) =>
      prev.map((emp) => (emp.id === editingEmployee.id ? updatedEmployee : emp))
    );
    setEditingEmployee(null);
    toast.success("Employee updated successfully");
  };

  const handleDeleteEmployee = () => {
    if (!employeeToDelete) return;

    setEmployees((prev) =>
      prev.filter((emp) => emp.id !== employeeToDelete.id)
    );
    setIsDeleteOpen(false);
    setEmployeeToDelete(null);
    toast.error("Employee deleted");
  };

  const handleBulkDelete = () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);
    setEmployees((prev) => prev.filter((emp) => !selectedIds.includes(emp.id)));
    setRowSelection({});
    toast.error(`${selectedIds.length} employees deleted`);
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
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
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
        header: "Department",
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
        header: "Position",
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
      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Filter employees..."
              value={
                (table.getColumn("fullName")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("fullName")?.setFilterValue(event.target.value)
              }
              className="h-10 w-[200px] pl-10 lg:w-[350px] bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/50 transition-all shadow-inner"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-3 bg-muted/20 border-border/50"
              >
                <Settings2 className="mr-2 h-4 w-4" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 px-4 bg-linear-to-r from-primary to-primary/80 hover:to-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleAddEmployee}>
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>
                    Create a new employee profile. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="fullName"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="John Doe"
                      required
                      className="bg-muted/30 border-none shadow-inner h-11"
                    />
                  </div>
                  <div className="grid gap-2">
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
                      placeholder="john@acme.inc"
                      required
                      className="bg-muted/30 border-none shadow-inner h-11"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label
                        htmlFor="department"
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                      >
                        Department
                      </Label>
                      <Input
                        id="department"
                        name="department"
                        placeholder="Engineering"
                        required
                        className="bg-muted/30 border-none shadow-inner h-11"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label
                        htmlFor="position"
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                      >
                        Position
                      </Label>
                      <Input
                        id="position"
                        name="position"
                        placeholder="Developer"
                        required
                        className="bg-muted/30 border-none shadow-inner h-11"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsAddOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary px-8">
                    Create Profile
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table Container */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="hover:bg-transparent border-none"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-4"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          <AnimatePresence initial={false}>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <motion.tr
                  key={row.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "group transition-colors border-b border-border/30 hover:bg-muted/30",
                    row.getIsSelected() && "bg-primary/5 hover:bg-primary/10"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <User className="h-8 w-8 opacity-20" />
                    <p>No employees found matching your search.</p>
                    <Button
                      variant="link"
                      onClick={() => table.resetColumnFilters()}
                    >
                      Clear filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </AnimatePresence>
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2 py-4">
        <div className="text-sm text-muted-foreground font-medium">
          Showing{" "}
          <span className="text-foreground">
            {table.getFilteredRowModel().rows.length}
          </span>{" "}
          employees
          {hasSelected && (
            <>
              {" "}
              ·{" "}
              <span className="text-primary">
                {Object.keys(rowSelection).length} selected
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-9 w-9 bg-card border-border/50"
          >
            <ChevronDown className="h-4 w-4 rotate-90" />
          </Button>
          <div className="flex items-center gap-1 mx-2">
            <span className="text-sm font-medium">Page</span>
            <span className="text-sm font-bold bg-muted px-2 py-0.5 rounded text-primary">
              {table.getState().pagination.pageIndex + 1}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              of {table.getPageCount()}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-9 w-9 bg-card border-border/50"
          >
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingEmployee}
        onOpenChange={(open) => !open && setEditingEmployee(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          {editingEmployee && (
            <form onSubmit={handleEditEmployee}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit2 className="h-5 w-5 text-primary" />
                  Edit Employee Profile
                </DialogTitle>
                <DialogDescription>
                  Make changes to {editingEmployee.fullName}'s information.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="grid gap-2">
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
                    className="bg-muted/30 border-none shadow-inner h-11"
                  />
                </div>
                <div className="grid gap-2">
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
                    className="bg-muted/30 border-none shadow-inner h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
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
                      className="bg-muted/30 border-none shadow-inner h-11"
                    />
                  </div>
                  <div className="grid gap-2">
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
                      className="bg-muted/30 border-none shadow-inner h-11"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingEmployee(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary px-8">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Employee?
            </DialogTitle>
            <DialogDescription className="py-4">
              This will permanently remove{" "}
              <strong>{employeeToDelete?.fullName}</strong> from the system.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEmployee}
              className="px-8"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Assets Dialog */}
      <EmployeeAssetsDialog
        employeeName={viewAssetsEmployee}
        open={!!viewAssetsEmployee}
        onOpenChange={(open) => !open && setViewAssetsEmployee(null)}
      />
    </div>
  );
}
