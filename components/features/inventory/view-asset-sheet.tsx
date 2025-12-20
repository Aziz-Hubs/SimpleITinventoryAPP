import { useState } from "react";
import { BaseDetailSheet } from "@/components/shared/base-detail-sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  CircleUser,
  Box,
  Info,
  ShieldCheck,
  History,
} from "lucide-react";
import { AssetLegacy } from "@/lib/types";
import { EmployeeAssetsDialog } from "@/components/features/employees/employee-assets-dialog";

interface ViewAssetDialogProps {
  asset: AssetLegacy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStateVariant = (state: string) => {
  switch (state.toUpperCase()) {
    case "GOOD":
      return "default";
    case "NEW":
      return "secondary";
    case "BROKEN":
      return "destructive";
    case "RETIRED":
      return "outline";
    default:
      return "secondary";
  }
};

export function ViewAssetSheet({
  asset,
  open,
  onOpenChange,
  sheetColor = "#3b82f6", // Default Blue
}: ViewAssetDialogProps & { sheetColor?: string }) {
  const [isEmployeeSheetOpen, setIsEmployeeSheetOpen] = useState(false);

  if (!asset) return null;

  return (
    <>
      <BaseDetailSheet
        open={open}
        onOpenChange={onOpenChange}
        sheetColor={sheetColor}
        title={`${asset.Make} ${asset.Model}`}
        description="Full technical specifications and lifecycle activity for this device."
        icon={<Box className="h-6 w-6" />}
        headerContent={
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant="outline"
              className="bg-background text-[10px] font-bold uppercase tracking-wider h-5"
            >
              {asset.Category}
            </Badge>
            <span className="text-xs font-mono font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded border">
              {asset["Service Tag"]}
            </span>
          </div>
        }
        footerContent={
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 w-full">
            <Info className="h-4 w-4 text-blue-500 shrink-0" />
            <p className="text-[11px] text-blue-600/80 font-medium">
              Data synchronized with central procurement ledger. Last updated 4
              hours ago.
            </p>
          </div>
        }
      >
        {/* Essential Info Grid */}
        <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
              Core Specifications
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Device Status
              </p>
              <div>
                <Badge
                  className={`px-3 py-1 font-bold tracking-tight text-xs uppercase ${
                    asset.State === "GOOD"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-none hover:bg-emerald-500/20"
                      : ""
                  }`}
                  variant={getStateVariant(asset.State) as any}
                >
                  {asset.State}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Location
              </p>
              <span className="text-sm font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                {asset.Location}
              </span>
            </div>
          </div>
        </div>

        {/* Current Ownership */}
        <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2 pb-2 border-b">
            <div className="flex items-center gap-2">
              <CircleUser className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                Custodian
              </h3>
            </div>
            <Badge variant="outline" className="text-[10px] bg-muted/50">
              Primary Owner
            </Badge>
          </div>
          <div
            className={`flex items-center gap-4 rounded-xl border bg-muted/20 p-4 transition-all hover:bg-muted/30 group ${
              asset.Employee !== "UNASSIGNED"
                ? "cursor-pointer hover:shadow-md hover:border-primary/20"
                : ""
            }`}
            onClick={() => {
              if (asset.Employee !== "UNASSIGNED") {
                setIsEmployeeSheetOpen(true);
              }
            }}
          >
            {asset.Employee === "UNASSIGNED" ? (
              <div className="h-14 w-14 flex items-center justify-center rounded-xl bg-muted border-2 border-dashed group-hover:border-primary/20 transition-colors">
                <CircleUser className="h-7 w-7 text-muted-foreground/50" />
              </div>
            ) : (
              <Avatar className="h-14 w-14 rounded-xl border-2 border-background shadow-md">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${asset.Employee}`}
                  alt={asset.Employee}
                />
                <AvatarFallback
                  className="rounded-xl font-bold"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--sheet-color) 10%, transparent)",
                    color: "var(--sheet-color)",
                  }}
                >
                  {asset.Employee.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-base font-bold tracking-tight">
                {asset.Employee === "UNASSIGNED"
                  ? "In Storage / Ready"
                  : asset.Employee}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    asset.Employee === "UNASSIGNED"
                      ? "bg-muted-foreground/30"
                      : "bg-emerald-500"
                  }`}
                />
                <span className="text-xs font-medium text-muted-foreground italic">
                  {asset.Employee === "UNASSIGNED"
                    ? "Inventory Control"
                    : "Click to view profile"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Traceability */}
        <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2 pb-2 border-b">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-orange-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                Device Activity Log
              </h3>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
              Live Audit Trail
            </span>
          </div>
          <div className="space-y-6 relative ml-1">
            <div className="absolute top-2 bottom-2 left-[5px] w-0.5 bg-linear-to-b from-primary/30 via-muted to-transparent" />

            {/* Event 1 */}
            <div className="flex gap-4 relative">
              <div className="h-3 w-3 rounded-full bg-primary ring-4 ring-background z-10 mt-1" />
              <div className="space-y-1 bg-muted/10 p-4 rounded-xl border border-transparent hover:border-border/50 hover:bg-muted/20 transition-all flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">Asset Initialization</p>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase px-2 py-0.5 bg-muted rounded">
                    System
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Item record generated and verified against procurement
                  manifest.
                </p>
                <div className="flex items-center gap-2 py-1">
                  <Clock className="h-3 w-3 text-muted-foreground/60" />
                  <span className="text-[10px] font-semibold text-muted-foreground/60">
                    Oct 24, 2023 - 10:00 AM
                  </span>
                </div>
              </div>
            </div>

            {/* Event 2 */}
            <div className="flex gap-4 relative">
              <div className="h-3 w-3 rounded-full bg-muted-foreground/30 ring-4 ring-background z-10 mt-1" />
              <div className="space-y-1 bg-muted/10 p-4 rounded-xl border border-transparent hover:border-border/50 hover:bg-muted/20 transition-all flex-1 opacity-80">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">Status Update</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Maintenance check performed. Internal hardware passed all
                  diagnostic benchmarks.
                </p>
                <div className="flex items-center gap-2 py-1">
                  <Clock className="h-3 w-3 text-muted-foreground/60" />
                  <span className="text-[10px] font-semibold text-muted-foreground/60">
                    Jan 12, 2024 - 02:30 PM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseDetailSheet>

      <EmployeeAssetsDialog
        employeeName={asset.Employee}
        open={isEmployeeSheetOpen}
        onOpenChange={setIsEmployeeSheetOpen}
      />
    </>
  );
}
