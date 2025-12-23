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
  IconArrowLeft,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ASSET_CATEGORIES,
  ASSET_STATES,
  ASSET_LOCATIONS,
  assetCreateSchema,
  AssetCreate,
  AssetStateEnum,
} from "@/lib/types";
import { z } from "zod";

const formSchema = z.object({
  category: z.string(),
  state: z.string(),
  make: z.string(),
  model: z.string().min(1, "Model is required"),
  serviceTag: z.string().min(1, "Service Tag is required"),
  warrantyExpiry: z.string().optional(),
  location: z.string(),
  price: z.string().optional(),
  cpu: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  dedicatedgpu: z.string().optional(),
  "usb-aports": z.string().optional(),
  "usb-cports": z.string().optional(),
  dimensions: z.string().optional(),
  resolution: z.string().optional(),
  refreshhertz: z.string().optional(),
  notes: z.string().optional(),
  employee: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
import { cn } from "@/lib/utils";
import { useCreateAsset } from "@/hooks/api/use-assets";
import modelsData from "@/data/models.json";

interface ModelSpec {
  name: string;
  category: string;
  make: string;
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    dedicatedgpu: string;
    "usb-aports": string;
    "usb-cports": string;
    dimensions: string;
    resolution: string;
    refreshhertz: string;
  };
}

// Mock serial number database for auto-fill demo
const MOCK_SERIAL_LOOKUP: Record<string, string> = {
  "TAG-VOSTRO": "Vostro 3520",
  "TAG-X1": "ThinkPad X1 Carbon Gen 10",
  "TAG-MAC": "MacBook Pro 16",
  "TAG-DELL24": "P2419H",
  "TAG-DOCK": "ThinkPad Universal USB-C Dock",
};

// Mock list of existing tags for the dropdown (in a real app this might be 'available' tags or just similar ones)
// Since this is 'Add Asset', maybe these are 'Recently Scanned' or 'Pending' tags?
// For now, let's just use the keys of the mock lookup to populate the dropdown so the user can see them.
const MOCK_EXISTING_TAGS = Object.keys(MOCK_SERIAL_LOOKUP).map((tag) => ({
  value: tag,
  label: tag,
  model: MOCK_SERIAL_LOOKUP[tag],
}));

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
  onCreated?: () => void;
}

