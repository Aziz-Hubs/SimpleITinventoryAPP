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
        <Card className="@container/card h-full cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
          <CardHeader>
            <CardDescription>Total Assets</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.totalAssets.count}
            </CardTitle>
            <CardAction>
              <Server className="h-4 w-4 text-muted-foreground" />
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
        <Card className="@container/card h-full cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
          <CardHeader>
            <CardDescription>Deployment Rate</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.deployment.percentage}%
            </CardTitle>
            <CardAction>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
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
        <Card className="@container/card h-full cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
          <CardHeader>
            <CardDescription>Ready for Issue</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.stock.ready}
            </CardTitle>
            <CardAction>
              <Box className="h-4 w-4 text-blue-500" />
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
        <Card className="@container/card h-full cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md bg-destructive/5 from-destructive/10 to-transparent">
          <CardHeader>
            <CardDescription>Requires Attention</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.maintenance.count}
            </CardTitle>
            <CardAction>
              <AlertCircle className="h-4 w-4 text-destructive" />
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
