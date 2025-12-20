"use client";

import {
    Building2,
    Mail,
    User,
    Briefcase,
    Calendar,
    ShieldCheck,
    History,
    Smartphone,
    MapPin,
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type Employee } from "@/services/employee-service";

interface EmployeeDetailSheetProps {
    employee: Employee | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function EmployeeDetailSheet({
    employee,
    open,
    onOpenChange,
}: EmployeeDetailSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-[550px] p-0 flex flex-col border-l shadow-2xl overflow-hidden"
            >
                {employee && (
                    <>
                        <SheetHeader className="p-6 border-b bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <SheetTitle className="text-2xl font-bold tracking-tight">
                                        {employee.fullName}
                                    </SheetTitle>
                                    <SheetDescription className="flex items-center gap-2">
                                        <span className="text-foreground/80 font-medium">
                                            {employee.position}
                                        </span>
                                        <span className="text-muted-foreground">•</span>
                                        <span className="text-muted-foreground">{employee.department}</span>
                                    </SheetDescription>
                                </div>
                                <div className="ml-auto">
                                    <Badge
                                        variant="outline"
                                        className="px-3 py-1 bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20"
                                    >
                                        Active
                                    </Badge>
                                </div>
                            </div>
                        </SheetHeader>

                        <ScrollArea className="flex-1">
                            <div className="p-6 space-y-8">
                                {/* Personal Information */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Contact & Personal
                                    </h3>
                                    <div className="grid gap-4 rounded-xl border bg-card p-4 shadow-xs">
                                        <div className="grid grid-cols-[24px_1fr] gap-3 items-center">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <div className="space-y-0.5">
                                                <p className="text-xs text-muted-foreground font-medium">Email Address</p>
                                                <p className="text-sm font-medium hover:text-primary cursor-pointer transition-colors">
                                                    {employee.email}
                                                </p>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid grid-cols-[24px_1fr] gap-3 items-center">
                                                <Smartphone className="h-4 w-4 text-muted-foreground" />
                                                <div className="space-y-0.5">
                                                    <p className="text-xs text-muted-foreground font-medium">Phone</p>
                                                    <p className="text-sm font-medium">+1 (555) 000-0000</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-[24px_1fr] gap-3 items-center">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <div className="space-y-0.5">
                                                    <p className="text-xs text-muted-foreground font-medium">Location</p>
                                                    <p className="text-sm font-medium">Headquarters</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Employment Details */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        Employment Details
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Building2 className="h-4 w-4" />
                                                <span className="text-xs font-semibold">Department</span>
                                            </div>
                                            <p className="font-medium pl-6">{employee.department}</p>
                                        </div>
                                        <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <ShieldCheck className="h-4 w-4" />
                                                <span className="text-xs font-semibold">Employee ID</span>
                                            </div>
                                            <p className="font-mono font-medium pl-6 text-sm">
                                                {employee.id}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span className="text-xs font-semibold">Start Date</span>
                                            </div>
                                            <p className="font-medium pl-6">Jan 15, 2024</p>
                                        </div>
                                        <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <History className="h-4 w-4" />
                                                <span className="text-xs font-semibold">Tenure</span>
                                            </div>
                                            <p className="font-medium pl-6">5 Months</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity / Assets Placeholder */}
                                {/* We could potentially show assigned assets here if we had that data readily available in the Employee object or fetched it */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <History className="h-4 w-4" />
                                        Recent Activity
                                    </h3>
                                    <div className="rounded-xl border border-dashed p-8 text-center space-y-2">
                                        <p className="text-muted-foreground text-sm">
                                            Asset history and activity logs will appear here.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
