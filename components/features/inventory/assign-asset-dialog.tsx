"use client";

import * as React from "react";
import {
  Check,
  ChevronsUpDown,
  User,
  UserMinus,
  UserPlus,
  FileText,
  Monitor,
  Loader2,
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
import { getEmployees } from "@/services/employee-service";
import { updateAsset } from "@/services/inventory-service";
import { logActivity } from "@/services/dashboard-service";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AssignAssetDialogProps {
  asset: Asset | null;
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
  const [employees, setEmployees] = React.useState<
    { label: string; value: string }[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(false);

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

  // Pre-select current employee when dialog opens
  React.useEffect(() => {
    if (asset && open) {
      setValue(asset.employee || "");
    }
  }, [asset, open]);

  if (!asset) return null;

  const handleConfirm = async () => {
    if (!value) {
      toast.error("Please select a new assignee");
      return;
    }

    setIsLoading(true);
    try {
      await updateAsset(asset.id, { employee: value });
      await logActivity({
        user: { name: "Current User", avatar: "", initials: "ME" },
        action: "assigned",
        target: asset.serviceTag,
        comment: `Assigned to ${value}. ${comment}`,
      });

      toast.success(`Asset ${asset.serviceTag} assigned to ${value}`, {
        description: comment ? `Note: ${comment}` : undefined,
      });

      onOpenChange(false);
      setValue("");
      setComment("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to assign asset");
    } finally {
      setIsLoading(false);
    }
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
              <SheetTitle>Assign Asset</SheetTitle>
              <SheetDescription>
                Transfer ownership of asset{" "}
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
              {/* Asset Summary */}
              <div className="bg-muted/40 rounded-xl p-4 border flex items-center gap-4">
                <div className="p-3 rounded-lg bg-background border shadow-sm">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">
                    {asset.make} {asset.model}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase font-bold tracking-tight"
                    >
                      {asset.category}
                    </Badge>
                    {asset.price && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        ${asset.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Current Owner
                    </Label>
                  </div>
                  <div className="rounded-lg border p-3 bg-muted/30 text-sm font-medium">
                    {asset.employee === "UNASSIGNED" ? (
                      <span className="text-muted-foreground italic">
                        No current owner
                      </span>
                    ) : (
                      asset.employee
                    )}
                  </div>
                </div>

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
                      Change Note
                    </Label>
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
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 sm:flex-none px-8 font-bold"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Assignment
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
