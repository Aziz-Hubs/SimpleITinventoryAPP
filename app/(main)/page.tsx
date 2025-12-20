import { ChartAreaInteractive } from "@/components/shared/chart-area-interactive";
import { DataTable } from "@/components/shared/data-table";
import { SectionCards } from "@/components/shared/section-cards";
import {
  getAssets,
  getChartData,
  getDashboardStats,
} from "@/services/dashboard-service";

export default async function Page() {
  const assets = await getAssets();
  const chartData = await getChartData();
  const stats = await getDashboardStats();

  return (
    <div className="@container/main flex flex-1 flex-col gap-8 p-8 max-w-(--breakpoint-2xl) mx-auto w-full">
      <SectionCards stats={stats} assets={assets} />
      <ChartAreaInteractive data={chartData} />
      <DataTable
        data={assets}
        title="Recent Assets"
        description="A comprehensive overview of the latest hardware and equipment in your inventory."
      />
    </div>
  );
}
