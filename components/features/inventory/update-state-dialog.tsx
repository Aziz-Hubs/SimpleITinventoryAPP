"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
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


interface UpdateStateDialogProps {
  asset: AssetLegacy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateStateDialog({
  asset,
  open,
  onOpenChange,
}: UpdateStateDialogProps) {
  const [state, setState] = React.useState<string>("");
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    if (asset) {
      setState(asset.State);
    }
  }, [asset]);

  if (!asset) return null;

  const handleConfirm = () => {
    if (!reason && state !== asset.State) {
      toast.error("Please provide a reason for the status change");
      return;
    }

    // In a real app, you would call an API here
    toast.success(`Asset status updated to ${state}`, {
      description: `Reason: ${reason}`,
    });

    onOpenChange(false);
    setReason("");
  };

  const isDisposal = state === "RETIRED" || state === "BROKEN";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Asset Status</DialogTitle>
          <DialogDescription>
            Change the current state of asset{" "}
            <span className="font-mono font-medium">
              {asset["Service Tag"]}
            </span>
            .
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Current Status</Label>
            <div className="rounded-md border p-2 bg-muted text-sm text-muted-foreground">
              {asset.State}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>New Status</Label>
            <Select onValueChange={setState} defaultValue={asset.State}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
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
                Marking an asset as {state} may remove it from active inventory
                lists.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="reason">Status Change Reason</Label>
            <Textarea
              id="reason"
              placeholder="Required for status changes (e.g. Damage reported, End of Life)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={
                !reason && state !== asset.State
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
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
