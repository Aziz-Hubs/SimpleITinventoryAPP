import { MaintenanceDashboard } from "@/components/features/maintenance/maintenance-dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance Console | Simple IT Inventory",
  description: "Track and manage maintenance tickets for your IT assets.",
};

export default function MaintenancePage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <MaintenanceDashboard />
    </div>
  );
}
