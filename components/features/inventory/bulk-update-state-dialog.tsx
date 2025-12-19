"use client";

import * as React from "react";
import { AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { AssetLegacy } from "@/lib/types";
import { z } from "zod";


interface BulkUpdateStateDialogProps {
  assets: AssetLegacy[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Update Status</DialogTitle>
          <DialogDescription>
            Change the state of{" "}
            <span className="font-semibold">{assets.length}</span> selected
            assets.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Selection Summary</AlertTitle>
            <AlertDescription>
              You are updating {assets.length} items. This will standardize
              their status.
            </AlertDescription>
          </Alert>

          <div className="grid gap-2">
            <Label>New Status</Label>
            <Select onValueChange={setState} value={state}>
              <SelectTrigger>
                <SelectValue placeholder="Select status to apply to all" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GOOD">GOOD</SelectItem>
                <SelectItem value="NEW">NEW</SelectItem>
                <SelectItem value="BROKEN">BROKEN</SelectItem>
                <SelectItem value="RETIRED">RETIRED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isDisposal && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Marking these {assets.length} assets as {state} may remove them
                from active inventory lists.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="reason">Status Change Reason</Label>
            <Textarea
              id="reason"
              placeholder="Required for status changes (e.g. Audit updates, Bulk disposal)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={
                !reason && state
                  ? "border-destructive/50 focus-visible:ring-destructive"
                  : ""
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant={isDisposal ? "destructive" : "default"}
          >
            Update {assets.length} Assets
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
