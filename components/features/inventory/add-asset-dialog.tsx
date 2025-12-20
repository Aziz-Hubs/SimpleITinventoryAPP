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
  Laptop,
  Monitor,
  Usb,
  Headphones,
  Server,
  Printer,
  Wifi,
  PackagePlus,
  Rocket,
  ShieldCheck,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { searchAssets } from "@/services/inventory-service";
import { Asset } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAssetDialog({ open, onOpenChange }: AddAssetDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [make, setMake] = React.useState("");
  const [model, setModel] = React.useState("");
  const [serviceTag, setServiceTag] = React.useState("");
  const [category, setCategory] = React.useState("Laptop");
  const [status, setStatus] = React.useState("NEW");

  // Autocomplete states
  const [makeOpen, setMakeOpen] = React.useState(false);
  const [modelOpen, setModelOpen] = React.useState(false);
  const [tagOpen, setTagOpen] = React.useState(false);
  const [makeSuggestions, setMakeSuggestions] = React.useState<string[]>([]);
  const [modelSuggestions, setModelSuggestions] = React.useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = React.useState<Asset[]>([]);

  // Fetch make suggestions
  React.useEffect(() => {
    const fetchMakes = async () => {
      if (make.length >= 2) {
        const results = await searchAssets(make);
        const uniqueMakes = Array.from(new Set(results.map(r => r.make).filter(Boolean)));
        setMakeSuggestions(uniqueMakes.slice(0, 5));
      } else {
        setMakeSuggestions([]);
      }
    };
    const timer = setTimeout(fetchMakes, 300);
    return () => clearTimeout(timer);
  }, [make]);

  // Fetch model suggestions
  React.useEffect(() => {
    const fetchModels = async () => {
      if (model.length >= 2) {
        const results = await searchAssets(model);
        const uniqueModels = Array.from(new Set(results.map(r => r.model).filter(Boolean)));
        setModelSuggestions(uniqueModels.slice(0, 5));
      } else {
        setModelSuggestions([]);
      }
    };
    const timer = setTimeout(fetchModels, 300);
    return () => clearTimeout(timer);
  }, [model]);

  // Fetch service tag suggestions
  React.useEffect(() => {
    const fetchTags = async () => {
      if (serviceTag.length >= 2) {
        const results = await searchAssets(serviceTag);
        setTagSuggestions(results.slice(0, 5));
      } else {
        setTagSuggestions([]);
      }
    };
    const timer = setTimeout(fetchTags, 300);
    return () => clearTimeout(timer);
  }, [serviceTag]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Asset added successfully", {
        description: "The new asset is now available in the inventory.",
      });
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[500px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm">
              <PackagePlus className="h-6 w-6" />
            </div>
            <div>
              <SheetTitle className="text-xl">Add New Asset</SheetTitle>
              <SheetDescription>
                Register a new device into the inventory system.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col h-full overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="make" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Make</Label>
                  <Popover open={makeOpen} onOpenChange={setMakeOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={makeOpen}
                        className="h-10 justify-between font-normal"
                      >
                        {make || "e.g. Dell"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Type make..."
                          value={make}
                          onValueChange={setMake}
                        />
                        <CommandList>
                          <CommandEmpty>No suggestions</CommandEmpty>
                          {makeSuggestions.length > 0 && (
                            <CommandGroup>
                              {makeSuggestions.map((suggestion) => (
                                <CommandItem
                                  key={suggestion}
                                  value={suggestion}
                                  onSelect={() => {
                                    setMake(suggestion);
                                    setMakeOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      make === suggestion ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {suggestion}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="model" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Model</Label>
                  <Popover open={modelOpen} onOpenChange={setModelOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={modelOpen}
                        className="h-10 justify-between font-normal"
                      >
                        {model || "e.g. Latitude 5420"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Type model..."
                          value={model}
                          onValueChange={setModel}
                        />
                        <CommandList>
                          <CommandEmpty>No suggestions</CommandEmpty>
                          {modelSuggestions.length > 0 && (
                            <CommandGroup>
                              {modelSuggestions.map((suggestion) => (
                                <CommandItem
                                  key={suggestion}
                                  value={suggestion}
                                  onSelect={() => {
                                    setModel(suggestion);
                                    setModelOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      model === suggestion ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {suggestion}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tag" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Service Tag / Serial</Label>
                <Popover open={tagOpen} onOpenChange={setTagOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={tagOpen}
                      className="h-10 justify-between font-mono font-normal"
                    >
                      {serviceTag || "e.g. 8H2J9K2"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Type service tag..."
                        value={serviceTag}
                        onValueChange={setServiceTag}
                        className="font-mono"
                      />
                      <CommandList>
                        <CommandEmpty>No matching tags</CommandEmpty>
                        {tagSuggestions.length > 0 && (
                          <CommandGroup>
                            {tagSuggestions.map((asset) => (
                              <CommandItem
                                key={asset.id}
                                value={asset.servicetag}
                                onSelect={() => {
                                  setServiceTag(asset.servicetag);
                                  setMake(asset.make);
                                  setModel(asset.model);
                                  setCategory(asset.category);
                                  setTagOpen(false);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-mono font-bold">{asset.servicetag}</span>
                                  <span className="text-xs text-muted-foreground">{asset.make} {asset.model}</span>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    serviceTag === asset.servicetag ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laptop">
                        <div className="flex items-center gap-2">
                          <Laptop className="h-4 w-4" />
                          <span>Laptop</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Desktop">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          <span>Desktop</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Monitor">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          <span>Monitor</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Docking">
                        <div className="flex items-center gap-2">
                          <Usb className="h-4 w-4" />
                          <span>Docking</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Headset">
                        <div className="flex items-center gap-2">
                          <Headphones className="h-4 w-4" />
                          <span>Headset</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Network">
                        <div className="flex items-center gap-2">
                          <Wifi className="h-4 w-4" />
                          <span>Network</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Printer">
                        <div className="flex items-center gap-2">
                          <Printer className="h-4 w-4" />
                          <span>Printer</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Initial Status</Label>
                  <Select value={status} onValueChange={setStatus} required>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">
                        <div className="flex items-center gap-2 text-blue-500 font-medium">
                          <Rocket className="h-4 w-4" />
                          <span>New</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="GOOD">
                        <div className="flex items-center gap-2 text-emerald-500 font-medium">
                          <ShieldCheck className="h-4 w-4" />
                          <span>Good (Used)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="p-6 border-t bg-muted/10 items-center justify-end gap-3 flex-row">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 sm:flex-none px-8">
              {loading ? "Adding..." : "Add Asset"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
