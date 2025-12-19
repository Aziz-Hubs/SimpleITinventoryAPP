"use client";

import Link from "next/link";
import {
  IconCirclePlusFilled,
  IconMail,
  IconSearch,
  type Icon,
} from "@tabler/icons-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { usePathname } from "next/navigation";

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

export function NavMain({
  items,
  onQuickAdjust,
  onNotifications,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
  onQuickAdjust?: () => void;
  onNotifications?: () => void;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              onClick={onQuickAdjust}
              tooltip="Quick Adjust"
              className="gradient-premium min-w-8 duration-200 ease-linear"
            >
              <IconSearch />
              <span>Quick Adjust</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0 relative"
              variant="outline"
              onClick={onNotifications}
            >
              <IconMail />
              <span className="sr-only">Notifications</span>
              {/* Unread badge indicator */}
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full flex items-center justify-center border-2 border-background"
              >
                <span className="text-[9px] font-bold text-destructive-foreground">
                  3
                </span>
              </motion.span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <SidebarMenu>
            {items.map((item) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                whileHover={{ x: 4 }}
              >
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={item.title}
                    asChild
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url} prefetch={false}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </motion.div>
            ))}
          </SidebarMenu>
        </motion.div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
