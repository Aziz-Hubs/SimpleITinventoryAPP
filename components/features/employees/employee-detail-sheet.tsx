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
import { BaseDetailSheet } from "@/components/shared/base-detail-sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  sheetColor = "#6366f1", // Default Indigo
}: EmployeeDetailSheetProps & { sheetColor?: string }) {
  if (!employee) return null;

  return (
    <BaseDetailSheet
      open={open}
      onOpenChange={onOpenChange}
      sheetColor={sheetColor}
      title="Employee Profile"
      description="Personal details, role overview, and contact information."
      icon={<User className="h-6 w-6" />}
      footerContent={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="w-full font-bold shadow-sm"
            onClick={() => onOpenChange(false)}
          >
            Close Profile
          </Button>
          <Button
            className="w-full font-bold shadow-lg shadow-primary/20"
            onClick={() => {
              // Future edit functionality
            }}
          >
            Edit Details
          </Button>
        </div>
      }
    >
      {/* Header Profile Summary */}
      <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-muted/30 border border-border/50 backdrop-blur-sm">
        <Avatar className="h-16 w-16 rounded-2xl border-2 border-background shadow-lg">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${employee.fullName}`}
            alt={employee.fullName}
          />
          <AvatarFallback
            className="rounded-2xl text-lg font-bold"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--sheet-color) 10%, transparent)",
              color: "var(--sheet-color)",
            }}
          >
            {getInitials(employee.fullName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-bold tracking-tight">
            {employee.fullName}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="bg-background/50 font-medium">
              {employee.position}
            </Badge>
            <span className={`h-2 w-2 rounded-full bg-emerald-500`} />
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b">
          <User className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
            Contact & Personal
          </h3>
        </div>
        <div className="grid gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/50">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Email Address
              </p>
              <p className="text-sm font-medium">{employee.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/50">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Phone Number
              </p>
              <p className="text-sm font-medium">---</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/50">
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Department
              </p>
              <p className="text-sm font-medium">{employee.department}</p>
            </div>
          </div>
        </div>
      </div>

      {/* System & Access */}
      <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b">
          <Briefcase className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
            Role & Access
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Employee ID
            </p>
            <div className="p-2 bg-muted/50 rounded-lg border text-sm font-mono font-bold">
              {employee.id}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Join Date
            </p>
            <div className="p-2 text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              ---
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions / Notes */}
      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
        <div className="mt-0.5">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">
            HR System Note
          </p>
          <p className="text-xs text-blue-600/80 leading-relaxed">
            This employee profile is synced with the central HR database.
            Modifications here will invoke a change request approval flow.
          </p>
        </div>
      </div>
    </BaseDetailSheet>
  );
}
