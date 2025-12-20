"use client";

import * as React from "react";
import { AlertTriangle, Trash2, ShieldAlert, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { AssetLegacy } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface BulkDeleteDialogProps {
  assets: AssetLegacy[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BulkDeleteDialog({
  assets,
  open,
  onOpenChange,
}: BulkDeleteDialogProps) {
  const handleConfirm = () => {
    toast.success(`${assets.length} assets deleted successfully`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[450px] p-0 flex flex-col border-l shadow-2xl">
        <SheetHeader className="p-6 border-b bg-destructive/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive shadow-sm">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <SheetTitle className="text-destructive">Confirm Deletion</SheetTitle>
              <SheetDescription>
                You are about to permanently remove <span className="font-bold text-foreground">{assets.length}</span> items.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8">
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle className="font-bold">Permanent Action</AlertTitle>
                <AlertDescription className="text-xs opacity-90">
                  This action cannot be undone. These records will be removed from all inventory logs and reports.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <List className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Affected Assets</span>
                </div>
                <div className="rounded-xl border bg-muted/30 divide-y overflow-hidden">
                  {assets.map((asset) => (
                    <div key={asset.id} className="p-3 text-sm flex items-center justify-between group hover:bg-background transition-colors">
                      <div className="flex flex-col">
                        <span className="font-semibold">{asset.Make} {asset.Model}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{asset["Service Tag"]}</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-tighter">
                        {asset.Category}
                      </Badge>
                    </div>
                  ))}
                  {assets.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground italic">No assets selected</div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        <SheetFooter className="p-6 border-t bg-muted/10 items-center justify-end gap-3 flex-row">
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="destructive"
            className="flex-1 sm:flex-none px-8 font-bold shadow-lg shadow-destructive/20"
          >
            Confirm Deletion
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
