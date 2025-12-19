import { EmployeesTable } from "@/components/features/employees/employees-table";

export default function EmployeesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 bg-muted/20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Employees List
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your team and view their details.
          </p>
        </div>
      </div>
      <EmployeesTable />
    </div>
  );
}