export function AddAssetDialog({
  open,
  onOpenChange,
  onBack,
  onCreated,
}: AddAssetDialogProps) {
  const createAsset = useCreateAsset();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "Laptop",
      state: "NEW",
      make: "",
      model: "",
      serviceTag: "",
      warrantyExpiry: "",
      location: "Office",
      price: "",
      cpu: "",
      ram: "",
      storage: "",
      dedicatedgpu: "",
      "usb-aports": "",
      "usb-cports": "",
      dimensions: "",
      resolution: "",
      refreshhertz: "",
      notes: "",
      employee: "UNASSIGNED",
    },
  });

  const category = form.watch("category");

  const onSubmit = async (data: FormValues) => {
    try {
      // Map form string state to Enum
      const stateEnum = data.state as AssetStateEnum;

      const assetData: AssetCreate = {
        serviceTag: data.serviceTag,
        modelId: 1, // TODO: Lookup actual model ID. Hardcoded for now.
        state: stateEnum,
        location: data.location,
        notes: data.notes || null,
        employeeId:
          data.employee === "UNASSIGNED" ? null : data.employee || null,
        invoiceLineItemId: null,
        warrantyExpiry: data.warrantyExpiry || null,
        price: data.price ? parseFloat(data.price) : undefined,
        tenantId: "default", // Should be handled by backend or context
        isDeleted: false,
      };

      await createAsset.mutateAsync(assetData);
      form.reset();
      onOpenChange(false);
      onCreated?.();
    } catch (error) {
      // Toast handled by mutation hook
      console.error("Failed to create asset", error);
    }
  };

  const handleModelSelect = (modelSpec: ModelSpec) => {
    form.setValue("model", modelSpec.name);
    form.setValue("make", modelSpec.make);

    // Auto-fill specs
    form.setValue("cpu", modelSpec.specs.cpu || "");
    form.setValue("ram", modelSpec.specs.ram || "");
    form.setValue("storage", modelSpec.specs.storage || "");
    form.setValue("dedicatedgpu", modelSpec.specs.dedicatedgpu || "");
    form.setValue("usb-aports", modelSpec.specs["usb-aports"] || "");
    form.setValue("usb-cports", modelSpec.specs["usb-cports"] || "");
    form.setValue("dimensions", modelSpec.specs.dimensions || "");
    form.setValue("resolution", modelSpec.specs.resolution || "");
    form.setValue("refreshhertz", modelSpec.specs.refreshhertz || "");

    toast.info(`Auto-filled specs for ${modelSpec.name}`);
  };

  // Watch service tag for auto-lookup
  const [openModelCombobox, setOpenModelCombobox] = React.useState(false);
  const [openTagCombobox, setOpenTagCombobox] = React.useState(false);

  // Watch service tag for auto-lookup
  const serviceTag = form.watch("serviceTag");

  // Memoized available models based on category
  const availableModels = React.useMemo(() => {
    if (!category) return modelsData as ModelSpec[];
    return (modelsData as ModelSpec[]).filter(
      (m) => m.category.toLowerCase() === category.toLowerCase()
    );
  }, [category]);

  // Filter mock tags based on input
  const filteredTags = React.useMemo(() => {
    if (!serviceTag) return MOCK_EXISTING_TAGS;
    return MOCK_EXISTING_TAGS.filter((t) =>
      t.value.toLowerCase().includes(serviceTag.toLowerCase())
    );
  }, [serviceTag]);

  React.useEffect(() => {
    if (!serviceTag) return;

    // Check if the entered tag matches one of our mocks
    const matchedModelName = MOCK_SERIAL_LOOKUP[serviceTag.toUpperCase()];
    if (matchedModelName) {
      const modelSpec = (modelsData as ModelSpec[]).find(
        (m) => m.name === matchedModelName
      );
      if (modelSpec) {
        // Only trigger update if model isn't already set to this (avoid loops)
        const currentModel = form.getValues("model");
        if (currentModel !== modelSpec.name) {
          handleModelSelect(modelSpec);

          // Optional: switch category if needed to match model?
          if (modelSpec.category !== category) {
            form.setValue("category", modelSpec.category as typeof category);
          }
          toast.success(`Mock Serial recognized! Selected ${modelSpec.name}`);
        }
      }
    }
  }, [serviceTag, category]);

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

  return (
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
                            Initial Status *
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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

                    <FormField
                      control={form.control}
                      name="make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Make *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Dell"
                              className="h-10 bg-background/50 border-muted-foreground/20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name="model"
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
                                          (model) => model.name === field.value
                                        )?.name || field.value
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
                                    <CommandEmpty>No model found.</CommandEmpty>
                                    <CommandGroup>
                                      {availableModels.map((model) => (
                                        <CommandItem
                                          key={model.name}
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
                                              field.value === model.name
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
                            <input type="hidden" {...field} />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="serviceTag"
                      render={({ field }) => (
                        <FormItem className="col-span-full flex flex-col">
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Service Tag / Serial *
                          </FormLabel>
                          <Popover
                            open={openTagCombobox}
                            onOpenChange={setOpenTagCombobox}
                          >
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openTagCombobox}
                                  className={cn(
                                    "w-full justify-between bg-background/50 border-muted-foreground/20 h-10 font-mono text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value || "Select or type tag..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[300px] p-0"
                              align="start"
                            >
                              <Command shouldFilter={false}>
                                <CommandInput
                                  placeholder="Type Service Tag..."
                                  value={field.value}
                                  onValueChange={field.onChange}
                                />
                                <CommandList>
                                  <CommandGroup heading="Suggestions (Mock)">
                                    {filteredTags.map((tagItem) => (
                                      <CommandItem
                                        key={tagItem.value}
                                        value={tagItem.value}
                                        onSelect={(currentValue) => {
                                          // When selecting a mock tag, set it as the value
                                          field.onChange(tagItem.value);
                                          setOpenTagCombobox(false);
                                        }}
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-bold">
                                            {tagItem.value}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            Model: {tagItem.model}
                                          </span>
                                        </div>
                                        <Check
                                          className={cn(
                                            "ml-auto h-4 w-4",
                                            field.value === tagItem.value
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
                </div>

                {/* Smart Specs Fields */}
                {(category === "Laptop" || category === "Desktop") && (
                  <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                      <IconSettings className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                        Technical Specifications
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="cpu"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              CPU
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <IconCpu className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground/60" />
                                <Input
                                  placeholder="e.g. Core i7"
                                  className="pl-9 h-10 bg-background/50"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              RAM
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <IconCpu className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground/60" />
                                <Input
                                  placeholder="e.g. 16GB"
                                  className="pl-9 h-10 bg-background/50"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="storage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Storage
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <IconDatabase className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground/60" />
                                <Input
                                  placeholder="e.g. 512GB"
                                  className="pl-9 h-10 bg-background/50"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dedicatedgpu"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Dedicated GPU
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <IconScreenShare className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground/60" />
                                <Input
                                  placeholder="e.g. RTX 3050"
                                  className="pl-9 h-10 bg-background/50"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {(category === "Monitor" || category === "TV") && (
                  <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                      <IconScreenShare className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                        Display Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="dimensions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Dimensions
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. 27 inch"
                                className="h-10 bg-background/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="resolution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Resolution
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. 4K"
                                className="h-10 bg-background/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="refreshhertz"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Refresh Rate
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. 144Hz"
                                className="h-10 bg-background/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {category === "Docking" && (
                  <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                      <IconUsb className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                        Connectivity
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="usb-aports"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              USB-A Ports
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. 3"
                                className="h-10 bg-background/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="usb-cports"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              USB-C Ports
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. 1"
                                className="h-10 bg-background/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                      name="warrantyExpiry"
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
                            defaultValue={field.value}
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

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Price (USD)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g. 1200.00"
                              className="h-10 bg-background/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
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
              <SheetFooter className="items-center justify-end gap-3 flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={createAsset.isPending}
                  className="flex-1 sm:flex-none px-8 font-semibold hover:bg-background h-11"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createAsset.isPending}
                  className="flex-1 sm:flex-none px-10 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98] h-11 border-none"
                >
                  {createAsset.isPending && (
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {createAsset.isPending ? "Adding..." : "Add Asset"}
                </Button>
              </SheetFooter>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
