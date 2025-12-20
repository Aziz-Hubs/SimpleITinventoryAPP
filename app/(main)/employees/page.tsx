import { EmployeesTable } from "@/components/features/employees/employees-table";

export default function EmployeesPage() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-8 max-w-(--breakpoint-2xl) mx-auto w-full">
      <EmployeesTable
        title="Employees List"
        description="Manage your team and view their details."
      />
    </div>
  );
}
