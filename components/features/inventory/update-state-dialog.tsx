/**
 * @file update-state-dialog.tsx
 * @description A slide-over sheet component for updating the lifecycle status of an asset.
 * Handles state transitions (e.g., Good -> Broken, Active -> Retired) and enforces
 * reasoning for audit trails.
 * @path /components/features/inventory/update-state-dialog.tsx
 * @component
 */

"use client";

import * as React from "react";
import {
  AlertTriangle,
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
import { Asset, ASSET_STATES } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Props for the UpdateStateDialog component.
 */
interface UpdateStateDialogProps {
  /** The asset object currently being modified. If null, the dialog prevents rendering. */
  asset: Asset | null;
  /** Controls the visibility state of the sheet. */
  open: boolean;
  /** Callback to update the visibility state. */
  onOpenChange: (open: boolean) => void;
}

/**
 * UpdateStateDialog Component
 *
 * Provides a UI for changing an asset's operational status.
 * Features:
 * - Pre-selects the current status.
 * - Validates that a reason is provided if the status is changing (soft validation).
 * - Displays a warning alert when selecting 'destructive' states (Broken/Retired).
 *
 * @param props - {@link UpdateStateDialogProps}
 */
export function UpdateStateDialog({
  asset,
  open,
  onOpenChange,
}: UpdateStateDialogProps) {
  // Local state for the selected status and the reasoning text
  const [state, setState] = React.useState<string>("");
  const [reason, setReason] = React.useState("");

  // Sync internal state with the passed asset prop whenever it changes
  React.useEffect(() => {
    if (asset) {
      // Map Enum (number) to String for Select component
      const stateIndex = Number(asset.state) - 1;
      const stateString = ASSET_STATES[stateIndex] || "NEW";
      setState(stateString);
    }
  }, [asset]);

  // Guard clause: ensure asset exists before rendering
  if (!asset) return null;

  /**
   * Handles the form submission.
   * Validates input and triggers the update (mocked).
   */
  const handleConfirm = () => {
    // Basic validation: user should ideally provide a reason for state changes
    const currentStateString = ASSET_STATES[Number(asset.state) - 1];
    if (!reason && state !== currentStateString) {
      toast.error("Please provide a reason for the status change");
      return;
    }

    // // TODO: Replace with actual API mutation (e.g., useUpdateAssetStatus)
    toast.success(`Asset status updated to ${state}`, {
      description: `Reason: ${reason}`,
    });

    onOpenChange(false);
    setReason("");
  };

  // Determine if the selected state represents a "disposal" or "end of life" event
  const isDisposal = state === "RETIRED" || state === "BROKEN";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[450px] p-0 flex flex-col"
      >
        <SheetHeader className="p-6 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <SheetTitle>Update Asset Status</SheetTitle>
              <SheetDescription>
                Change the state of asset{" "}
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
              <div className="space-y-6">
                {/* Visual indicator of the current database state */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Current Status
                  </Label>
                  <div className="rounded-lg border p-3 bg-muted/30 text-sm font-semibold flex items-center justify-between">
                    <span>
                      {ASSET_STATES[Number(asset.state) - 1] || asset.state}
                    </span>
                    <Badge variant="outline" className="bg-background">
                      Current
                    </Badge>
                  </div>
                </div>

                {/* Status Selection Dropdown */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-primary" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      New Status
                    </Label>
                  </div>
                  <Select onValueChange={setState} value={state}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select status" />
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

                {/* Warning for destructive changes */}
                {isDisposal && (
                  <Alert
                    variant="destructive"
                    className="bg-destructive/5 border-destructive/20 text-destructive"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="font-bold text-sm">
                      Action Warning
                    </AlertTitle>
                    <AlertDescription className="text-xs opacity-90">
                      Marking this asset as {state} will archive it and remove
                      it from active deployment inventory lists.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Asset Information Card */}
                <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Asset Information
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground leading-none">
                        Category
                      </span>
                      <span className="font-semibold">
                        {asset.category || "Unknown"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground leading-none">
                        Location
                      </span>
                      <span className="font-semibold">{asset.location}</span>
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

                {/* Reason Input */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Label
                      htmlFor="reason"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Change Reason
                    </Label>
                  </div>
                  <Textarea
                    id="reason"
                    placeholder="Describe why the status is changing (e.g. End of Lease)..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className={cn(
                      "min-h-[150px] resize-none focus:ring-1",
                      !reason &&
                        state !== asset.state &&
                        "border-destructive/50 focus:ring-destructive/30"
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
              Update Status
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
