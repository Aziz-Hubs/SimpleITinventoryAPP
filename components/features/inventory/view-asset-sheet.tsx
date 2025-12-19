import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, CircleUser } from "lucide-react";
import { AssetLegacy } from "@/lib/types";
import { z } from "zod";

interface ViewAssetDialogProps {
  asset: AssetLegacy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewAssetSheet({
  asset,
  open,
  onOpenChange,
}: ViewAssetDialogProps) {
  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="mb-2">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Badge variant="outline" className="w-fit">
              {asset.Category}
            </Badge>
            <span className="text-sm border px-2 py-0.5 rounded-md font-mono bg-muted/50">
              {asset["Service Tag"]}
            </span>
          </div>
          <DialogTitle className="text-2xl">
            {asset.Make} {asset.Model}
          </DialogTitle>
          <DialogDescription>
            Detailed specifications and activity history for this asset.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                Status
              </span>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    asset.State === "GOOD"
                      ? "default"
                      : asset.State === "NEW"
                      ? "secondary"
                      : "destructive"
                  }
                  className="capitalize"
                >
                  {asset.State}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                Location
              </span>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{asset.Location}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Assignee Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium leading-none">
              Current Assignee
            </h4>
            <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30">
              {asset.Employee === "UNASSIGNED" ? (
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-muted border border-dashed">
                  <CircleUser className="h-5 w-5 text-muted-foreground" />
                </div>
              ) : (
                <Avatar className="h-10 w-10 border">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${asset.Employee}`}
                    alt={asset.Employee}
                  />
                  <AvatarFallback>{asset.Employee.slice(0, 2)}</AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {asset.Employee === "UNASSIGNED"
                    ? "Unassigned"
                    : asset.Employee}
                </span>
                <span className="text-xs text-muted-foreground">
                  {asset.Employee === "UNASSIGNED"
                    ? "Available for assignment"
                    : "Active User"}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* History Section */}
          <div className="space-y-3 h-full flex flex-col">
            <h4 className="text-sm font-medium leading-none flex items-center gap-2">
              <Clock className="h-4 w-4" /> Activity History
            </h4>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-muted/10">
              <div className="space-y-6">
                {/* Mock History Items */}
                <div className="flex gap-3">
                  <div className="relative mt-1">
                    <div className="absolute top-2 left-1/2 -ml-px h-full w-px bg-border" />
                    <div className="relative h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Asset Created</p>
                    <p className="text-xs text-muted-foreground">
                      Added to inventory by System Admin
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      Oct 24, 2023 - 10:00 AM
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="relative mt-1">
                    <div className="absolute top-2 left-1/2 -ml-px h-full w-px bg-border" />
                    <div className="relative h-2 w-2 rounded-full bg-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Assigned to{" "}
                      {asset.Employee === "UNASSIGNED"
                        ? "Inventory"
                        : asset.Employee}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Status update
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      Jan 12, 2024 - 02:30 PM
                    </span>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
