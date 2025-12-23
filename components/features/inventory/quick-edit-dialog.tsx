"use client";

import * as React from "react";
import { Zap, Save, MapPin, Package, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Asset, ASSET_STATES } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useModelById } from "@/hooks/api/use-models";

interface QuickEditDialogProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickEditDialog({
  asset,
  open,
  onOpenChange,
}: QuickEditDialogProps) {
  const [location, setLocation] = React.useState("");
  const { data: modelData } = useModelById(asset?.modelId || 0);

  React.useEffect(() => {
    if (asset) {
      setLocation(asset.location);
    }
  }, [asset]);

  if (!asset) return null;

  const handleConfirm = () => {
    toast.success(`Asset details updated`, {
      description: `Updated details for ${asset.serviceTag}`,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[425px] p-0 flex flex-col border-l shadow-2xl"
      >
        <SheetHeader className="p-6 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <SheetTitle>Quick Edit</SheetTitle>
              <SheetDescription>
                Fast updates for{" "}
                <span className="font-mono font-medium text-foreground">
                  {asset.serviceTag}
                </span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form
          className="flex-1 flex flex-col h-full overflow-hidden"
          onSubmit={(e) => {
            e.preventDefault();
            handleConfirm();
          }}
        >
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <Label
                      htmlFor="make"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Make
                    </Label>
                  </div>
                  <Input
                    id="make"
                    value={modelData?.make || ""}
                    disabled
                    className="h-11 focus:ring-1 bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <Label
                      htmlFor="model"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Model
                    </Label>
                  </div>
                  <Input
                    id="model"
                    value={modelData?.name || ""}
                    disabled
                    className="h-11 focus:ring-1 bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Label
                      htmlFor="location"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Location
                    </Label>
                  </div>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-11 focus:ring-1"
                  />
                </div>
              </div>

              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Asset Context
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground leading-none">
                      Category
                    </span>
                    <span className="font-semibold">
                      {modelData?.category || "Unknown"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground leading-none">
                      Status
                    </span>
                    <span className="font-semibold">
                      {ASSET_STATES[Number(asset.state) - 1] || asset.state}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground leading-none">
                      Price
                    </span>
                    <span className="font-semibold">
                      {asset.price
                        ? `$${asset.price.toLocaleString()}`
                        : "Not Set"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="p-6 border-t bg-muted/10 items-center justify-end gap-3 flex-row">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 sm:flex-none px-8 font-bold gap-2"
            >
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
