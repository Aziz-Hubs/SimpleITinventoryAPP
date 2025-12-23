/**
 * @file section-cards.tsx
 * @description Interactive dashboard header component.
 * Displays high-level KPIs as animated Glassmorphism cards. Each card acts as a
 * trigger to open a detailed drill-down modal containing specific charts.
 * @path /components/shared/section-cards.tsx
 */

"use client";

import { useState } from "react";
import { AlertCircle, Box, CheckCircle2, Server } from "lucide-react";
import { motion } from "framer-motion";

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardStats, Asset } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AssetsCategoryChart,
  DeploymentStatusChart,
  ReadyStockChart,
} from "./assets-charts";
import { MaintenancePriorityList } from "@/components/features/dashboard/maintenance-priority-list";
import { ViewAssetSheet } from "@/components/features/inventory/view-asset-sheet";

/**
 * Props for the SectionCards overview group.
 */
interface SectionCardsProps {
  /** Aggregated KPI data. */
  stats: DashboardStats;
  /** Raw assets for populating the drill-down charts. */
  assets?: Asset[];
}
/**
 * KPI Dashboard Header.
 * Renders a responsive grid of 4 cards: Total Assets, Deployment Rate,
 * Ready for Issue, and Maintenance status.
 */
export function SectionCards({
  stats,
  assets: initialAssets,
}: SectionCardsProps) {
  const assets = initialAssets || [];

  // Drill-down UI state
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [viewAsset, setViewAsset] = useState<Asset | null>(null);
  const [isViewAssetSheetOpen, setIsViewAssetSheetOpen] = useState(false);

  /** Maps internal card IDs to human-readable modal titles. */
  const getDialogTitle = () => {
    switch (selectedCard) {
      case "total":
        return "Total Assets Distribution";
      case "deployment":
        return "Deployment Status";
      case "stock":
        return "Available Stock by Category";
      case "maintenance":
        return "Maintenance Required";
      default:
        return "";
    }
  };

  /** Orchestrates which detail view to render inside the drill-down modal. */
  const renderChart = () => {
    switch (selectedCard) {
      case "total":
        return <AssetsCategoryChart assets={assets} />;
      case "deployment":
        return <DeploymentStatusChart assets={assets} />;
      case "stock":
        return <ReadyStockChart assets={assets} />;
      case "maintenance":
        return (
          <MaintenancePriorityList
            assets={assets}
            onViewDetails={(asset) => {
              setViewAsset(asset);
              setIsViewAssetSheetOpen(true);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {/* Total Assets Card */}
        <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <Card
            className="@container/card h-full cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/40"
            onClick={() => setSelectedCard("total")}
          >
            <CardHeader>
              <CardDescription className="text-indigo-600/80 dark:text-indigo-400/80 font-medium text-left">
                Total Assets
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-left">
                {stats.totalAssets.count}
              </CardTitle>
              <CardAction>
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <Server className="h-4 w-4 text-indigo-500" />
                </div>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="text-muted-foreground">
                {stats.totalAssets.assigned} assigned,{" "}
                {stats.totalAssets.inStock} in stock
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Deployment Rate Card */}
        <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <Card
            className="@container/card h-full cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40"
            onClick={() => setSelectedCard("deployment")}
          >
            <CardHeader>
              <CardDescription className="text-emerald-600/80 dark:text-emerald-400/80 font-medium text-left">
                Deployment Rate
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-left">
                {stats.deployment.percentage}%
              </CardTitle>
              <CardAction>
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="text-muted-foreground">
                {stats.deployment.count} devices currently in use
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Ready for Issue Card */}
        <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <Card
            className="@container/card h-full cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md bg-sky-500/5 border-sky-500/20 hover:border-sky-500/40"
            onClick={() => setSelectedCard("stock")}
          >
            <CardHeader>
              <CardDescription className="text-sky-600/80 dark:text-sky-400/80 font-medium text-left">
                Ready for Issue
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-left">
                {stats.stock.ready}
              </CardTitle>
              <CardAction>
                <div className="p-2 rounded-lg bg-sky-500/10">
                  <Box className="h-4 w-4 text-sky-500" />
                </div>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="text-muted-foreground">
                Available items in GOOD condition
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Maintenance / Requires Attention Card */}
        <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <Card
            className="@container/card h-full cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40"
            onClick={() => setSelectedCard("maintenance")}
          >
            <CardHeader>
              <CardDescription className="text-rose-600/80 dark:text-rose-400/80 font-medium text-left">
                Requires Attention
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-left">
                {stats.maintenance.count}
              </CardTitle>
              <CardAction>
                <div className="p-2 rounded-lg bg-rose-500/10">
                  <AlertCircle className="h-4 w-4 text-rose-500" />
                </div>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="text-muted-foreground">
                Items marked as BROKEN or FAIR
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Detail Drill-down Modal */}
      <Dialog
        open={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
      >
        <DialogContent className="max-w-3xl flex flex-col p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold tracking-tight text-left">
              {getDialogTitle()}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-[400px] w-full flex flex-col items-center justify-center">
            {renderChart()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Asset Side Sheet (Launched from Maintenance Priority List) */}
      <ViewAssetSheet
        asset={viewAsset}
        open={isViewAssetSheetOpen}
        onOpenChange={setIsViewAssetSheetOpen}
      />
    </>
  );
}
