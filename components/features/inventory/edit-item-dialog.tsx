"use client";

import * as React from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "@tabler/icons-react";

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditItemDialog({ open, onOpenChange }: EditItemDialogProps) {
  const [view, setView] = React.useState<"search" | "edit" | "add">("search");
  const [selectedAsset, setSelectedAsset] = React.useState<AssetLegacy | null>(
    null
  );
  // In a real app, we would manage state better, but for this prototype we'll us local state for the list
  const [assets, setAssets] = React.useState<AssetLegacy[]>(MOCK_ASSETS);

  // Reset view when dialog closes/opens
  React.useEffect(() => {
    if (open) {
      setView("search");
      setSelectedAsset(null);
    }
  }, [open]);

  const handleSelect = (asset: AssetLegacy) => {
    setSelectedAsset(asset);
    setView("edit");
  };

  const handleDelete = () => {
    if (selectedAsset) {
      setAssets(assets.filter((a) => a.id !== selectedAsset.id));
      setView("search");
      setSelectedAsset(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAsset) {
      setAssets(
        assets.map((a) => (a.id === selectedAsset.id ? selectedAsset : a))
      );
      setView("search");
      setSelectedAsset(null);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAsset) {
      // Determine new ID (simple max + 1)
      const newId = Math.max(...assets.map((a) => a.id), 0) + 1;
      const newAsset = { ...selectedAsset, id: newId };
      setAssets([...assets, newAsset]);
      setView("search");
      setSelectedAsset(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        {view === "search" && (
          <div className="flex flex-col h-[400px]">
            <div className="px-4 py-3 border-b">
              <h2 className="text-lg font-semibold">Search Items</h2>
            </div>
            <Command className="border-none rounded-none shadow-none h-full">
              <CommandInput placeholder="Search assets..." />
              <CommandList>
                <CommandEmpty className="py-6 text-center text-sm">
                  <p className="text-muted-foreground mb-4">No item found.</p>
                  <Button
                    size="sm"
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
                <CommandGroup heading="Assets">
                  {assets.map((asset) => (
                    <CommandItem
                      key={asset.id}
                      onSelect={() => handleSelect(asset)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="font-medium">
                          {asset.Make} {asset.Model}
                        </span>
                        <span className="text-muted-foreground text-xs ml-auto">
                          {asset["Service Tag"]}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}

        {view === "edit" && selectedAsset && (
          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView("search")}
              >
                <IconArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">Edit Item</h2>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Make</Label>
                  <Input
                    value={selectedAsset.Make}
                    onChange={(e) =>
                      setSelectedAsset({
                        ...selectedAsset,
                        Make: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input
                    value={selectedAsset.Model}
                    onChange={(e) =>
                      setSelectedAsset({
                        ...selectedAsset,
                        Model: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Service Tag</Label>
                  <Input
                    value={selectedAsset['Service Tag']}
                    onChange={(e) =>
                      setSelectedAsset({
                        ...selectedAsset,
                        'Service Tag': e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={selectedAsset.Category}
                    onChange={(e) =>
                      setSelectedAsset({
                        ...selectedAsset,
                        Category: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  <IconTrash className="mr-2 h-4 w-4" /> Delete
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setView("search")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </div>
            </form>
          </div>
        )}

        {view === "add" && selectedAsset && (
          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView("search")}
              >
                <IconArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">Add New Item</h2>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Make</Label>
                  <Input
                    value={selectedAsset.Make}
                    onChange={(e) =>
                      setSelectedAsset({
                        ...selectedAsset,
                        Make: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input
                    value={selectedAsset.Model}
                    onChange={(e) =>
                      setSelectedAsset({
                        ...selectedAsset,
                        Model: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Service Tag</Label>
                  <Input
                    value={selectedAsset['Service Tag']}
                    onChange={(e) =>
                      setSelectedAsset({
                        ...selectedAsset,
                        'Service Tag': e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={selectedAsset.Category}
                    onChange={(e) =>
                      setSelectedAsset({
                        ...selectedAsset,
                        Category: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setView("search")}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Item</Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
