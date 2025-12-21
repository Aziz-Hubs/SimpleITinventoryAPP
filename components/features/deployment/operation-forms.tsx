"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

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
import {
  IconLogout,
  IconUserPlus,
  IconUserMinus,
  IconAlertTriangle,
  IconTrash,
  IconHelpCircle,
  IconInfoCircle,
  IconUser,
  IconArrowsRightLeft,
  IconLoader2,
  IconCircleCheck,
  IconRefresh,
  IconBriefcase,
  IconMinus,
  IconAlertOctagon,
} from "@tabler/icons-react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
import { Check, ChevronsUpDown } from "lucide-react";
import { useModels } from "@/hooks/api/use-models";
import { Model, Asset, Employee } from "@/lib/types";

// Service Imports
import {
  searchAssets,
  getAssetByServiceTag,
  updateAsset,
} from "@/services/inventory-service";
import { getEmployees } from "@/services/employee-service";
import { logActivity } from "@/services/dashboard-service";

// Mock serial number database for auto-fill (Same as AddAssetDialog)
const MOCK_SERIAL_LOOKUP: Record<string, string> = {
  "TAG-VOSTRO": "Vostro 3520",
  "TAG-X1": "ThinkPad X1 Carbon Gen 10",
  "TAG-MAC": "MacBook Pro 16",
  "TAG-DELL24": "P2419H",
  "TAG-DOCK": "ThinkPad Universal USB-C Dock",
};

const MOCK_EXISTING_TAGS = Object.keys(MOCK_SERIAL_LOOKUP).map((tag) => ({
  value: tag,
  label: tag,
  model: MOCK_SERIAL_LOOKUP[tag],
}));

interface ActionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Import AddAssetDialog to reuse its functionality
import { AddAssetDialog as InnerAddAssetDialog } from "@/components/features/inventory/add-asset-dialog";

export function OnboardAssetDialog({ open, onOpenChange }: ActionProps) {
  // Directly render the AddAssetDialog as requested by the user to keep them identical
  return <InnerAddAssetDialog open={open} onOpenChange={onOpenChange} />;
}

