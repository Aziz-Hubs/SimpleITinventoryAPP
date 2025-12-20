"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AssetLegacy } from "@/lib/types";
import { MOCK_ASSETS } from "@/services/dashboard-service";
import {
  IconPencil,
  IconTrash,
  IconArrowLeft,
  IconPlus,
  IconSearch,
  IconDeviceLaptop,
} from "@tabler/icons-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";


interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditItemDialog({ open, onOpenChange }: EditItemDialogProps) {
  const [view, setView] = React.useState<"search" | "edit" | "add">("search");
  const [selectedAsset, setSelectedAsset] = React.useState<AssetLegacy | null>(
    null
  );
  const [assets, setAssets] = React.useState<AssetLegacy[]>(MOCK_ASSETS);
  const [originalAsset, setOriginalAsset] = React.useState<AssetLegacy | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = React.useState(false);

  // Reset view when dialog closes/opens
  React.useEffect(() => {
    if (open) {
      setView("search");
      setSelectedAsset(null);
    }
  }, [open]);

  const handleSelect = (asset: AssetLegacy) => {
    setSelectedAsset(asset);
    setOriginalAsset({ ...asset });
    setView("edit");
  };

  const handleDelete = () => {
    if (selectedAsset) {
      setAssets(assets.filter((a) => a.id !== selectedAsset.id));
      setView("search");
      setSelectedAsset(null);
    }
  };

  const saveAsset = () => {
    if (selectedAsset) {
      setAssets(
        assets.map((a) => (a.id === selectedAsset.id ? selectedAsset : a))
      );
      setView("search");
      setSelectedAsset(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveAsset();
  };

  const getChanges = () => {
    if (!selectedAsset || !originalAsset) return [];
    const changes: { key: string; oldVal: string; newVal: string }[] = [];
    (Object.keys(selectedAsset) as Array<keyof AssetLegacy>).forEach((key) => {
      // Simple string comparison for now.
      if (String(selectedAsset[key]) !== String(originalAsset[key])) {
        changes.push({
          key,
          oldVal: String(originalAsset[key] || ""),
          newVal: String(selectedAsset[key] || ""),
        });
      }
    });
    return changes;
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    handleDelete();
    setShowDeleteConfirm(false);
  };

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    const changes = getChanges();
    if (changes.length > 0) {
      setShowSaveConfirm(true);
    } else {
      saveAsset();
    }
  };

  const confirmSave = () => {
    saveAsset();
    setShowSaveConfirm(false);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAsset) {
      const newId = Math.max(...assets.map((a) => a.id), 0) + 1;
      const newAsset = { ...selectedAsset, id: newId };
      setAssets([...assets, newAsset]);
      setView("search");
      setSelectedAsset(null);
    }
  };

  if (view === "search") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full sm:max-w-xl p-0 flex flex-col border-none shadow-none bg-transparent gap-0 max-h-[85vh] overflow-hidden">
          <div
            className="relative flex-1 w-full flex flex-col overflow-hidden rounded-lg border border-white/10"
            style={{
              "--spread": "90deg",
              "--shimmer-color": "#ffffff",
              "--shimmer-radius": "0.5rem",
              "--speed": "3s",
              "--cut": "0.1em",
              "--bg": "hsl(var(--background))",
            } as React.CSSProperties}
          >
            {/* Shimmer spark container */}
            <div className={cn(
              "-z-30 blur-[2px]",
              "[container-type:size] absolute inset-0 overflow-visible"
            )}>
              {/* Shimmer spark */}
              <div className="animate-shimmer-slide absolute inset-0 [aspect-ratio:1] h-[100cqh] [border-radius:0] [mask:none]">
                {/* Shimmer spark rotating gradient */}
                <div className="animate-spin-around absolute -inset-full w-auto [translate:0_0] rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
              </div>
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 flex-1 flex flex-col bg-background m-[2px] rounded-[calc(var(--radius)-2px)] overflow-hidden shadow-2xl h-full">
              <DialogHeader className="p-6 border-b bg-muted/30 text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm">
                    <IconSearch className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      Inventory Management
                    </DialogTitle>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex flex-col h-[500px]">
                <Command className="flex-1 rounded-none border-none">
                  <CommandInput
                    placeholder="Search by name, model, or service tag..."
                    className="h-14 border-b"
                  />
                  <CommandList className="max-h-none h-full">
                    <CommandEmpty className="py-12 flex flex-col items-center gap-4">
                      <p className="text-muted-foreground">
                        No matching assets found.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedAsset({
                            id: 0,
                            Make: "",
                            Model: "",
                            Category: "Laptop",
                            "Service Tag": "",
                            State: "NEW",
                            Employee: "UNASSIGNED",
                            Location: "",
                          });
                          setView("add");
                        }}
                      >
                        <IconPlus className="mr-2 h-4 w-4" />
                        Add New Item
                      </Button>
                    </CommandEmpty>
                    <CommandGroup heading="Recent Assets" className="px-2">
                      {assets.map((asset) => (
                        <CommandItem
                          key={asset.id}
                          onSelect={() => handleSelect(asset)}
                          className="flex items-center gap-3 p-3 cursor-pointer rounded-lg mb-1 data-[selected=true]:bg-primary/5"
                        >
                          <div className="p-2 rounded-md bg-muted group-data-[selected=true]:bg-primary/10">
                            <IconDeviceLaptop className="h-4 w-4 text-muted-foreground group-data-[selected=true]:text-primary" />
                          </div>
                          <div className="flex flex-col flex-1">
                            <span className="font-semibold text-sm">
                              {asset.Make} {asset.Model}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {asset["Service Tag"]}
                            </span>
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded-full bg-muted border">
                            {asset.Category}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>

                <div className="p-6 border-t bg-muted/5 flex justify-center">
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-primary gap-2"
                    onClick={() => {
                      setSelectedAsset({
                        id: 0,
                        Make: "",
                        Model: "",
                        Category: "Laptop",
                        "Service Tag": "",
                        State: "NEW",
                        Employee: "UNASSIGNED",
                        Location: "",
                      });
                      setView("add");
                    }}
                  >
                    <IconPlus className="h-4 w-4" />
                    Didn't find what you need? Create new.
                  </Button>
                </div>
              </div>
            </div>

            {/* Backdrop */}
            <div className="absolute [inset:var(--cut)] -z-20 rounded-[calc(var(--radius)-2px)] [background:var(--bg)]" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Edit/Add View - Sheet
  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl p-0 flex flex-col border-none shadow-none bg-transparent"
        >
          <div className="relative flex-1 w-full h-full flex flex-col overflow-hidden rounded-l-2xl">
            {/* Shimmer Border/Background */}
            <div className="absolute inset-0 z-0 overflow-hidden rounded-l-2xl">
              <div
                className="animate-spin-around absolute -inset-[100%] w-auto h-auto min-w-full min-h-full rotate-0 opacity-100"
                style={{
                  background:
                    "conic-gradient(from calc(270deg - (var(--spread) * 0.5)), transparent 0, var(--shimmer-color) var(--spread), transparent var(--spread))",
                  ["--spread" as string]: "60deg",
                  ["--shimmer-color" as string]: "hsl(var(--primary))",
                }}
              />
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 flex-1 flex flex-col bg-background m-[2px] ml-[2px] my-[2px] mr-0 rounded-l-xl overflow-hidden shadow-2xl">
              <SheetHeader className="p-6 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm">
                    <IconPencil className="h-6 w-6" />
                  </div>
                  <div>
                    <SheetTitle className="text-xl">
                      {view === "edit" ? "Edit Asset Details" : "Add New Asset"}
                    </SheetTitle>
                  </div>
                </div>
              </SheetHeader>

              {selectedAsset && (
                <div className="flex flex-col h-full bg-background">
                  <ScrollArea className="flex-1">
                    <div className="p-6 space-y-8">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setView("search")}
                          className="px-2 h-8 text-muted-foreground hover:text-foreground"
                        >
                          <IconArrowLeft className="h-4 w-4 mr-1" />
                          Back to list
                        </Button>
                      </div>

                      <form
                        id="asset-form"
                        onSubmit={view === "edit" ? handleSaveClick : handleCreate} // NEW: Use handleSaveClick
                        className="space-y-6"
                      >
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Make
                              </Label>
                              <Input
                                value={selectedAsset.Make}
                                onChange={(e) =>
                                  setSelectedAsset({
                                    ...selectedAsset,
                                    Make: e.target.value,
                                  })
                                }
                                required
                                className="h-10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Model
                              </Label>
                              <Input
                                value={selectedAsset.Model}
                                onChange={(e) =>
                                  setSelectedAsset({
                                    ...selectedAsset,
                                    Model: e.target.value,
                                  })
                                }
                                required
                                className="h-10"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Service Tag
                            </Label>
                            <Input
                              value={selectedAsset["Service Tag"]}
                              onChange={(e) =>
                                setSelectedAsset({
                                  ...selectedAsset,
                                  "Service Tag": e.target.value,
                                })
                              }
                              required
                              className="h-10 font-mono"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Category
                            </Label>
                            <Input
                              value={selectedAsset.Category}
                              onChange={(e) =>
                                setSelectedAsset({
                                  ...selectedAsset,
                                  Category: e.target.value,
                                })
                              }
                              required
                              className="h-10"
                            />
                          </div>
                        </div>
                      </form>
                    </div>
                  </ScrollArea>

                  <div className="p-6 border-t bg-muted/10 flex items-center justify-between gap-3">
                    {view === "edit" && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDeleteClick} // NEW: Use handleDeleteClick
                        className="gap-2"
                      >
                        <IconTrash className="h-4 w-4" /> Delete
                      </Button>
                    )}
                    <div className="flex gap-3 ml-auto">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setView("search")}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        form="asset-form"
                        className="px-8 font-bold"
                      >
                        {view === "edit" ? "Save Changes" : "Create Asset"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
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
              Are you sure you want to delete this asset? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
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
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              {getChanges().length > 0 ? (
                getChanges().map((change, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="font-bold">{change.key}:</span>
                    <span className="text-red-500 line-through">{change.oldVal}</span>
                    <span>→</span>
                    <span className="text-green-500 font-medium">{change.newVal}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic">No changes detected.</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSaveConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSave}
            >
              Confirm Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

