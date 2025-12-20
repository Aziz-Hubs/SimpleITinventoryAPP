"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAssets } from "@/services/dashboard-service";
import { AssetLegacy } from "@/lib/types";
import {
  Laptop,
  Monitor,
  Smartphone,
  Printer,
  Cpu,
  Box,
  HardDrive,
  User,
  History
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EmployeeAssetsDialogProps {
  employeeName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getAssetIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "laptop":
      return <Laptop className="h-4 w-4" />;
    case "monitor":
      return <Monitor className="h-4 w-4" />;
    case "smartphone":
      return <Smartphone className="h-4 w-4" />;
    case "printer":
      return <Printer className="h-4 w-4" />;
    case "server":
      return <Cpu className="h-4 w-4" />;
    case "peripherals":
      return <HardDrive className="h-4 w-4" />;
    default:
      return <Box className="h-4 w-4" />;
  }
};

const getStateColor = (state: string) => {
  switch (state.toUpperCase()) {
    case "GOOD":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    case "NEW":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "NEEDS REPAIR":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "BROKEN":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "RETIRED":
      return "bg-zinc-500/10 text-zinc-600 border-zinc-500/20";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

export function EmployeeAssetsDialog({
  employeeName,
  open,
  onOpenChange,
}: EmployeeAssetsDialogProps) {
  const [assets, setAssets] = React.useState<AssetLegacy[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && employeeName) {
      setLoading(true);
      getAssets().then((allAssets) => {
        const filtered = allAssets.filter((a) => a.Employee === employeeName);
        setAssets(filtered);
        setLoading(false);
      });
    }
  }, [open, employeeName]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col border-l shadow-2xl">
        <SheetHeader className="p-6 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm">
              <User className="h-6 w-6" />
            </div>
            <div>
              <SheetTitle className="text-xl">Assigned Assets</SheetTitle>
              <SheetDescription>
                Equipment currently assigned to <span className="font-semibold text-foreground">{employeeName}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                </div>
                <p className="text-sm text-muted-foreground animate-pulse font-medium">Loading inventory...</p>
              </div>
            ) : assets.length > 0 ? (
              <div className="p-0">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0 z-10">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-6 h-10 text-[11px] font-bold uppercase tracking-wider">Device</TableHead>
                      <TableHead className="px-4 h-10 text-[11px] font-bold uppercase tracking-wider">Service Tag</TableHead>
                      <TableHead className="px-6 h-10 text-[11px] font-bold uppercase tracking-wider text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((asset) => (
                      <TableRow
                        key={asset.id}
                        className="group hover:bg-muted/30 transition-colors border-b"
                      >
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors border">
                              {getAssetIcon(asset.Category)}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-sm">
                                {asset.Make}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-muted-foreground">
                                  {asset.Model}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted font-bold tracking-tighter uppercase text-muted-foreground border">
                                  {asset.Category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 font-mono text-[10px] font-semibold text-muted-foreground">
                          {asset["Service Tag"]}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Badge
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 tracking-tight border shadow-none ${getStateColor(
                              asset.State
                            )}`}
                          >
                            {asset.State}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6 border border-dashed border-muted-foreground/30">
                  <Box className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Assets Found</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  This employee currently has no equipment registered under their profile.
                </p>
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="p-6 border-t bg-muted/20">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <History className="h-3 w-3" />
              <span>Total value: $0.00</span>
            </div>
            <span className="font-medium">{assets.length} items assigned</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