export function OffboardAssetDialog({ open, onOpenChange }: ActionProps) {
  const [assetTag, setAssetTag] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [assetSuggestions, setAssetSuggestions] = React.useState<Asset[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const [openTagCombobox, setOpenTagCombobox] = React.useState(false);

  React.useEffect(() => {
    if (assetTag.length > 2) {
      searchAssets(assetTag).then((results) => {
        setAssetSuggestions(results);
      });
    } else {
      setAssetSuggestions([]);
    }
  }, [assetTag]);

  const handleOffboard = async () => {
    if (!assetTag || !reason) return;
    setIsLoading(true);

    try {
      const asset = await getAssetByServiceTag(assetTag);
      if (!asset) {
        toast.error("Asset not found. Please verify the tag.");
        return;
      }

      await updateAsset(asset.id, {
        state: "Retired",
        employee: "UNASSIGNED",
        additionalcomments:
          asset.additionalcomments + `\nRetired: ${reason}. ${comment}`,
      });

      await logActivity({
        user: { name: "Current User", avatar: "", initials: "ME" },
        action: "retired",
        target: asset.servicetag,
        comment: `${reason} - ${comment}`,
      });

      toast.success(`Asset ${asset.servicetag} successfully retired.`);

      onOpenChange(false);
      setAssetTag("");
      setReason("");
      setComment("");
    } catch (e) {
      console.error(e);
      toast.error("Failed to retire asset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col border-l shadow-2xl overflow-hidden"
      >
        <div className="flex flex-col h-full bg-background">
          <div className="p-6 bg-linear-to-br from-destructive/10 via-background to-background border-b">
            <SheetHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-destructive/10 shadow-sm border border-destructive/20">
                  <IconLogout className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold tracking-tight">
                    Offboard Asset
                  </SheetTitle>
                  <SheetDescription className="text-muted-foreground">
                    Permanently retire or dispose of an existing asset.
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8 pb-10">
              <div className="space-y-6 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <IconAlertTriangle className="h-4 w-4 text-destructive" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                    Retirement Details
                  </h3>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2 flex flex-col">
                    <Label
                      htmlFor="off-tag"
                      className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                    >
                      Asset Tag *
                    </Label>
                    <Popover
                      open={openTagCombobox}
                      onOpenChange={setOpenTagCombobox}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openTagCombobox}
                          className="w-full justify-between bg-background/50 border-muted-foreground/20 h-10 font-mono text-left font-normal"
                        >
                          {assetTag || "Select or type tag..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search Asset Tag..."
                            value={assetTag}
                            onValueChange={setAssetTag}
                          />
                          <CommandList>
                            <CommandEmpty>
                              No matching assets found.
                            </CommandEmpty>
                            <CommandGroup>
                              {assetSuggestions.map((asset) => (
                                <CommandItem
                                  key={asset.id}
                                  value={asset.servicetag}
                                  onSelect={() => {
                                    setAssetTag(asset.servicetag);
                                    setOpenTagCombobox(false);
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-bold">
                                      {asset.servicetag}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {asset.model}
                                    </span>
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      assetTag === asset.servicetag
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="reason"
                      className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                    >
                      Retirement Reason *
                    </Label>
                    <Select onValueChange={setReason}>
                      <SelectTrigger className="h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-destructive/20 bg-background/50">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="End of Life">
                          <div className="flex items-center gap-2">
                            <IconTrash className="h-4 w-4" />
                            <span>End of Life</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Broken/Damaged">
                          <div className="flex items-center gap-2">
                            <IconAlertTriangle className="h-4 w-4" />
                            <span>Broken/Damaged</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Lost/Stolen">
                          <div className="flex items-center gap-2">
                            <IconHelpCircle className="h-4 w-4" />
                            <span>Lost/Stolen</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="off-comment"
                      className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                    >
                      Deployment Comment (Optional)
                    </Label>
                    <Textarea
                      id="off-comment"
                      placeholder="Additional notes..."
                      rows={4}
                      className="transition-all border-muted-foreground/20 focus:ring-2 focus:ring-destructive/20 bg-background/50 resize-none"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10 flex items-start gap-3">
                <IconInfoCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive/80 leading-relaxed">
                  Notice: This action will mark the asset as retired and it will
                  no longer be available for assignment.
                </p>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 bg-muted/30 border-t backdrop-blur-md">
            <SheetFooter className="items-center justify-end gap-3 flex-row">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 sm:flex-none px-8 font-bold shadow-lg shadow-destructive/20"
                onClick={handleOffboard}
                disabled={!assetTag || !reason || isLoading}
              >
                {isLoading && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirm Retirement
              </Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function AssignAssetDialog({ open, onOpenChange }: ActionProps) {
  const [assetTag, setAssetTag] = React.useState("");
  const [employeeName, setEmployeeName] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const [assetSuggestions, setAssetSuggestions] = React.useState<Asset[]>([]);
  const [employeeSuggestions, setEmployeeSuggestions] = React.useState<
    Employee[]
  >([]);

  const [openTagCombobox, setOpenTagCombobox] = React.useState(false);
  const [openEmployeeCombobox, setOpenEmployeeCombobox] = React.useState(false);

  React.useEffect(() => {
    if (assetTag.length > 1) {
      searchAssets(assetTag).then((results) => {
        // We only want unassigned assets for assignment
        setAssetSuggestions(
          results.filter((a) => !a.employee || a.employee === "UNASSIGNED")
        );
      });
    } else {
      setAssetSuggestions([]);
    }
  }, [assetTag]);

  React.useEffect(() => {
    if (employeeName.length > 1) {
      getEmployees({ search: employeeName }).then((results) => {
        setEmployeeSuggestions(results.data);
      });
    } else {
      setEmployeeSuggestions([]);
    }
  }, [employeeName]);

  const handleAssign = async () => {
    if (!assetTag || !employeeName) return;
    setIsLoading(true);

    try {
      const asset = await getAssetByServiceTag(assetTag);
      if (!asset) {
        toast.error("Asset not found. Please verify the tag.");
        return;
      }

      await updateAsset(asset.id, { employee: employeeName });

      await logActivity({
        user: { name: "Current User", avatar: "", initials: "ME" }, // Mock current user
        action: "assigned",
        target: asset.servicetag,
        comment: comment,
      });

      toast.success(
        `Asset ${asset.servicetag} assigned to ${employeeName} successfully.`
      );

      onOpenChange(false);
      setAssetTag("");
      setEmployeeName("");
      setComment("");
    } catch (e) {
      console.error(e);
      toast.error("Failed to assign asset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col border-l shadow-2xl overflow-hidden"
      >
        <div className="flex flex-col h-full bg-background">
          <div className="p-6 bg-linear-to-br from-indigo-500/10 via-background to-background border-b">
            <SheetHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 shadow-sm border border-indigo-500/20">
                  <IconUserPlus className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold tracking-tight">
                    Assign Asset
                  </SheetTitle>
                  <SheetDescription className="text-muted-foreground">
                    Connect an asset with a primary custodian.
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8 pb-10">
              <div className="space-y-6 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <IconUser className="h-4 w-4 text-indigo-500" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                    Assignment Details
                  </h3>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2 flex flex-col">
                    <Label
                      htmlFor="assign-tag"
                      className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                    >
                      Asset Tag *
                    </Label>
                    <Popover
                      open={openTagCombobox}
                      onOpenChange={setOpenTagCombobox}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openTagCombobox}
                          className="w-full justify-between bg-background/50 border-muted-foreground/20 h-10 font-mono text-left font-normal"
                        >
                          {assetTag || "Scan or type TAG..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search Asset Tag..."
                            value={assetTag}
                            onValueChange={setAssetTag}
                          />
                          <CommandList>
                            <CommandEmpty>
                              No matching assets found.
                            </CommandEmpty>
                            <CommandGroup>
                              {assetSuggestions.map((asset) => (
                                <CommandItem
                                  key={asset.id}
                                  value={asset.servicetag}
                                  onSelect={() => {
                                    setAssetTag(asset.servicetag);
                                    setOpenTagCombobox(false);
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-bold">
                                      {asset.servicetag}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {asset.model}
                                    </span>
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      assetTag === asset.servicetag
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2 flex flex-col">
                    <Label
                      htmlFor="employee"
                      className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                    >
                      Target Employee *
                    </Label>
                    <Popover
                      open={openEmployeeCombobox}
                      onOpenChange={setOpenEmployeeCombobox}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openEmployeeCombobox}
                          className="w-full justify-between bg-background/50 border-muted-foreground/20 h-10 text-left font-normal"
                        >
                          {employeeName || "Select Employee..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search Employee..."
                            value={employeeName}
                            onValueChange={setEmployeeName}
                          />
                          <CommandList>
                            <CommandEmpty>No employees found.</CommandEmpty>
                            <CommandGroup>
                              {employeeSuggestions.map((emp) => (
                                <CommandItem
                                  key={emp.id}
                                  value={emp.fullName}
                                  onSelect={() => {
                                    setEmployeeName(emp.fullName);
                                    setOpenEmployeeCombobox(false);
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {emp.fullName}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {emp.department}
                                    </span>
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      employeeName === emp.fullName
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="notes"
                      className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                    >
                      Deployment Comment (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="e.g., Issued for remote work..."
                      rows={4}
                      className="transition-all border-muted-foreground/20 focus:ring-2 focus:ring-indigo-500/20 bg-background/50 resize-none"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 bg-muted/30 border-t backdrop-blur-md">
            <SheetFooter className="items-center justify-end gap-3 flex-row">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 sm:flex-none px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20 border-none"
                onClick={handleAssign}
                disabled={!assetTag || !employeeName || isLoading}
              >
                {isLoading && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Assign Asset
              </Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function UnassignAssetDialog({ open, onOpenChange }: ActionProps) {
  const [assetTag, setAssetTag] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [assetSuggestions, setAssetSuggestions] = React.useState<Asset[]>([]);
  const [openTagCombobox, setOpenTagCombobox] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (assetTag.length > 1) {
      searchAssets(assetTag).then((results) => {
        // We only want assigned assets for unassignment
        setAssetSuggestions(
          results.filter((a) => a.employee && a.employee !== "UNASSIGNED")
        );
      });
    } else {
      setAssetSuggestions([]);
    }
  }, [assetTag]);

  const handleUnassign = async () => {
    if (!assetTag) return;
    setIsLoading(true);

    try {
      const asset = await getAssetByServiceTag(assetTag);
      if (!asset) {
        toast.error("Asset not found. Please verify the tag.");
        return;
      }

      await updateAsset(asset.id, { employee: "UNASSIGNED" });

      await logActivity({
        user: { name: "Current User", avatar: "", initials: "ME" },
        action: "unassigned",
        target: asset.servicetag,
        comment: comment,
      });

      toast.success(`Asset ${asset.servicetag} successfully returned.`);

      onOpenChange(false);
      setAssetTag("");
      setComment("");
    } catch (e) {
      console.error(e);
      toast.error("Failed to unassign asset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col border-l shadow-2xl overflow-hidden"
      >
        <div className="flex flex-col h-full bg-background">
          <div className="p-6 bg-linear-to-br from-orange-500/10 via-background to-background border-b">
            <SheetHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-orange-500/10 shadow-sm border border-orange-500/20">
                  <IconUserMinus className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold tracking-tight">
                    Unassign Asset
                  </SheetTitle>
                  <SheetDescription className="text-muted-foreground">
                    Return a deployed asset to the central inventory.
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8 pb-10">
              <div className="space-y-6 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <IconArrowsRightLeft className="h-4 w-4 text-orange-500" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                    Return Process
                  </h3>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2 flex flex-col">
                    <Label
                      htmlFor="unassign-tag"
                      className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                    >
                      Asset Tag *
                    </Label>
                    <Popover
                      open={openTagCombobox}
                      onOpenChange={setOpenTagCombobox}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openTagCombobox}
                          className="w-full justify-between bg-background/50 border-muted-foreground/20 h-10 font-mono text-left font-normal"
                        >
                          {assetTag || "Scan or type TAG..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search Asset Tag..."
                            value={assetTag}
                            onValueChange={setAssetTag}
                          />
                          <CommandList>
                            <CommandEmpty>
                              No matching assets found.
                            </CommandEmpty>
                            <CommandGroup>
                              {assetSuggestions.map((asset) => (
                                <CommandItem
                                  key={asset.id}
                                  value={asset.servicetag}
                                  onSelect={() => {
                                    setAssetTag(asset.servicetag);
                                    setOpenTagCombobox(false);
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-bold">
                                      {asset.servicetag}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {asset.employee}
                                    </span>
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      assetTag === asset.servicetag
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="condition"
                      className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                    >
                      Return Condition *
                    </Label>
                    <Select>
                      <SelectTrigger className="h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-orange-500/20 bg-background/50">
                        <SelectValue placeholder="Assess condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GOOD">
                          <div className="flex items-center gap-2">
                            <IconCircleCheck className="h-4 w-4 text-emerald-500" />
                            <span>Good</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="NEW">
                          <div className="flex items-center gap-2">
                            <IconCircleCheck className="h-4 w-4 text-blue-500" />
                            <span>New</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="FAIR">
                          <div className="flex items-center gap-2">
                            <IconAlertTriangle className="h-4 w-4 text-amber-500" />
                            <span>Fair</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="BROKEN">
                          <div className="flex items-center gap-2">
                            <IconAlertTriangle className="h-4 w-4 text-red-500" />
                            <span>Broken</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="unassign-comment"
                      className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                    >
                      Return Notes (Optional)
                    </Label>
                    <Textarea
                      id="unassign-comment"
                      placeholder="e.g., Device wiped and returned to storage..."
                      rows={4}
                      className="transition-all border-muted-foreground/20 focus:ring-2 focus:ring-orange-500/20 bg-background/50 resize-none"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-3">
                <IconInfoCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-600/80 leading-relaxed">
                  Notice: This will dissociate the asset from its current
                  custodian and mark it as available in inventory.
                </p>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 bg-muted/30 border-t backdrop-blur-md">
            <SheetFooter className="items-center justify-end gap-3 flex-row">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 sm:flex-none px-8 bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 border-none"
                onClick={handleUnassign}
                disabled={!assetTag || isLoading}
              >
                {isLoading && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirm Return
              </Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ReassignAssetDialog({ open, onOpenChange }: ActionProps) {
  const [assetTag, setAssetTag] = React.useState("");
  const [fromUser, setFromUser] = React.useState("");
  const [toUser, setToUser] = React.useState("");
  const [comment, setComment] = React.useState("");

  const [assetSuggestions, setAssetSuggestions] = React.useState<Asset[]>([]);
  const [employeeSuggestions, setEmployeeSuggestions] = React.useState<
    Employee[]
  >([]);

  const [openTagCombobox, setOpenTagCombobox] = React.useState(false);
  const [openEmployeeCombobox, setOpenEmployeeCombobox] = React.useState(false);

  React.useEffect(() => {
    if (assetTag.length > 1) {
      import("@/services/inventory-service").then((service) => {
        service.searchAssets(assetTag).then((results) => {
          // Reassign typically happens on assigned assets
          setAssetSuggestions(results);
        });
      });
    } else {
      setAssetSuggestions([]);
    }
  }, [assetTag]);

  React.useEffect(() => {
    if (toUser.length > 1) {
      import("@/services/employee-service").then((service) => {
        service.getEmployees({ search: toUser }).then((results) => {
          setEmployeeSuggestions(results.data);
        });
      });
    } else {
      setEmployeeSuggestions([]);
    }
  }, [toUser]);

  const handleAssetSelect = (asset: Asset) => {
    setAssetTag(asset.servicetag);
    setFromUser(asset.employee || "Unassigned");
    setAssetSuggestions([]);
    setOpenTagCombobox(false);
  };

  const handleReassign = async () => {
    const { getAssetByServiceTag, updateAsset } = await import(
      "@/services/inventory-service"
    );
    const { logActivity } = await import("@/services/dashboard-service");

    try {
      const asset = await getAssetByServiceTag(assetTag);
      if (!asset) return;

      await updateAsset(asset.id, { employee: toUser });

      await logActivity({
        user: { name: "Current User", avatar: "", initials: "ME" },
        action: "reassigned",
        target: asset.servicetag,
        comment: comment,
      });

      onOpenChange(false);
      setAssetTag("");
      setFromUser("");
      setToUser("");
      setComment("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col border-l shadow-2xl overflow-hidden"
      >
        <div className="flex flex-col h-full bg-background">
          <div className="p-6 bg-linear-to-br from-purple-500/10 via-background to-background border-b">
            <SheetHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-purple-500/10 shadow-sm border border-purple-500/20">
                  <IconRefresh className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold tracking-tight">
                    Reassign Asset
                  </SheetTitle>
                  <SheetDescription className="text-muted-foreground">
                    Swiftly transfer hardware between employees.
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8 pb-10">
              <div className="space-y-6 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <IconArrowsRightLeft className="h-4 w-4 text-purple-500" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                    Transfer Protocol
                  </h3>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2 flex flex-col">
                    <Label
                      htmlFor="re-tag"
                      className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                    >
                      Asset Tag *
                    </Label>
                    <Popover
                      open={openTagCombobox}
                      onOpenChange={setOpenTagCombobox}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openTagCombobox}
                          className="w-full justify-between bg-background/50 border-muted-foreground/20 h-10 font-mono text-left font-normal"
                        >
                          {assetTag || "Select or type tag..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Type Tag..."
                            value={assetTag}
                            onValueChange={setAssetTag}
                          />
                          <CommandList>
                            <CommandGroup heading="Recent">
                              {assetSuggestions.map((asset) => (
                                <CommandItem
                                  key={asset.id}
                                  value={asset.servicetag}
                                  onSelect={() => handleAssetSelect(asset)}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-bold">
                                      {asset.servicetag}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {asset.model} - {asset.employee}
                                    </span>
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      assetTag === asset.servicetag
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="from-user"
                        className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                      >
                        Originating User
                      </Label>
                      <Input
                        id="from-user"
                        placeholder="Current User"
                        disabled
                        className="h-10 bg-muted/50 italic border-muted-foreground/10"
                        value={fromUser}
                      />
                    </div>
                    <div className="space-y-2 flex flex-col">
                      <Label
                        htmlFor="to-user"
                        className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                      >
                        Destination User *
                      </Label>
                      <Popover
                        open={openEmployeeCombobox}
                        onOpenChange={setOpenEmployeeCombobox}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openEmployeeCombobox}
                            className="w-full justify-between bg-background/50 border-muted-foreground/20 h-10 font-normal"
                          >
                            {toUser || "Select user..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder="Search employees..."
                              value={toUser}
                              onValueChange={setToUser}
                            />
                            <CommandList>
                              <CommandGroup>
                                {employeeSuggestions.map((emp) => (
                                  <CommandItem
                                    key={emp.id}
                                    value={emp.fullName}
                                    onSelect={() => {
                                      setToUser(emp.fullName);
                                      setOpenEmployeeCombobox(false);
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-bold">
                                        {emp.fullName}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {emp.department}
                                      </span>
                                    </div>
                                    <Check
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        toUser === emp.fullName
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="reassign-comment"
                      className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                    >
                      Deployment Comment (Optional)
                    </Label>
                    <Textarea
                      id="reassign-comment"
                      placeholder="Transfer notes..."
                      rows={4}
                      className="transition-all border-muted-foreground/20 focus:ring-2 focus:ring-purple-500/20 bg-background/50 resize-none"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 bg-muted/30 border-t backdrop-blur-md">
            <SheetFooter className="items-center justify-end gap-3 flex-row">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 sm:flex-none px-8 font-bold shadow-lg shadow-purple-500/20 bg-purple-600 hover:bg-purple-700 text-white border-none"
                onClick={handleReassign}
                disabled={!assetTag || !toUser}
              >
                Transfer Asset
              </Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
