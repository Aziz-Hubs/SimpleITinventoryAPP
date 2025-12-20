"use client";

import * as React from "react";
import { Check, ChevronsUpDown, User, UserMinus, UserPlus, FileText, Monitor } from "lucide-react";
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
import { AssetLegacy } from "@/lib/types";
import { useView } from "@/components/layout/view-provider";
import { getEmployees } from "@/services/employee-service";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AssignAssetDialogProps {
  asset: AssetLegacy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignAssetDialog({
  asset,
  open,
  onOpenChange,
}: AssignAssetDialogProps) {
  const [openCombobox, setOpenCombobox] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [employees, setEmployees] = React.useState<{ label: string; value: string }[]>([]);

  React.useEffect(() => {
    const fetchEmployees = async () => {
      const data = await getEmployees();
      const list = data.map((emp) => ({
        label: emp.fullName,
        value: emp.fullName,
      }));
      setEmployees([{ label: "UNASSIGNED", value: "UNASSIGNED" }, ...list]);
    };
    fetchEmployees();
  }, []);

  // Pre-select current employee when dialog opens
  React.useEffect(() => {
    if (asset && open) {
      setValue(asset.Employee || "");
    }
  }, [asset, open]);

  if (!asset) return null;

  const handleConfirm = () => {
    if (!value) {
      toast.error("Please select a new assignee");
      return;
    }

    toast.success(`Asset ${asset["Service Tag"]} assigned to ${value}`, {
      description: comment ? `Note: ${comment}` : undefined,
    });

    onOpenChange(false);
    setValue("");
    setComment("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[450px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <SheetTitle>Assign Asset</SheetTitle>
              <SheetDescription>
                Transfer ownership of asset{" "}
                <span className="font-mono font-medium text-foreground">
                  {asset["Service Tag"]}
                </span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form className="flex-1 flex flex-col h-full overflow-hidden" onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8">
              {/* Asset Summary */}
              <div className="bg-muted/40 rounded-xl p-4 border flex items-center gap-4">
                <div className="p-3 rounded-lg bg-background border shadow-sm">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{asset.Make} {asset.Model}</h4>
                  <Badge variant="outline" className="mt-1 text-[10px] uppercase font-bold tracking-tight">
                    {asset.Category}
                  </Badge>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Owner</Label>
                  </div>
                  <div className="rounded-lg border p-3 bg-muted/30 text-sm font-medium">
                    {asset.Employee === "UNASSIGNED" ? (
                      <span className="text-muted-foreground italic">No current owner</span>
                    ) : (
                      asset.Employee
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-primary" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Assignee</Label>
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
                            value === "UNASSIGNED" ? <UserMinus className="h-4 w-4 text-muted-foreground" /> : <User className="h-4 w-4 text-primary" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={cn(!value && "text-muted-foreground text-sm")}>
                            {value
                              ? employees.find((e) => e.value === value)?.label
                              : "Select employee..."}
                          </span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
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
                                  setValue(currentValue === value ? "" : currentValue);
                                  setOpenCombobox(false);
                                }}
                                className="flex items-center gap-2 p-3"
                              >
                                <Check
                                  className={cn(
                                    "h-4 w-4 text-primary",
                                    value === emp.value ? "opacity-100" : "opacity-0"
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
                    <Label htmlFor="comment" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Change Note</Label>
                  </div>
                  <Textarea
                    id="comment"
                    placeholder="Reason for transfer (e.g. Replacement, Role Change)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[120px] resize-none focus:ring-1"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="p-6 border-t bg-muted/10 items-center justify-end gap-3 flex-row">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 sm:flex-none px-8 font-bold">
              Confirm Assignment
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
