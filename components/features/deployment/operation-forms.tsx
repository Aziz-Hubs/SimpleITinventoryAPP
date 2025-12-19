"use client";

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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ActionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardAssetDialog({ open, onOpenChange }: ActionProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Onboard New Asset</DialogTitle>
          <DialogDescription>
            Enter details for the new asset. Click save when done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tag" className="text-right">
              Asset Tag
            </Label>
            <Input id="tag" placeholder="TAG-XXXX" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Laptop">Laptop</SelectItem>
                <SelectItem value="Monitor">Monitor</SelectItem>
                <SelectItem value="Docking">Docking</SelectItem>
                <SelectItem value="Headset">Headset</SelectItem>
                <SelectItem value="Network">Network</SelectItem>
                <SelectItem value="Printer">Printer</SelectItem>
                <SelectItem value="Server">Server</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">
              Model
            </Label>
            <Input id="model" placeholder="Model Name" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={() => onOpenChange(false)}>
            Save Asset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function OffboardAssetDialog({ open, onOpenChange }: ActionProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Offboard Asset</DialogTitle>
          <DialogDescription>
            Confirm asset offboarding and provide a reason.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="off-tag" className="text-right">
              Asset Tag
            </Label>
            <Input id="off-tag" placeholder="TAG-XXXX" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Reason
            </Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eol">End of Life</SelectItem>
                <SelectItem value="broken">Broken/Damaged</SelectItem>
                <SelectItem value="lost">Lost/Stolen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={() => onOpenChange(false)}>
            Confirm External Disposal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AssignAssetDialog({ open, onOpenChange }: ActionProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Asset</DialogTitle>
          <DialogDescription>
            Assign an available asset to an employee.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assign-tag" className="text-right">
              Asset Tag
            </Label>
            <Input
              id="assign-tag"
              placeholder="Scan or type TAG"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="employee" className="text-right">
              Employee
            </Label>
            <Input
              id="employee"
              placeholder="Search employee..."
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Assignment Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Optional notes..."
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UnassignAssetDialog({ open, onOpenChange }: ActionProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Unassign Asset</DialogTitle>
          <DialogDescription>Return an asset to inventory.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unassign-tag" className="text-right">
              Asset Tag
            </Label>
            <Input
              id="unassign-tag"
              placeholder="Scan or type TAG"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="condition" className="text-right">
              Return Condition
            </Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="dirty">Needs Cleaning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Unassign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ReassignAssetDialog({ open, onOpenChange }: ActionProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reassign Asset</DialogTitle>
          <DialogDescription>
            Quickly transfer asset from one user to another.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="re-tag" className="text-right">
              Asset Tag
            </Label>
            <Input id="re-tag" placeholder="TAG-XXXX" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="from-user" className="text-right">
              From
            </Label>
            <Input
              id="from-user"
              placeholder="Current User"
              disabled
              className="col-span-3 bg-muted"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="to-user" className="text-right">
              To
            </Label>
            <Input id="to-user" placeholder="New User" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Transfer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
