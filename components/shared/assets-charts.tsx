"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  RadialBar,
  RadialBarChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { AssetLegacy } from "@/lib/types";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// --- Total Assets Chart (Horizontal Bar) ---
export function AssetsCategoryChart({ assets }: { assets: AssetLegacy[] }) {
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    assets.forEach((a) => {
      const cat = a.Category || "Unknown";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([category, count], index) => ({
        category,
        count,
        fill: `var(--chart-${(index % 5) + 1})`,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 categories
  }, [assets]);

  return (
    <div className="flex flex-col w-full">
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 20, right: 20, top: 20, bottom: 20 }}
          >
            <CartesianGrid
              horizontal={false}
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
            <XAxis type="number" hide />
            <YAxis
              dataKey="category"
              type="category"
              tickLine={false}
              axisLine={false}
              width={100}
              tick={{ fill: "var(--foreground)", fontSize: 13 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Category
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {payload[0].payload.category}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Count
                          </span>
                          <span className="font-bold">{payload[0].value}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              barSize={32}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- Deployment Status Chart (Radial / Gauge) ---
export function DeploymentStatusChart({ assets }: { assets: AssetLegacy[] }) {
  const data = useMemo(() => {
    const assigned = assets.filter(
      (a) => a.Employee && a.Employee !== "UNASSIGNED"
    ).length;
    const total = assets.length;
    const percentage = total > 0 ? Math.round((assigned / total) * 100) : 0;

    return [
      {
        name: "Deployed",
        value: percentage,
        fill: "var(--chart-2)",
      },
    ];
  }, [assets]);

  return (
    <div className="flex flex-col w-full items-center justify-center">
      <div className="h-[350px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            barSize={40}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background
              dataKey="value"
              cornerRadius={30}
              label={false}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Center Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-5xl font-bold tracking-tighter">
            {data[0].value}%
          </span>
          <span className="text-sm text-muted-foreground uppercase tracking-widest mt-2">
            Deployed
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Ready Stock Chart (Radar) ---
export function ReadyStockChart({ assets }: { assets: AssetLegacy[] }) {
  const chartData = useMemo(() => {
    // Filter for ready stock
    const ready = assets.filter(
      (a) =>
        (a.Employee === "UNASSIGNED" || !a.Employee) &&
        ["GOOD", "NEW"].includes(a.State)
    );

    // Group by Category
    const counts: Record<string, number> = {};
    ready.forEach((a) => {
      const cat = a.Category || "Unknown";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6 for Radar readability
  }, [assets]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center text-muted-foreground">
        No stock available currently.
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid strokeOpacity={0.2} />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: "var(--foreground)", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, "auto"]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Stock"
            dataKey="count"
            stroke="var(--chart-3)"
            fill="var(--chart-3)"
            fillOpacity={0.5}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        {payload[0].payload.category}
                      </span>
                      <span className="font-bold">
                        {payload[0].value} Available
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
