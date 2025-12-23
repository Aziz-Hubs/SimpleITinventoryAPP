"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconLoader2,
  IconPencil,
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
  IconTrash,
  IconArrowLeft,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { z } from "zod";
import {
  ASSET_CATEGORIES,
  ASSET_STATES,
  ASSET_LOCATIONS,
  Asset,
  Model,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { updateAsset, deleteAsset } from "@/services/inventory-service";
import { logActivity } from "@/services/dashboard-service";
import { useModels, useModelById } from "@/hooks/api/use-models";
import { useEmployees } from "@/hooks/api/use-employees";

// Schema for editing an asset
const assetEditSchema = z.object({
  category: z.string().min(1, "Category is required"),
  state: z.string().min(1, "State is required"),
  modelId: z.number().min(1, "Model is required"),
  servicetag: z.string().min(1, "Service tag is required"),
  warrantyexpiry: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  additionalcomments: z.string().optional(),
  employeeId: z.string().optional(),
});

type AssetEdit = z.infer<typeof assetEditSchema>;

interface EditAssetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  onBack?: () => void;
  onSaved?: () => void;
  onDeleted?: () => void;
}

export function EditAssetSheet({
  open,
  onOpenChange,
  asset,
  onBack,
  onSaved,
  onDeleted,
}: EditAssetSheetProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = React.useState(false);
  const [originalValues, setOriginalValues] = React.useState<AssetEdit | null>(
    null
  );

  const { data: models } = useModels();
  const { data: employees } = useEmployees();

  const form = useForm<AssetEdit>({
    resolver: zodResolver(assetEditSchema),
    defaultValues: {
      category: "Laptop",
      state: "NEW",
      modelId: 0,
      servicetag: "",
      warrantyexpiry: "",
      location: "Office",
      additionalcomments: "",
      employeeId: "UNASSIGNED",
    },
  });

  const category = form.watch("category");
  const modelId = form.watch("modelId");
  const { data: selectedModel } = useModelById(modelId);

  // Populate form when asset changes
  React.useEffect(() => {
    if (asset && open) {
      const values: AssetEdit = {
        category: asset.category || "Laptop",
        state: asset.state || "NEW",
        modelId: asset.modelId || 0,
        servicetag: asset.servicetag || "",
        warrantyexpiry: asset.warrantyexpiry || "",
        location: asset.location || "Office",
        additionalcomments: asset.additionalcomments || "",
        employeeId: asset.employeeId || "UNASSIGNED",
      };
      form.reset(values);
      setOriginalValues(values);
    }
  }, [asset, open, form]);

  const getChanges = () => {
    if (!originalValues) return [];
    const currentValues = form.getValues();
    const changes: { key: string; oldVal: string; newVal: string }[] = [];
    (Object.keys(currentValues) as Array<keyof AssetEdit>).forEach((key) => {
      const oldVal = String(originalValues[key] || "");
      const newVal = String(currentValues[key] || "");
      if (oldVal !== newVal) {
        changes.push({ key, oldVal, newVal });
      }
    });
    return changes;
  };

  const onSubmit = async (data: AssetEdit) => {
    if (!asset) return;
    const changes = getChanges();
    if (changes.length > 0) {
      setShowSaveConfirm(true);
    } else {
      // No changes, just close
      onBack?.();
    }
  };

  const confirmSave = async () => {
    if (!asset) return;
    setIsSubmitting(true);
    try {
      const data = form.getValues();
      await updateAsset(asset.id, { ...asset, ...data });
      toast.success("Asset updated successfully");
      await logActivity({
        user: { name: "Current User", avatar: "", initials: "ME" },
        action: "updated",
        target: data.servicetag,
        comment: "Updated via Quick Adjust",
      });
      setShowSaveConfirm(false);
      onSaved?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update asset");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!asset) return;
    setIsSubmitting(true);
    try {
      await deleteAsset(asset.id);
      toast.success("Asset deleted successfully");
      await logActivity({
        user: { name: "Current User", avatar: "", initials: "ME" },
        action: "deleted",
        target: asset.servicetag,
        comment: "Deleted via Quick Adjust",
      });
      setShowDeleteConfirm(false);
      onDeleted?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete asset");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModelSelect = (model: Model) => {
    form.setValue("modelId", model.id);
    toast.info(`Selected model ${model.name}`);
  };

  const [openModelCombobox, setOpenModelCombobox] = React.useState(false);

  // Memoized available models based on category
  const availableModels = React.useMemo(() => {
    if (!category || !models) return [];
    return models.data.filter(
      (m) => m.category.toLowerCase() === category.toLowerCase()
    );
  }, [category, models]);

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

  if (!asset) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl p-0 flex flex-col border-l shadow-2xl overflow-hidden"
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col h-full bg-background"
            >
              {/* Header */}
              <div className="p-6 bg-linear-to-br from-primary/10 via-background to-background border-b">
                <SheetHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-primary/10 shadow-sm border border-primary/20">
                      <IconPencil className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <SheetTitle className="text-2xl font-bold tracking-tight">
                        Edit Asset
                      </SheetTitle>
                      <SheetDescription className="text-muted-foreground">
                        Modify asset details for{" "}
                        <span className="font-mono font-semibold text-foreground">
                          {asset.servicetag}
                        </span>
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-8 pb-10">
                  {/* Back Button */}
                  {onBack && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onBack}
                      className="px-2 h-8 text-muted-foreground hover:text-foreground -mt-2"
                    >
                      <IconArrowLeft className="h-4 w-4 mr-1" />
                      Back to list
                    </Button>
                  )}

                  {/* Basic Information Card */}
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
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Category *
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-10 bg-background/50 border-muted-foreground/20">
                                  <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                              </FormControl>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Status *
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-10 bg-background/50 border-muted-foreground/20">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="col-span-1">
                        <FormField
                          control={form.control}
                          name="modelId"
                          render={({ field }) => (
                            <FormItem className="col-span-1 flex flex-col">
                              <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Model *
                              </FormLabel>
                              <Popover
                                open={openModelCombobox}
                                onOpenChange={setOpenModelCombobox}
                              >
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={openModelCombobox}
                                      className={cn(
                                        "w-full justify-between bg-background/50 border-muted-foreground/20 h-10 font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value
                                        ? availableModels.find(
                                            (model) =>
                                              model.id === field.value
                                          )?.name
                                        : "Select model..."}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-[300px] p-0"
                                  align="start"
                                >
                                  <Command>
                                    <CommandInput placeholder="Search models..." />
                                    <CommandList>
                                      <CommandEmpty>
                                        No model found.
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {availableModels.map((model) => (
                                          <CommandItem
                                            key={model.id}
                                            value={model.name}
                                            onSelect={() => {
                                              handleModelSelect(model);
                                              setOpenModelCombobox(false);
                                            }}
                                          >
                                            <div className="flex flex-col">
                                              <span className="font-medium">
                                                {model.name}
                                              </span>
                                              <span className="text-xs text-muted-foreground">
                                                {model.make}
                                              </span>
                                            </div>
                                            <Check
                                              className={cn(
                                                "ml-auto h-4 w-4",
                                                field.value === model.id
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="servicetag"
                        render={({ field }) => (
                          <FormItem className="col-span-full">
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Service Tag / Serial *
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter service tag"
                                className="h-10 bg-background/50 border-muted-foreground/20 font-mono"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {selectedModel && (
                    <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                        <IconSettings className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                          Technical Specifications
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        {Object.entries(selectedModel.specs).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{key}</p>
                            <p>{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Details Card */}
                  <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                      <IconSettings className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                        Additional Details
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="warrantyexpiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Warranty Expiry
                            </FormLabel>
                            <div className="relative">
                              <IconCalendar className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground/60" />
                              <FormControl>
                                <Input
                                  type="date"
                                  className="pl-9 h-10 bg-background/50"
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Location *
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-10 bg-background/50">
                                  <div className="flex items-center gap-2">
                                    <IconMapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                    <SelectValue />
                                  </div>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ASSET_LOCATIONS.map((loc) => (
                                  <SelectItem key={loc} value={loc}>
                                    {loc}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="additionalcomments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Comments
                          </FormLabel>
                          <div className="relative">
                            <IconMessageCircle className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground/60" />
                            <FormControl>
                              <Textarea
                                placeholder="Notes..."
                                className="pl-9 min-h-[100px] bg-background/50 resize-none"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-muted/30 border-t backdrop-blur-md">
                <SheetFooter className="items-center justify-between gap-3 flex-row">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    <IconTrash className="h-4 w-4" />
                    Delete
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none px-8 font-semibold hover:bg-background h-11"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none px-10 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98] h-11 border-none"
                    >
                      {isSubmitting && (
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </SheetFooter>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete this asset? This action cannot be
              undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <Dialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Changes</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground mb-4">
              The following changes will be applied:
            </p>
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm max-h-[200px] overflow-y-auto">
              {getChanges().length > 0 ? (
                getChanges().map((change, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="font-bold">{change.key}:</span>
                    <span className="text-red-500 line-through">
                      {change.oldVal || "(empty)"}
                    </span>
                    <span>→</span>
                    <span className="text-green-500 font-medium">
                      {change.newVal || "(empty)"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic">
                  No changes detected.
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSaveConfirm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={confirmSave} disabled={isSubmitting}>
              {isSubmitting && (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirm Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
