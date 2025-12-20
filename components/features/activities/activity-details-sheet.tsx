import { BaseDetailSheet } from "@/components/shared/base-detail-sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Activity as ActivityIcon,
  User,
  Info,
  FileText,
  Filter,
} from "lucide-react";
import { Activity } from "@/lib/types";
import {
  getActionCategory,
  getCategoryDetails,
} from "@/lib/activity-categories";

interface ActivityDetailsSheetProps {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivityDetailsSheet({
  activity,
  open,
  onOpenChange,
  sheetColor = "#8b5cf6", // Default Purple/Violet
}: ActivityDetailsSheetProps & { sheetColor?: string }) {
  if (!activity) return null;

  const date = new Date(activity.timestamp);

  return (
    <BaseDetailSheet
      open={open}
      onOpenChange={onOpenChange}
      sheetColor={sheetColor}
      title="Activity Details"
      description="Detailed information about this specific system activity."
      icon={<ActivityIcon className="h-6 w-6" />}
      footerContent={
        <div className="flex items-center justify-end w-full">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close Details
          </Button>
        </div>
      }
    >
      {/* User Info */}
      <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b">
          <User className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
            User Information
          </h3>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/20">
          <Avatar className="h-14 w-14 rounded-xl border-2 border-background shadow-md">
            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
            <AvatarFallback
              className="rounded-xl font-bold"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--sheet-color) 10%, transparent)",
                color: "var(--sheet-color)",
              }}
            >
              {activity.user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <span className="text-base font-bold tracking-tight">
              {activity.user.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-muted-foreground italic">
                Active User
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Details */}
      <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
            Action Snapshot
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Action Type
            </p>
            <div className="text-sm font-medium p-3 bg-muted/30 rounded-lg border">
              {activity.action}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Target
            </p>
            <div className="text-sm font-medium p-3 bg-muted/30 rounded-lg border">
              {activity.target}
            </div>
          </div>
        </div>
        <Separator className="opacity-50" />
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Timestamp
          </p>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {date.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Category Section */}
      <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b">
          <Filter className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
            Category Context
          </h3>
        </div>
        <div>
          {(() => {
            const category = getActionCategory(activity.action);
            const categoryDetails = getCategoryDetails(category);
            const CategoryIcon = categoryDetails.icon;

            return (
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-xl shadow-sm ring-1"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--sheet-color) 10%, transparent)",
                    color: "var(--sheet-color)",
                    borderColor:
                      "color-mix(in srgb, var(--sheet-color) 20%, transparent)",
                  }}
                >
                  <CategoryIcon className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`font-medium border-transparent ${categoryDetails.color}`}
                    >
                      {categoryDetails.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {categoryDetails.description}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* System Note */}
      <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
            System Note
          </p>
          <p className="text-xs text-blue-600/80 dark:text-blue-400/80 leading-relaxed">
            This activity was logged automatically by the system. All actions
            are immutable and stored for audit purposes.
          </p>
        </div>
      </div>
    </BaseDetailSheet>
  );
}
