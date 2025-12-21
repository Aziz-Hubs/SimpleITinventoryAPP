"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Asset } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Laptop,
  Monitor,
  Smartphone,
  Printer,
  Cpu,
  Activity,
  DollarSign,
  PieChart,
} from "lucide-react";

interface InventoryStatsProps {
  assets: Asset[];
  totalAssetCount?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 20,
    },
  },
};

export function InventoryStats({
  assets,
  totalAssetCount,
}: InventoryStatsProps) {
  // 1. Calculate Utilization
  const assignedCount = assets.filter(
    (a) => a.employee && a.employee !== "UNASSIGNED"
  ).length;
  const utilizationRate =
    Math.round((assignedCount / assets.length) * 100) || 0;

  // 2. Calculate Estimated Value (Mock prices)
  const getValue = (category: string | undefined) => {
    if (!category) return 100;
    switch (category.toLowerCase()) {
      case "laptop":
        return 1200;
      case "monitor":
        return 300;
      case "smartphone":
        return 800;
      case "server":
        return 5000;
      case "switch":
        return 1500;
      case "docking":
        return 200;
      case "headset":
        return 150;
      case "network":
        return 500;
      case "printer":
        return 400;
      case "desktop":
        return 1500;
      default:
        return 100;
    }
  };
  const totalValue = assets.reduce(
    (acc, curr) => acc + getValue(curr.category),
    0
  );

  // 3. Category Breakdown
  const categories = assets.reduce((acc, curr) => {
    const category = curr.category || "Unknown";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs"
    >
      {/* Card 1: Total Value (Creative Look) */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="relative overflow-hidden bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/40 h-full transition-all duration-200 hover:scale-[1.02] hover:shadow-md group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-colors duration-500" />
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-[10px] font-bold tracking-widest text-indigo-600/80 dark:text-indigo-400/80 uppercase">
                Inventory Assets
              </CardTitle>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tracking-tighter">
                  ${totalValue.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                  USD Total
                </span>
              </div>
            </div>
            <div className="p-2.5 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500 shadow-inner">
              <DollarSign className="h-5 w-5 text-indigo-500 group-hover:text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mt-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Tracked Count
                </span>
                <span className="text-lg font-bold tracking-tight">
                  {totalAssetCount ?? assets.length}{" "}
                  <small className="text-[10px] font-normal text-muted-foreground uppercase">
                    Items
                  </small>
                </span>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Activity className="h-3 w-3 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">
                    Live Audit
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Card 2: Utilization Rate */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="h-full transition-all duration-200 hover:scale-[1.02] hover:shadow-md bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600/80 dark:text-emerald-400/80">
              Utilization Rate
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Activity className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{utilizationRate}%</span>
              <span className="text-xs text-muted-foreground">
                {assignedCount}/{assets.length} Assigned
              </span>
            </div>
            <Progress value={utilizationRate} className="h-2" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Card 3: Top Categories */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        className="md:col-span-2"
      >
        <Card className="h-full transition-all duration-200 hover:scale-[1.02] hover:shadow-md bg-purple-500/5 border-purple-500/20 hover:border-purple-500/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-600/80 dark:text-purple-400/80">
              Asset Breakdown
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10">
              <PieChart className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-1">
              {topCategories.map(([cat, count]) => (
                <div
                  key={cat}
                  className="flex flex-col items-center justify-center p-2 bg-purple-500/10 rounded-lg border border-purple-500/20"
                >
                  <span className="text-2xl font-bold">{count}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {cat}s
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
