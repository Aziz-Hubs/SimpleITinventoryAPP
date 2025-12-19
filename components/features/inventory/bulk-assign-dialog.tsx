"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AssetLegacy } from "@/lib/types";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useView } from "@/components/layout/view-provider";


interface BulkAssignDialogProps {
  assets: AssetLegacy[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkAssignDialog({
  assets,
  open,
  onOpenChange,
}: BulkAssignDialogProps) {
  const { data } = useView();
  const [openCombobox, setOpenCombobox] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [comment, setComment] = React.useState("");

  // Memoize unique employees from data
  const employees = React.useMemo(() => {
    const uniqueEmployees = new Set(
      data.map((item) => item.employee).filter((e) => e && e !== "UNASSIGNED")
    );
    const list = Array.from(uniqueEmployees)
      .sort()
      .map((emp) => ({
        label: emp,
        value: emp,
      }));
    return [{ label: "UNASSIGNED", value: "UNASSIGNED" }, ...list];
  }, [data]);

  const handleConfirm = () => {
    if (!value) {
      toast.error("Please select a new assignee");
      return;
    }

    // In a real app, you would call an API here
    toast.success(`${assets.length} assets assigned to ${value}`, {
      description: comment ? `Note: ${comment}` : undefined,
    });

    onOpenChange(false);
    setValue("");
    setComment("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Assign Assets</DialogTitle>
          <DialogDescription>
            Assign <span className="font-semibold">{assets.length}</span>{" "}
            selected assets to a new owner.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Selection Summary</AlertTitle>
            <AlertDescription>
              You are assigning {assets.length} items. This will overwrite their
              current individual assignments.
            </AlertDescription>
          </Alert>

          <div className="grid gap-2">
            <Label>New Assignee</Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="justify-between w-full"
                >
                  {value
                    ? employees.find((framework) => framework.value === value)
                        ?.label
                    : "Select employee..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Search employee..." />
                  <CommandList>
                    <CommandEmpty>No employee found.</CommandEmpty>
                    <CommandGroup>
                      {employees.map((framework) => (
                        <CommandItem
                          key={framework.value}
                          value={framework.value}
                          onSelect={(currentValue) => {
                            setValue(
                              currentValue === value ? "" : currentValue
                            );
                            setOpenCombobox(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === framework.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {framework.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="comment">Assignment Note</Label>
            <Textarea
              id="comment"
              placeholder="Reason for bulk assignment (e.g. Department move)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Assign {assets.length} Assets</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
