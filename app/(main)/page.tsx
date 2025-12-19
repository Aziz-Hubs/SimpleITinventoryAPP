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
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <SectionCards stats={stats} />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive data={chartData} />
        </div>
        <DataTable data={assets} />
      </div>
    </div>
  );
}
