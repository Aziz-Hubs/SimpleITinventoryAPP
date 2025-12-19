"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AssetLegacy } from "@/lib/types";
import { z } from "zod";


interface QuickEditDialogProps {
  asset: AssetLegacy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickEditDialog({
  asset,
  open,
  onOpenChange,
}: QuickEditDialogProps) {
  const [make, setMake] = React.useState("");
  const [model, setModel] = React.useState("");
  const [location, setLocation] = React.useState("");

  React.useEffect(() => {
    if (asset) {
      setMake(asset.Make);
      setModel(asset.Model);
      setLocation(asset.Location);
    }
  }, [asset]);

  if (!asset) return null;

  const handleConfirm = () => {
    // In a real app, you would call an API here
    toast.success(`Asset details updated`, {
      description: `Updated Make, Model or Location for ${asset["Service Tag"]}`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Quick Edit Asset</DialogTitle>
          <DialogDescription>
            Update basic details for{" "}
            <span className="font-mono font-medium">
              {asset["Service Tag"]}
            </span>
            .
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="make">Make</Label>
            <Input
              id="make"
              value={make}
              onChange={(e) => setMake(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
