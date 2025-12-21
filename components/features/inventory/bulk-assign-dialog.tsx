"use client";

import * as React from "react";
import {
  Check,
  ChevronsUpDown,
  Info,
  User,
  UserMinus,
  UserPlus,
  FileText,
} from "lucide-react";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Asset } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getEmployees } from "@/services/employee-service";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface BulkAssignDialogProps {
  assets: Asset[];

  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BulkAssignDialog({
  assets,
  open,
  onOpenChange,
}: BulkAssignDialogProps) {
  const [openCombobox, setOpenCombobox] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [employees, setEmployees] = React.useState<
    { label: string; value: string }[]
  >([]);

  React.useEffect(() => {
    const fetchEmployees = async () => {
      const data = await getEmployees();
      const list = data.data.map((emp) => ({
        label: emp.fullName,
        value: emp.fullName,
      }));
      setEmployees([{ label: "UNASSIGNED", value: "UNASSIGNED" }, ...list]);
    };
    fetchEmployees();
  }, []);

  const handleConfirm = () => {
    if (!value) {
      toast.error("Please select a new assignee");
      return;
    }

    toast.success(`${assets.length} assets assigned to ${value}`, {
      description: comment ? `Note: ${comment}` : undefined,
    });

    onOpenChange(false);
    setValue("");
    setComment("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[450px] p-0 flex flex-col"
      >
        <SheetHeader className="p-6 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <SheetTitle>Bulk Assign Assets</SheetTitle>
              <SheetDescription>
                Assign{" "}
                <span className="font-semibold text-foreground">
                  {assets.length}
                </span>{" "}
                selected assets to a new owner.
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
              <Alert className="bg-blue-500/5 border-blue-500/20">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertTitle className="text-blue-700 font-bold">
                  Selection Summary
                </AlertTitle>
                <AlertDescription className="text-blue-600/80">
                  You are assigning {assets.length} items. This will overwrite
                  their current individual assignments globally.
                </AlertDescription>
              </Alert>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-primary" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      New Assignee
                    </Label>
                  </div>
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCombobox}
                        className="justify-between w-full h-11"
                        type="button"
                      >
                        <div className="flex items-center gap-2">
                          {value ? (
                            value === "UNASSIGNED" ? (
                              <UserMinus className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <User className="h-4 w-4 text-primary" />
                            )
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span
                            className={cn(
                              !value && "text-muted-foreground text-sm"
                            )}
                          >
                            {value
                              ? employees.find((e) => e.value === value)?.label
                              : "Select employee..."}
                          </span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder="Search employee..." />
                        <CommandList>
                          <CommandEmpty>No employee found.</CommandEmpty>
                          <CommandGroup>
                            {employees.map((emp) => (
                              <CommandItem
                                key={emp.value}
                                value={emp.value}
                                onSelect={(currentValue) => {
                                  setValue(
                                    currentValue === value ? "" : currentValue
                                  );
                                  setOpenCombobox(false);
                                }}
                                className="flex items-center gap-2 p-3"
                              >
                                <Check
                                  className={cn(
                                    "h-4 w-4 text-primary",
                                    value === emp.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex items-center gap-2">
                                  {emp.value === "UNASSIGNED" ? (
                                    <UserMinus className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <User className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  {emp.label}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Label
                      htmlFor="comment"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Assignment Note
                    </Label>
                  </div>
                  <Textarea
                    id="comment"
                    placeholder="Reason for bulk transfer (e.g. Department Move, New Project)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[150px] resize-none focus:ring-1"
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
              className="flex-1 sm:flex-none px-8 font-bold"
            >
              Assign {assets.length} Assets
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
