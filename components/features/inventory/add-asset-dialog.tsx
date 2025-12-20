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
  IconLoader2,
  IconPackage,
  IconTag,
  IconBox,
  IconSettings,
  IconDeviceLaptop,
  IconDeviceTv,
  IconUsb,
  IconHeadphones,
  IconWifi,
  IconPrinter,
  IconServer,
  IconCpu,
  IconDatabase,
  IconScreenShare,
  IconCalendar,
  IconMapPin,
  IconMessageCircle,
  IconShieldCheck,
  IconCategory,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ASSET_CATEGORIES, ASSET_STATES, ASSET_LOCATIONS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAssetDialog({ open, onOpenChange }: AddAssetDialogProps) {
  const [loading, setLoading] = React.useState(false);

  // Unified form state matching the schema
  const [formData, setFormData] = React.useState({
    category: "Laptop",
    state: "NEW",
    make: "",
    model: "",
    servicetag: "",
    warrantyexpiry: "",
    location: "Office",
    cpu: "",
    ram: "",
    storage: "",
    dedicatedgpu: "",
    "usb-aports": "",
    "usb-cports": "",
    dimensions: "",
    resolution: "",
    refreshhertz: "",
    additionalcomments: "",
    employee: "UNASSIGNED",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Asset added successfully", {
        description: "The new asset is now available in the inventory.",
      });
      // Reset form on success
      setFormData({
        category: "Laptop",
        state: "NEW",
        make: "",
        model: "",
        servicetag: "",
        warrantyexpiry: "",
        location: "Office",
        cpu: "",
        ram: "",
        storage: "",
        dedicatedgpu: "",
        "usb-aports": "",
        "usb-cports": "",
        dimensions: "",
        resolution: "",
        refreshhertz: "",
        additionalcomments: "",
        employee: "UNASSIGNED",
      });
      onOpenChange(false);
    }, 1500);
  };

  const renderSpecsFields = () => {
    const { category } = formData;

    if (category === "Laptop" || category === "Desktop") {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b">
            <IconSettings className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
              Technical Specifications
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="cpu"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                CPU
              </Label>
              <div className="relative">
                <IconCpu className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="cpu"
                  placeholder="e.g. Core i7-12700H"
                  className="pl-9 bg-background/50"
                  value={formData.cpu}
                  onChange={(e) => handleInputChange("cpu", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="ram"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                RAM
              </Label>
              <div className="relative">
                <IconCpu className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="ram"
                  placeholder="e.g. 16GB DDR4"
                  className="pl-9 bg-background/50"
                  value={formData.ram}
                  onChange={(e) => handleInputChange("ram", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="storage"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Storage
              </Label>
              <div className="relative">
                <IconDatabase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="storage"
                  placeholder="e.g. 512GB NVMe"
                  className="pl-9 bg-background/50"
                  value={formData.storage}
                  onChange={(e) => handleInputChange("storage", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="gpu"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Dedicated GPU
              </Label>
              <div className="relative">
                <IconScreenShare className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="gpu"
                  placeholder="e.g. RTX 3050"
                  className="pl-9 bg-background/50"
                  value={formData.dedicatedgpu}
                  onChange={(e) =>
                    handleInputChange("dedicatedgpu", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (category === "Monitor" || category === "TV") {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b">
            <IconScreenShare className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
              Display Specifications
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="dimensions"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Dimensions
              </Label>
              <Input
                id="dimensions"
                placeholder="e.g. 27 inch"
                className="bg-background/50"
                value={formData.dimensions}
                onChange={(e) =>
                  handleInputChange("dimensions", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="resolution"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Resolution
              </Label>
              <Input
                id="resolution"
                placeholder="e.g. 2560x1440"
                className="bg-background/50"
                value={formData.resolution}
                onChange={(e) =>
                  handleInputChange("resolution", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="refresh"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Refresh Rate (Hz)
              </Label>
              <Input
                id="refresh"
                placeholder="e.g. 144"
                className="bg-background/50"
                value={formData.refreshhertz}
                onChange={(e) =>
                  handleInputChange("refreshhertz", e.target.value)
                }
              />
            </div>
          </div>
        </div>
      );
    }

    if (category === "Docking") {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b">
            <IconUsb className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
              Port Connectivity
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="usb-a"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                USB-A Ports
              </Label>
              <Input
                id="usb-a"
                placeholder="e.g. 3x USB 3.0"
                className="bg-background/50"
                value={formData["usb-aports"]}
                onChange={(e) =>
                  handleInputChange("usb-aports", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="usb-c"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                USB-C Ports
              </Label>
              <Input
                id="usb-c"
                placeholder="e.g. 1x PD, 1x Data"
                className="bg-background/50"
                value={formData["usb-cports"]}
                onChange={(e) =>
                  handleInputChange("usb-cports", e.target.value)
                }
              />
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Laptop":
        return <IconDeviceLaptop className="h-4 w-4" />;
      case "Monitor":
        return <IconDeviceTv className="h-4 w-4" />;
      case "TV":
        return <IconDeviceTv className="h-4 w-4" />;
      case "Docking":
        return <IconUsb className="h-4 w-4" />;
      case "Headset":
        return <IconHeadphones className="h-4 w-4" />;
      case "Network":
      case "Network Switch":
      case "Firewall":
      case "Access Point":
        return <IconWifi className="h-4 w-4" />;
      case "Printer":
        return <IconPrinter className="h-4 w-4" />;
      case "Desktop":
        return <IconServer className="h-4 w-4" />;
      default:
        return <IconBox className="h-4 w-4" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col border-l shadow-2xl overflow-hidden"
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-full bg-background"
        >
          {/* Header */}
          <div className="p-6 bg-linear-to-br from-primary/10 via-background to-background border-b">
            <SheetHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-primary/10 shadow-sm border border-primary/20">
                  <IconPackage className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold tracking-tight">
                    Add New Asset
                  </SheetTitle>
                  <SheetDescription className="text-muted-foreground">
                    Register a new device into the inventory system.
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-8 pb-10">
              {/* Item Information Card */}
              <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <IconTag className="h-12 w-12" />
                </div>

                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <IconCategory className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                    Basic Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="category"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Category *
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => handleInputChange("category", v)}
                      required
                    >
                      <SelectTrigger
                        id="category"
                        className="h-10 bg-background/50 border-muted-foreground/20"
                      >
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSET_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(cat)}
                              <span>{cat}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="state"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Initial Status *
                    </Label>
                    <Select
                      value={formData.state}
                      onValueChange={(v) => handleInputChange("state", v)}
                      required
                    >
                      <SelectTrigger
                        id="state"
                        className="h-10 bg-background/50 border-muted-foreground/20"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSET_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            <div className="flex items-center gap-2">
                              {state === "NEW" && (
                                <IconShieldCheck className="h-4 w-4 text-sky-500" />
                              )}
                              {state === "GOOD" && (
                                <IconShieldCheck className="h-4 w-4 text-emerald-500" />
                              )}
                              <span>{state}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="make"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Make *
                    </Label>
                    <Input
                      id="make"
                      placeholder="e.g. Dell"
                      className="h-10 bg-background/50 border-muted-foreground/20"
                      value={formData.make}
                      onChange={(e) =>
                        handleInputChange("make", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="model"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Model *
                    </Label>
                    <Input
                      id="model"
                      placeholder="e.g. Vostro 3520"
                      className="h-10 bg-background/50 border-muted-foreground/20"
                      value={formData.model}
                      onChange={(e) =>
                        handleInputChange("model", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2 col-span-full">
                    <Label
                      htmlFor="servicetag"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Service Tag / Serial *
                    </Label>
                    <div className="relative">
                      <IconTag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                      <Input
                        id="servicetag"
                        placeholder="e.g. ABC1234"
                        className="pl-9 h-10 font-mono bg-background/50 border-muted-foreground/20"
                        value={formData.servicetag}
                        onChange={(e) =>
                          handleInputChange("servicetag", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Specs Section */}
              {renderSpecsFields()}

              {/* Additional Details Card */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <IconSettings className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                    Additional Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="warranty"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Warranty Expiry
                    </Label>
                    <div className="relative">
                      <IconCalendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                      <Input
                        id="warranty"
                        type="date"
                        className="pl-9 h-10 bg-background/50"
                        value={formData.warrantyexpiry}
                        onChange={(e) =>
                          handleInputChange("warrantyexpiry", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="location"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Current Location *
                    </Label>
                    <Select
                      value={formData.location}
                      onValueChange={(v) => handleInputChange("location", v)}
                    >
                      <SelectTrigger
                        id="location"
                        className="h-10 bg-background/50"
                      >
                        <div className="flex items-center gap-2">
                          <IconMapPin className="h-4 w-4 text-muted-foreground" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {ASSET_LOCATIONS.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="comments"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Additional Comments
                  </Label>
                  <div className="relative">
                    <IconMessageCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                    <Textarea
                      id="comments"
                      placeholder="Enter any additional notes..."
                      className="pl-9 min-h-[100px] resize-none bg-background/50"
                      value={formData.additionalcomments}
                      onChange={(e) =>
                        handleInputChange("additionalcomments", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
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
                disabled={loading}
                className="flex-1 sm:flex-none px-10 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98] h-11 border-none"
              >
                {loading && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {loading ? "Adding..." : "Add Asset"}
              </Button>
            </SheetFooter>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
