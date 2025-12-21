"use client";

import { useState, useMemo } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  Filter,
  User,
  Activity as ActivityIcon,
  Shield,
  Settings2,
  Clock,
  UserPlus,
  RefreshCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ActivityDetailsSheet } from "./activity-details-sheet";
import {
  getActionCategory,
  getCategoryDetails,
} from "@/lib/activity-categories";

interface ActivitiesLogProps {
  activities: Activity[];
}

const formatRelativeTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

// ----------------------------------------------------------------------
// Animations
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export function ActivitiesLog({ activities }: ActivitiesLogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const itemsPerPage = 10;

  // Derive unique users for filter
  const uniqueUsers = useMemo(
    () => Array.from(new Set(activities.map((a) => a.user.name))).sort(),
    [activities]
  );

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      // Search matches
      const matchesSearch =
        activity.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.user.name.toLowerCase().includes(searchTerm.toLowerCase());

      // User filter matches
      const matchesUser =
        userFilter === "all" || activity.user.name === userFilter;

      // Category filter matches
      const category = getActionCategory(activity.action);
      const matchesCategory =
        categoryFilter === "all" || category === categoryFilter;

      // Date filter matches
      const date = new Date(activity.timestamp);
      const now = new Date();
      let matchesDate = true;

      if (dateFilter === "today") {
        matchesDate = date.toDateString() === now.toDateString();
      } else if (dateFilter === "yesterday") {
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        matchesDate = date.toDateString() === yesterday.toDateString();
      } else if (dateFilter === "last7") {
        const last7 = new Date();
        last7.setDate(now.getDate() - 7);
        matchesDate = date >= last7;
      }

      return matchesSearch && matchesUser && matchesCategory && matchesDate;
    });
  }, [activities, searchTerm, userFilter, categoryFilter, dateFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const currentActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // CSV Export
  const downloadCSV = () => {
    const headers = ["User", "Action", "Target", "Category", "Timestamp"];
    const rows = filteredActivities.map((a) => [
      a.user.name,
      a.action,
      a.target,
      getCategoryDetails(getActionCategory(a.action)).label,
      new Date(a.timestamp).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.map((val) => `"${val}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `activities_log_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setUserFilter("all");
    setCategoryFilter("all");
    setDateFilter("all");
    setCurrentPage(1);
  };

  return (
    <Card className="flex flex-col border-none shadow-xl bg-background/50 backdrop-blur-xs">
      <CardHeader className="border-b bg-muted/20 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">
              Activities Log
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground/80">
              Monitor system-wide activity and changes in real-time.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadCSV}
              className="h-8"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetFilters}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Reset Filters"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activity..."
              className="h-9 w-full pl-9 md:w-[250px] lg:w-[350px] bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="h-9 w-auto min-w-[140px] border-dashed bg-background">
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>All Users</span>
                  </div>
                </SelectItem>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user} value={user}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{user}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 w-auto min-w-[140px] border-dashed bg-background">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>All Categories</span>
                  </div>
                </SelectItem>
                <SelectItem value="assignment">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Assignment</span>
                  </div>
                </SelectItem>
                <SelectItem value="maintenance">
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    <span>Maintenance</span>
                  </div>
                </SelectItem>
                <SelectItem value="account">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Account</span>
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>System</span>
                  </div>
                </SelectItem>
                <SelectItem value="other">
                  <div className="flex items-center gap-2">
                    <ActivityIcon className="h-4 w-4" />
                    <span>Other</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-9 w-auto min-w-[140px] border-dashed bg-background">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Anytime</span>
                  </div>
                </SelectItem>
                <SelectItem value="today">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Today</span>
                  </div>
                </SelectItem>
                <SelectItem value="yesterday">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Yesterday</span>
                  </div>
                </SelectItem>
                <SelectItem value="last7">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Last 7 Days</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/30">
              <TableHead className="w-[200px]">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  User
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <ActivityIcon className="h-4 w-4" />
                  Activity
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Category
                </div>
              </TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Clock className="h-4 w-4" />
                  Time
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentActivities.length > 0 ? (
              currentActivities.map((activity) => {
                const category = getActionCategory(activity.action);
                const details = getCategoryDetails(category);

                return (
                  <TableRow
                    key={activity.id}
                    className="group border-b last:border-0 transition-colors hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      setSelectedActivity(activity);
                      setIsSheetOpen(true);
                    }}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border">
                          <AvatarImage
                            src={activity.user.avatar}
                            alt={activity.user.name}
                          />
                          <AvatarFallback>
                            {activity.user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {activity.user.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-normal text-foreground">
                          {activity.action}{" "}
                          <span className="font-medium">{activity.target}</span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-normal border-transparent",
                          details.color
                        )}
                      >
                        <details.icon className="h-3.5 w-3.5 mr-1" />
                        {details.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-sm text-foreground">
                          {formatRelativeTime(activity.timestamp)}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(activity.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <ActivityIcon className="h-8 w-8 text-muted-foreground/20" />
                    <p>No activity logs found matches your criteria.</p>
                    <Button
                      variant="link"
                      onClick={resetFilters}
                      className="text-primary h-auto p-0"
                    >
                      Clear all filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Pagination Stats */}
      <div className="flex items-center justify-between p-4 border-t">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium">
            {filteredActivities.length > 0
              ? (currentPage - 1) * itemsPerPage + 1
              : 0}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(currentPage * itemsPerPage, filteredActivities.length)}
          </span>{" "}
          of <span className="font-medium">{filteredActivities.length}</span>{" "}
          results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>

          <div className="flex items-center justify-center text-sm font-medium">
            Page {currentPage} of {Math.max(1, totalPages)}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>

      <ActivityDetailsSheet
        activity={selectedActivity}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </Card>
  );
}
