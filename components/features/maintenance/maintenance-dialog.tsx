"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { createMaintenanceRequest } from "@/services/maintenance-service";
import {
  searchAssets,
  getAssetByServiceTag,
} from "@/services/inventory-service";
import techniciansData from "@/data/technicians.json";
import { logActivity } from "@/services/dashboard-service";
import {
  IconLoader2,
  IconTag,
  IconCategory,
  IconSettings,
  IconAlertCircle,
  IconUser,
  IconCalendar,
  IconCurrencyDollar,
  IconHistory,
  IconCheck,
  IconDeviceLaptop,
  IconDeviceTv,
  IconUsb,
  IconHeadphones,
  IconWifi,
  IconPrinter,
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleDot,
  IconCircle,
  IconFileText,
} from "@tabler/icons-react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  MaintenanceCategory,
  MaintenancePriority,
  MaintenancePriorityEnum,
  MaintenanceStatusEnum,
  Asset,
} from "@/lib/types";

interface MaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface OwnerHistory {
  name: string;
  role: string;
  date: string;
}

interface Technician {
  id: string;
  name: string;
  specialty?: string;
}

export function MaintenanceDialog({
  open,
  onOpenChange,
  onSuccess,
}: MaintenanceDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [history, setHistory] = React.useState<OwnerHistory[]>([]);
  const [openCombobox, setOpenCombobox] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<Asset[]>([]);

  const [openTechnicianCombobox, setOpenTechnicianCombobox] =
    React.useState(false);
  const [technicianSuggestions, setTechnicianSuggestions] = React.useState<
    Technician[]
  >([]);

  const [formData, setFormData] = React.useState({
    assetTag: "",
    assetCategory: "",
    assetMake: "",
    assetModel: "",
    issue: "",
    description: "",
    category: "hardware" as MaintenanceCategory,
    priority: MaintenancePriorityEnum.Medium,
    technician: "",
    scheduledDate: "",
    estimatedCost: "",
    notes: "",
  });

  // Handle service tag search and suggestions
  const handleSearchChange = async (value: string) => {
    setFormData((prev) => ({ ...prev, assetTag: value }));
    if (value.length >= 2) {
      try {
        const results = await searchAssets(value);
        setSuggestions(results);
      } catch (error) {
        console.error("Error searching assets:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Auto-fill logic when assetTag changes (either typed or selected)
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.assetTag && formData.assetTag.length >= 3) {
        setSearching(true);
        try {
          // Check if we have an exact match in suggestions first to avoid API call
          const exactMatch = suggestions.find(
            (s) =>
              s.serviceTag.toLowerCase() === formData.assetTag.toLowerCase()
          );

          let asset: Asset | null | undefined = exactMatch;
          if (!asset) {
            asset = await getAssetByServiceTag(formData.assetTag);
          }

          if (asset) {
            setFormData((prev) => ({
              ...prev,
              assetCategory: asset!.category || "",
              assetMake: asset!.make || "",
              assetModel: asset!.model || "",
            }));

            // Mock history - in a real app, this would come from the API
            const mockHistory: OwnerHistory[] = [];
            if (asset.employee && asset.employee !== "UNASSIGNED") {
              mockHistory.push({
                name: asset.employee,
                role: "Current User",
                date: "2024-01-15",
              });
            }
            mockHistory.push({
              name: "Previous User",
              role: "Former Owner",
              date: "2023-06-10",
            });

            setHistory(mockHistory.slice(0, 2));
          } else {
            setHistory([]);
          }
        } catch (error) {
          console.error("Error fetching asset details:", error);
        } finally {
          setSearching(false);
        }
      } else {
        setHistory([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.assetTag, suggestions]);

  // Technician autofill logic
  React.useEffect(() => {
    if (!formData.technician) {
      setTechnicianSuggestions(techniciansData);
      return;
    }

    // Simple client-side filtering
    const filtered = techniciansData.filter((tech) =>
      tech.name.toLowerCase().includes(formData.technician.toLowerCase())
    );
    setTechnicianSuggestions(filtered);
  }, [formData.technician]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createMaintenanceRequest({
        tenantId: "00000000-0000-0000-0000-000000000000",
        assetTag: formData.assetTag,
        assetCategory: formData.assetCategory,
        assetMake: formData.assetMake,
        assetModel: formData.assetModel,
        reportedBy: "Current User",
        reportedDate: new Date().toISOString(),
        issue: formData.issue,
        description: formData.description,
        category: formData.category,
        status: MaintenanceStatusEnum.Pending,
        priority: formData.priority,
        technician: formData.technician || undefined,
        scheduledDate: formData.scheduledDate || undefined,
        estimatedCost: formData.estimatedCost
          ? parseFloat(formData.estimatedCost)
          : undefined,
        notes: formData.notes ? [formData.notes] : [],
      });

      await logActivity({
        user: { name: "Current User", avatar: "", initials: "ME" },
        action: "maintenance_requested",
        target: formData.assetTag,
        comment: formData.notes,
      });

      // Reset form
      setFormData({
        assetTag: "",
        assetCategory: "",
        assetMake: "",
        assetModel: "",
        issue: "",
        description: "",
        category: "hardware",
        priority: MaintenancePriorityEnum.Medium,
        technician: "",
        scheduledDate: "",
        estimatedCost: "",
        notes: "",
      });
      setHistory([]);

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create maintenance request:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedAssetLabel = React.useMemo(() => {
    return formData.assetTag;
  }, [formData.assetTag]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col border-l shadow-2xl overflow-hidden"
        onInteractOutside={(e) => {
          // Prevent sheet from closing when interacting with portal-based elements
          // like Popovers, Comboboxes, and Selects that render in portals
          e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          // Prevent sheet from closing when clicking on portal-based elements
          e.preventDefault();
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-full bg-background"
        >
          {/* Header */}
          <div className="p-6 bg-linear-to-br from-sky-500/10 via-background to-background border-b">
            <SheetHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-sky-500/10 shadow-sm border border-sky-500/20">
                  <IconSettings className="h-6 w-6 text-sky-500" />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold tracking-tight">
                    Create Maintenance Request
                  </SheetTitle>
                  <SheetDescription className="text-muted-foreground">
                    Submit a new maintenance request for an asset in your
                    inventory.
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-8 pb-10">
              {/* TOP: Item Details */}
              <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <IconTag className="h-12 w-12" />
                </div>

                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <IconTag className="h-4 w-4 text-sky-500" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                    Item Information
                  </h3>
                  {searching && (
                    <IconLoader2 className="h-4 w-4 animate-spin ml-auto text-sky-500" />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 flex flex-col">
                    <Label
                      htmlFor="assetTag"
                      className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                    >
                      Service Tag *
                    </Label>
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCombobox}
                          className="h-10 justify-between font-mono bg-background/50 border-muted-foreground/20 text-left font-normal"
                        >
                          {formData.assetTag || "Select or type tag..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search service tag..."
                            value={formData.assetTag}
                            onValueChange={handleSearchChange}
                          />
                          <CommandList>
                            <CommandEmpty>No asset found.</CommandEmpty>
                            <CommandGroup>
                              {suggestions.map((asset) => (
                                <CommandItem
                                  key={asset.id}
                                  value={asset.serviceTag}
                                  onSelect={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      assetTag: asset.serviceTag,
                                    }));
                                    setOpenCombobox(false);
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-bold">
                                      {asset.serviceTag}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {asset.make} {asset.model}
                                    </span>
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      formData.assetTag === asset.serviceTag
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
                      htmlFor="assetCategory"
                      className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                    >
                      Category *
                    </Label>
                    <Select
                      value={formData.assetCategory}
                      onValueChange={(value) =>
                        setFormData({ ...formData, assetCategory: value })
                      }
                      required
                    >
                      <SelectTrigger
                        id="assetCategory"
                        className="h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-sky-500/20 bg-background/50"
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Laptop">
                          <div className="flex items-center gap-2">
                            <IconDeviceLaptop className="h-4 w-4" />
                            <span>Laptop</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Monitor">
                          <div className="flex items-center gap-2">
                            <IconDeviceTv className="h-4 w-4" />
                            <span>Monitor</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Docking">
                          <div className="flex items-center gap-2">
                            <IconUsb className="h-4 w-4" />
                            <span>Docking Station</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Headset">
                          <div className="flex items-center gap-2">
                            <IconHeadphones className="h-4 w-4" />
                            <span>Headset</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Network">
                          <div className="flex items-center gap-2">
                            <IconWifi className="h-4 w-4" />
                            <span>Network Equipment</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Printer">
                          <div className="flex items-center gap-2">
                            <IconPrinter className="h-4 w-4" />
                            <span>Printer</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="assetMake"
                      className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                    >
                      Make
                    </Label>
                    <Input
                      id="assetMake"
                      placeholder="e.g., Dell"
                      value={formData.assetMake}
                      onChange={(e) =>
                        setFormData({ ...formData, assetMake: e.target.value })
                      }
                      className="h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-sky-500/20 bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="assetModel"
                      className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                    >
                      Model
                    </Label>
                    <Input
                      id="assetModel"
                      placeholder="e.g., Vostro 3520"
                      value={formData.assetModel}
                      onChange={(e) =>
                        setFormData({ ...formData, assetModel: e.target.value })
                      }
                      className="h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-sky-500/20 bg-background/50"
                    />
                  </div>
                </div>
              </div>

              {/* MIDDLE: Maintenance Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <IconAlertCircle className="h-4 w-4 text-orange-500" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                    Maintenance Details
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="issue" className="text-sm font-semibold">
                      Issue Summary *
                    </Label>
                    <Input
                      id="issue"
                      placeholder="e.g., Screen flickering after 10 minutes"
                      value={formData.issue}
                      onChange={(e) =>
                        setFormData({ ...formData, issue: e.target.value })
                      }
                      className="transition-all focus:ring-2 focus:ring-sky-500/20 h-10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-semibold"
                    >
                      Detailed Description *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Provide any additional context, symptoms, or steps to reproduce..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="resize-none transition-all focus:ring-2 focus:ring-sky-500/20 text-sm leading-relaxed"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="category"
                        className="text-sm font-semibold"
                      >
                        Issue Category *
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            category: value as MaintenanceCategory,
                          })
                        }
                      >
                        <SelectTrigger
                          id="category"
                          className="transition-all focus:ring-2 focus:ring-sky-500/20 h-10"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hardware">
                            <div className="flex items-center gap-2">
                              <IconCategory className="h-4 w-4" />
                              <span>Hardware</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="software">
                            <div className="flex items-center gap-2">
                              <IconSettings className="h-4 w-4" />
                              <span>Software</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="network">
                            <div className="flex items-center gap-2">
                              <IconCheck className="h-4 w-4" />
                              <span>Network</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="preventive">
                            <div className="flex items-center gap-2">
                              <IconCalendar className="h-4 w-4" />
                              <span>Preventive</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="priority"
                        className="text-sm font-semibold"
                      >
                        Priority *
                      </Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            priority: value as MaintenancePriority,
                          })
                        }
                      >
                        <SelectTrigger
                          id="priority"
                          className="transition-all focus:ring-2 focus:ring-sky-500/20 h-10"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">
                            <div className="flex items-center gap-2">
                              <IconAlertTriangle className="h-4 w-4 text-red-500" />
                              <Badge
                                variant="destructive"
                                className="bg-red-500 hover:bg-red-600"
                              >
                                CRITICAL
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2">
                              <IconCircleCheck className="h-4 w-4 text-orange-500" />
                              <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-transparent">
                                HIGH
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center gap-2">
                              <IconCircleDot className="h-4 w-4 text-blue-500" />
                              <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-transparent">
                                MEDIUM
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="low">
                            <div className="flex items-center gap-2">
                              <IconCircle className="h-4 w-4 text-muted-foreground" />
                              <Badge
                                variant="outline"
                                className="text-muted-foreground border-muted-foreground"
                              >
                                LOW
                              </Badge>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 flex flex-col">
                      <Label
                        htmlFor="technician"
                        className="text-sm font-semibold"
                      >
                        Assign Technician
                      </Label>
                      <Popover
                        open={openTechnicianCombobox}
                        onOpenChange={setOpenTechnicianCombobox}
                      >
                        <PopoverTrigger asChild>
                          <div className="relative">
                            <IconUser className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openTechnicianCombobox}
                              className="w-full pl-9 justify-between font-normal bg-background/50 border-muted-foreground/20 text-left h-10"
                            >
                              {formData.technician || "Technician name"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Search technician..."
                              value={formData.technician}
                              onValueChange={(val) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  technician: val,
                                }))
                              }
                            />
                            <CommandList>
                              <CommandEmpty>No technician found.</CommandEmpty>
                              <CommandGroup>
                                {technicianSuggestions.map((tech) => (
                                  <CommandItem
                                    key={tech.id}
                                    value={tech.name}
                                    onSelect={() => {
                                      setFormData((prev) => ({
                                        ...prev,
                                        technician: tech.name,
                                      }));
                                      setOpenTechnicianCombobox(false);
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-bold">
                                        {tech.name}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {tech.specialty}
                                      </span>
                                    </div>
                                    <Check
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        formData.technician === tech.name
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
                        htmlFor="scheduledDate"
                        className="text-sm font-semibold"
                      >
                        Scheduled Date
                      </Label>
                      <div className="relative">
                        <IconCalendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="scheduledDate"
                          type="date"
                          value={formData.scheduledDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              scheduledDate: e.target.value,
                            })
                          }
                          className="pl-9 transition-all focus:ring-2 focus:ring-sky-500/20 h-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="estimatedCost"
                      className="text-sm font-semibold"
                    >
                      Estimated Cost
                    </Label>
                    <div className="relative">
                      <IconCurrencyDollar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                      <Input
                        id="estimatedCost"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.estimatedCost}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            estimatedCost: e.target.value,
                          })
                        }
                        className="pl-9 transition-all focus:ring-2 focus:ring-sky-500/20 h-10 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="maintenance-notes"
                      className="text-sm font-semibold"
                    >
                      Additional Notes (Optional)
                    </Label>
                    <div className="relative">
                      <IconFileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                      <Textarea
                        id="maintenance-notes"
                        placeholder="Internal comments or deployment notes..."
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            notes: e.target.value,
                          })
                        }
                        rows={3}
                        className="pl-9 resize-none transition-all focus:ring-2 focus:ring-sky-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM: Ownership History */}
              {history.length > 0 && (
                <div className="space-y-4 rounded-2xl bg-muted/20 p-6 border border-border/50 shadow-inner">
                  <div className="flex items-center gap-2 mb-2">
                    <IconHistory className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                      Asset History
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {history.map((owner: OwnerHistory, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm transform transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-primary/20 group"
                      >
                        <div className="relative">
                          <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${owner.name}`}
                              alt={owner.name}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                              {owner.name
                                .split(",")
                                .map((n) => n.trim()[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-base font-bold truncate tracking-tight text-foreground/90">
                            {owner.name}
                          </span>
                          <div className="flex items-center gap-3 pt-0.5">
                            <Badge
                              variant="outline"
                              className="h-5 px-2 text-[10px] font-bold uppercase tracking-tighter bg-muted/50 border-muted-foreground/20"
                            >
                              {owner.role}
                            </Badge>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                              <IconCalendar className="h-3 w-3" />
                              {owner.date}
                            </div>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2 text-primary">
                          <IconCheck className="h-5 w-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-muted/30 border-t backdrop-blur-md">
            <SheetFooter className="items-center justify-end gap-3 flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1 sm:flex-none px-8 font-semibold hover:bg-background h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || searching}
                className="flex-1 sm:flex-none px-10 font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-500/20 hover:scale-[1.02] transition-all active:scale-[0.98] h-11 border-none"
              >
                {loading && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Request
              </Button>
            </SheetFooter>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
