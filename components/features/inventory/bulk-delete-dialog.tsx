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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { AssetLegacy } from "@/lib/types";
import { z } from "zod";


interface BulkDeleteDialogProps {
  assets: AssetLegacy[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkDeleteDialog({
  assets,
  open,
  onOpenChange,
}: BulkDeleteDialogProps) {
  const handleConfirm = () => {
    // In a real app, you would call an API here
    toast.success(`${assets.length} assets deleted successfully`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Assets</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{assets.length}</span> selected
            assets? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Danger Zone</AlertTitle>
            <AlertDescription>
              This will permanently remove {assets.length} records from the
              database. Please confirm that you have permission to perform this
              action.
            </AlertDescription>
          </Alert>

          <div className="mt-4 max-h-[200px] overflow-y-auto rounded border p-2 text-sm text-muted-foreground">
            <ul className="list-disc list-inside">
              {assets.map((asset) => (
                <li key={asset.id}>
                  {asset.Make} {asset.Model} ({asset["Service Tag"]})
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="destructive">
            Delete {assets.length} Assets
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
