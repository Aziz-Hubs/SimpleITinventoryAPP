
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity as ActivityIcon, User, Info, FileText, Calendar, Filter } from "lucide-react";
import { Activity } from "@/lib/types";
import { getActionCategory, getCategoryDetails } from "@/lib/activity-categories";


interface ActivityDetailsSheetProps {
    activity: Activity | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ActivityDetailsSheet({
    activity,
    open,
    onOpenChange,
    sheetColor = "#8b5cf6", // Default Purple
}: ActivityDetailsSheetProps & { sheetColor?: string }) {
    if (!activity) return null;

    const date = new Date(activity.timestamp);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent sheetColor={sheetColor} side="right" className="w-full sm:max-w-xl p-0 flex flex-col border-l shadow-2xl">
                <SheetHeader
                    className="p-6 border-b"
                    style={{ backgroundColor: "color-mix(in srgb, var(--sheet-color) 5%, transparent)" }}
                >
                    <div className="flex items-center gap-4 mb-2">
                        <div
                            className="p-3 rounded-2xl shadow-sm ring-1"
                            style={{
                                backgroundColor: "color-mix(in srgb, var(--sheet-color) 10%, transparent)",
                                color: "var(--sheet-color)",
                                borderColor: "color-mix(in srgb, var(--sheet-color) 20%, transparent)"
                            }}
                        >
                            <ActivityIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-background text-[10px] font-bold uppercase tracking-wider h-5">
                                    LOG ID: {activity.id}
                                </Badge>
                            </div>
                            <SheetTitle className="text-2xl font-bold tracking-tight">
                                Activity Details
                            </SheetTitle>
                        </div>
                    </div>
                    <SheetDescription className="text-sm">
                        Detailed information about this specific system activity.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1">
                    <div className="p-6 space-y-10 pb-12">
                        {/* User Info */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary" />
                                    User Information
                                </h4>
                            </div>
                            <div className="flex items-center gap-4 rounded-2xl border bg-muted/20 p-5 transition-all hover:bg-muted/30 hover:shadow-md hover:border-primary/20 group">
                                <Avatar className="h-14 w-14 rounded-xl border-2 border-background shadow-md">
                                    <AvatarImage
                                        src={activity.user.avatar}
                                        alt={activity.user.name}
                                    />
                                    <AvatarFallback
                                        className="rounded-xl font-bold"
                                        style={{
                                            backgroundColor: "color-mix(in srgb, var(--sheet-color) 10%, transparent)",
                                            color: "var(--sheet-color)"
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

                        <Separator className="opacity-50" />

                        {/* Action Details */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest leading-none">Action</span>
                                </div>
                                <div className="text-sm font-medium p-3 bg-muted/30 rounded-lg border">
                                    {activity.action}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Info className="h-4 w-4" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest leading-none">Target</span>
                                </div>
                                <div className="text-sm font-medium p-3 bg-muted/30 rounded-lg border">
                                    {activity.target}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span className="text-[11px] font-bold uppercase tracking-widest leading-none">Timestamp</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium p-3 bg-muted/30 rounded-lg border">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {date.toLocaleString()}
                            </div>
                        </div>

                        <Separator className="opacity-50" />

                        {/* Category Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-primary" />
                                    Category
                                </h4>
                            </div>
                            <div className="rounded-2xl border bg-muted/20 p-5 transition-all hover:bg-muted/30 hover:shadow-md hover:border-primary/20">
                                {(() => {
                                    const category = getActionCategory(activity.action);
                                    const categoryDetails = getCategoryDetails(category);
                                    const CategoryIcon = categoryDetails.icon;

                                    return (
                                        <div className="flex items-start gap-4">
                                            <div
                                                className="p-3 rounded-xl shadow-sm ring-1"
                                                style={{
                                                    backgroundColor: "color-mix(in srgb, var(--sheet-color) 10%, transparent)",
                                                    color: "var(--sheet-color)",
                                                    borderColor: "color-mix(in srgb, var(--sheet-color) 20%, transparent)"
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


                        <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">System Note</p>
                                <p className="text-xs text-blue-600/80 dark:text-blue-400/80 leading-relaxed">
                                    This activity was logged automatically by the system. All actions are immutable and stored for audit purposes.
                                </p>
                            </div>
                        </div>

                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
