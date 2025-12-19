"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
} from "lucide-react";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Assets Assigned to {employeeName}</DialogTitle>
          <DialogDescription>
            A list of all equipment currently in possession of this employee.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
            </div>
          ) : assets.length > 0 ? (
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Service Tag</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow
                    key={asset.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          {getAssetIcon(asset.Category)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {asset.Make}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {asset.Model}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold uppercase tracking-tighter"
                      >
                        {asset.Category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                      {asset["Service Tag"]}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] font-bold uppercase ${getStateColor(
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
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-muted rounded-full mb-3">
                <Box className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <p className="text-muted-foreground">
                No assets currently assigned to this employee.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
