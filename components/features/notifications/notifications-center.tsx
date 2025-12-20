"use client";

import * as React from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Package,
  Users,
  Settings,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

type NotificationType = "info" | "success" | "warning" | "error";
type NotificationCategory = "system" | "activity" | "maintenance";

interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// ----------------------------------------------------------------------
// Mock Data
// ----------------------------------------------------------------------

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-001",
    type: "info",
    category: "activity",
    title: "New Employee Added",
    message: "Alice Johnson has been added to the Engineering department",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    read: false,
  },
  {
    id: "notif-002",
    type: "success",
    category: "system",
    title: "Asset Deployed Successfully",
    message: "Laptop LAP-001 has been assigned to Bob Smith",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    read: false,
    actionUrl: "/inventory-master",
  },
  {
    id: "notif-003",
    type: "warning",
    category: "maintenance",
    title: "Maintenance Due",
    message: "5 assets require maintenance within the next 7 days",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    actionUrl: "/deployment-operations",
  },
  {
    id: "notif-004",
    type: "info",
    category: "activity",
    title: "Inventory Updated",
    message: "10 new monitors added to inventory",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: true,
  },
  {
    id: "notif-005",
    type: "error",
    category: "system",
    title: "Asset Assignment Failed",
    message: "Failed to assign Headset HDS-023 - Asset not available",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
  {
    id: "notif-006",
    type: "success",
    category: "activity",
    title: "Bulk Import Completed",
    message: "Successfully imported 50 assets from CSV",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
  },
];

// ----------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "success":
      return CheckCircle;
    case "warning":
      return AlertTriangle;
    case "error":
      return AlertCircle;
    case "info":
    default:
      return Info;
  }
}

function getNotificationColor(type: NotificationType) {
  switch (type) {
    case "success":
      return "text-emerald-500";
    case "warning":
      return "text-amber-500";
    case "error":
      return "text-rose-500";
    case "info":
    default:
      return "text-sky-500";
  }
}

function getNotificationBgColor(type: NotificationType) {
  switch (type) {
    case "success":
      return "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40";
    case "warning":
      return "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40";
    case "error":
      return "bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40";
    case "info":
    default:
      return "bg-sky-500/5 border-sky-500/20 hover:border-sky-500/40";
  }
}

function getCategoryIcon(category: NotificationCategory) {
  switch (category) {
    case "system":
      return Settings;
    case "activity":
      return Users;
    case "maintenance":
      return Package;
  }
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

interface NotificationsCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsCenter({
  open,
  onOpenChange,
}: NotificationsCenterProps) {
  const [notifications, setNotifications] = React.useState<Notification[]>(
    INITIAL_NOTIFICATIONS
  );
  const [activeTab, setActiveTab] = React.useState<
    "all" | NotificationCategory
  >("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.category === activeTab);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification deleted");
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success("All notifications cleared");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b border-border/50 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="h-5 w-5 text-primary" />
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full flex items-center justify-center"
                  >
                    <span className="text-[10px] font-bold text-destructive-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  </motion.div>
                )}
              </div>
              <div>
                <SheetTitle className="text-lg">Notifications</SheetTitle>
                <SheetDescription className="text-xs">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""
                    }`
                    : "You're all caught up!"}
                </SheetDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-8 text-xs"
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearAll}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="flex-1 flex flex-col"
        >
          <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent px-6 h-12">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-muted/50"
            >
              <Bell className="h-3.5 w-3.5 mr-1.5" />
              All
              {unreadCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 px-1.5 text-[10px]"
                >
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="data-[state=active]:bg-muted/50"
            >
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              System
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-muted/50"
            >
              <Users className="h-3.5 w-3.5 mr-1.5" />
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="maintenance"
              className="data-[state=active]:bg-muted/50"
            >
              <Package className="h-3.5 w-3.5 mr-1.5" />
              Maintenance
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 m-0 p-0">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="p-4 space-y-2">
                <AnimatePresence initial={false}>
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      const CategoryIcon = getCategoryIcon(
                        notification.category
                      );
                      const iconColor = getNotificationColor(notification.type);
                      const bgColor = getNotificationBgColor(notification.type);

                      return (
                        <motion.div
                          key={notification.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={cn(
                            "group relative rounded-xl border p-4 transition-all hover:shadow-md",
                            notification.read
                              ? "bg-card/50 border-border/50"
                              : bgColor
                          )}
                        >
                          {!notification.read && (
                            <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary animate-pulse" />
                          )}

                          <div className="flex gap-3">
                            <div
                              className={cn(
                                "mt-0.5 rounded-lg p-2",
                                notification.read ? "bg-muted/50" : iconColor.replace("text-", "bg-") + "/10",
                                iconColor
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>

                            <div className="flex-1 space-y-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4
                                    className={cn(
                                      "text-sm font-semibold leading-none mb-1",
                                      !notification.read && "text-foreground"
                                    )}
                                  >
                                    {notification.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {notification.message}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-2 pt-2">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="h-5 px-2 text-[10px] font-medium"
                                  >
                                    <CategoryIcon className="h-2.5 w-2.5 mr-1" />
                                    {notification.category}
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground">
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleMarkAsRead(notification.id)
                                      }
                                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleDelete(notification.id)
                                    }
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-16 text-center"
                    >
                      <div className="rounded-full bg-muted/50 p-6 mb-4">
                        <Bell className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <h3 className="text-lg font-semibold mb-1">
                        No notifications
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        {activeTab === "all"
                          ? "You're all caught up! Check back later for updates."
                          : `No ${activeTab} notifications at the moment.`}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
