"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { modelSchema, Model, ModelCreate, ASSET_CATEGORIES } from "@/lib/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  IconInfoCircle,
  IconSettings,
  IconCategory,
} from "@tabler/icons-react";

// Define a schema specifically for the form that flattens the specs
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  make: z.string().min(1, "Make is required"),
  category: z.string().min(1, "Category is required"),
  // Spec fields
  cpu: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  dedicatedgpu: z.string().optional(),
  "usb-aports": z.string().optional(),
  "usb-cports": z.string().optional(),
  dimensions: z.string().optional(),
  resolution: z.string().optional(),
  refreshhertz: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ModelFormProps {
  id?: string;
  defaultValues?: Partial<Model>;
  onSubmit: (data: ModelCreate) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  hideSubmitButton?: boolean;
}

export function ModelForm({
  id,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save",
  hideSubmitButton = false,
}: ModelFormProps) {
  // Map initial values from model.specs if available
  const initialValues: Partial<FormData> = {
    name: defaultValues?.name || "",
    category: defaultValues?.category || "",
    make: defaultValues?.make || "",
    cpu: (defaultValues?.specs?.cpu as string) || "",
    ram: (defaultValues?.specs?.ram as string) || "",
    storage: (defaultValues?.specs?.storage as string) || "",
    dedicatedgpu: (defaultValues?.specs?.dedicatedgpu as string) || "",
    "usb-aports": (defaultValues?.specs?.["usb-aports"] as string) || "",
    "usb-cports": (defaultValues?.specs?.["usb-cports"] as string) || "",
    dimensions: (defaultValues?.specs?.dimensions as string) || "",
    resolution: (defaultValues?.specs?.resolution as string) || "",
    refreshhertz: (defaultValues?.specs?.refreshhertz as string) || "",
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const category = form.watch("category");

  // Helper to determine if a field is relevant for the selected category
  const isFieldRelevant = (field: string) => {
    if (!category) return true; // Show all if no category selected

    const laptopDesktopFields = [
      "cpu",
      "ram",
      "storage",
      "dedicatedgpu",
      "usb-aports",
      "usb-cports",
    ];
    const displayFields = ["resolution", "refreshhertz", "dimensions"];

    if (["Laptop", "Desktop", "Docking"].includes(category)) {
      if (field === "dimensions") return false;
      return laptopDesktopFields.includes(field);
    }

    if (["Monitor", "TV"].includes(category)) {
      return displayFields.includes(field);
    }

    return true; // Default show all for other categories
  };

  const handleSubmit = async (data: FormData) => {
    // Extract specs from flat data
    const {
      name,
      make,
      category,
      cpu,
      ram,
      storage,
      dedicatedgpu,
      "usb-aports": usbA,
      "usb-cports": usbC,
      dimensions,
      resolution,
      refreshhertz,
    } = data;

    // Construct specs object
    const specs: Record<string, string | number | boolean | undefined> = {};
    if (cpu) specs.cpu = cpu;
    if (ram) specs.ram = ram;
    if (storage) specs.storage = storage;
    if (dedicatedgpu) specs.dedicatedgpu = dedicatedgpu;
    if (usbA) specs["usb-aports"] = usbA;
    if (usbC) specs["usb-cports"] = usbC;
    if (dimensions) specs.dimensions = dimensions;
    if (resolution) specs.resolution = resolution;
    if (refreshhertz) specs.refreshhertz = refreshhertz;

    // Prepare final payload
    const payload: ModelCreate = {
      name,
      make,
      category,
      specs,
      // tenantId will be handled by schema omit or backend
    };

    await onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form
        id={id}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8"
      >
        {/* Basic Information Card */}
        <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <IconInfoCircle className="h-12 w-12" />
          </div>

          <div className="flex items-center gap-2 mb-2 pb-2 border-b">
            <IconCategory className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
              Basic Information
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Model Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Vostro 3520"
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
              name="make"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Manufacturer
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Dell"
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
              name="category"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Category
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 bg-background/50">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ASSET_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Technical Specs Card */}
        <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <IconSettings className="h-12 w-12" />
          </div>

          <div className="flex items-center gap-2 mb-2 pb-2 border-b">
            <IconSettings className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
              Technical Specifications
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {isFieldRelevant("cpu") && (
              <FormField
                control={form.control}
                name="cpu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      CPU
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. i5-1235U"
                        className="h-10 bg-background/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isFieldRelevant("ram") && (
              <FormField
                control={form.control}
                name="ram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      RAM
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 16GB"
                        className="h-10 bg-background/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isFieldRelevant("storage") && (
              <FormField
                control={form.control}
                name="storage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Storage
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 512GB NVMe"
                        className="h-10 bg-background/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isFieldRelevant("dedicatedgpu") && (
              <FormField
                control={form.control}
                name="dedicatedgpu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Dedicated GPU
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. RTX 3050"
                        className="h-10 bg-background/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isFieldRelevant("usb-aports") && (
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
                        placeholder="e.g. 2"
                        className="h-10 bg-background/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isFieldRelevant("usb-cports") && (
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
            )}

            {isFieldRelevant("dimensions") && (
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
                        placeholder="e.g. 24 inch"
                        className="h-10 bg-background/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isFieldRelevant("resolution") && (
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
                        placeholder="e.g. 1920x1080"
                        className="h-10 bg-background/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isFieldRelevant("refreshhertz") && (
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
                        placeholder="e.g. 60Hz"
                        className="h-10 bg-background/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {!hideSubmitButton && (
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {submitLabel}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
