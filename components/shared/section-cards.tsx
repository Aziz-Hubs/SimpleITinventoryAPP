"use client";

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
import { DashboardStats } from "@/lib/types";

interface SectionCardsProps {
  stats: DashboardStats;
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

export function SectionCards({ stats }: SectionCardsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-4 px-4 lg:px-6 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4"
    >
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="@container/card h-full cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/40">
          <CardHeader>
            <CardDescription className="text-indigo-600/80 dark:text-indigo-400/80 font-medium">Total Assets</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
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
              {stats.totalAssets.assigned} assigned, {stats.totalAssets.inStock}{" "}
              in stock
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div
        variants={itemVariants}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="@container/card h-full cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40">
          <CardHeader>
            <CardDescription className="text-emerald-600/80 dark:text-emerald-400/80 font-medium">Deployment Rate</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
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

      <motion.div
        variants={itemVariants}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="@container/card h-full cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md bg-sky-500/5 border-sky-500/20 hover:border-sky-500/40">
          <CardHeader>
            <CardDescription className="text-sky-600/80 dark:text-sky-400/80 font-medium">Ready for Issue</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
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

      <motion.div
        variants={itemVariants}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="@container/card h-full cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40">
          <CardHeader>
            <CardDescription className="text-rose-600/80 dark:text-rose-400/80 font-medium">Requires Attention</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
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
    </motion.div>
  );
}
