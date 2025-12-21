"use client";

import * as React from "react";
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
  XCircle,
  RefreshCw,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Asset } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BulkUpdateStateDialogProps {
  assets: Asset[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BulkUpdateStateDialog({
  assets,
  open,
  onOpenChange,
}: BulkUpdateStateDialogProps) {
  const [state, setState] = React.useState<string>("");
  const [reason, setReason] = React.useState("");

  const handleConfirm = () => {
    if (!state) {
      toast.error("Please select a new status");
      return;
    }

    if (!reason) {
      toast.error("Please provide a reason for the status change");
      return;
    }

    toast.success(`${assets.length} assets updated to ${state}`, {
      description: `Reason: ${reason}`,
    });

    onOpenChange(false);
    setReason("");
    setState("");
  };

  const isDisposal = state === "RETIRED" || state === "BROKEN";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[450px] p-0 flex flex-col"
      >
        <SheetHeader className="p-6 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 shadow-sm">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <SheetTitle>Bulk Update Status</SheetTitle>
              <SheetDescription>
                Change the state of{" "}
                <span className="font-semibold text-foreground">
                  {assets.length}
                </span>{" "}
                selected assets.
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
              <Alert className="bg-muted/40 border-muted">
                <Info className="h-4 w-4" />
                <AlertTitle className="text-sm font-bold">
                  Selection Summary
                </AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground">
                  You are updating {assets.length} items. This will standardize
                  their status across the entire system.
                </AlertDescription>
              </Alert>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-primary" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      New Status
                    </Label>
                  </div>
                  <Select onValueChange={setState} value={state}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select status to apply to all" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GOOD">
                        <div className="flex items-center gap-2 text-emerald-500 font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>GOOD</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="NEW">
                        <div className="flex items-center gap-2 text-blue-500 font-medium">
                          <Sparkles className="h-4 w-4" />
                          <span>NEW</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="BROKEN">
                        <div className="flex items-center gap-2 text-red-500 font-medium">
                          <XCircle className="h-4 w-4" />
                          <span>BROKEN</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="RETIRED">
                        <div className="flex items-center gap-2 text-zinc-500 font-medium">
                          <AlertTriangle className="h-4 w-4" />
                          <span>RETIRED</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isDisposal && (
                  <Alert
                    variant="destructive"
                    className="bg-destructive/5 border-destructive/20 text-destructive"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="font-bold">Warning</AlertTitle>
                    <AlertDescription className="text-xs opacity-90">
                      Marking these {assets.length} assets as {state} may remove
                      them from active inventory lists and affect reporting.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Label
                      htmlFor="reason"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Status Change Reason
                    </Label>
                  </div>
                  <Textarea
                    id="reason"
                    placeholder="Provide justification for this bulk update..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className={cn(
                      "min-h-[150px] resize-none focus:ring-1",
                      !reason &&
                        state &&
                        "border-destructive/50 focus:ring-destructive/30 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]"
                    )}
                  />
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
              variant={isDisposal ? "destructive" : "default"}
              className="flex-1 sm:flex-none px-8 font-bold"
            >
              Update {assets.length} Assets
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
