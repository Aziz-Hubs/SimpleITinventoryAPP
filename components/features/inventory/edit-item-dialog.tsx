"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Asset } from "@/lib/types";
import {
  IconPlus,
  IconSearch,
  IconDeviceLaptop,
  IconLoader2,
} from "@tabler/icons-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

import { searchAssets } from "@/services/inventory-service";
import { AddAssetDialog } from "./add-asset-dialog";
import { EditAssetSheet } from "./edit-asset-sheet";

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditItemDialog({ open, onOpenChange }: EditItemDialogProps) {
  const [view, setView] = React.useState<"search" | "edit" | "add">("search");
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | null>(null);
  const [searchResults, setSearchResults] = React.useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);

  // Reset view when dialog closes/opens
  React.useEffect(() => {
    if (open) {
      setView("search");
      setSelectedAsset(null);
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [open]);

  // Search effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        searchAssets(searchQuery)
          .then((results) => setSearchResults(results))
          .catch((err) => console.error(err))
          .finally(() => setIsSearching(false));
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    setView("edit");
  };

  const handleBackToList = () => {
    setView("search");
    setSelectedAsset(null);
  };

  const handleAssetSaved = async () => {
    // Refresh search results and go back to list
    if (searchQuery) {
      const results = await searchAssets(searchQuery);
      setSearchResults(results);
    }
    setView("search");
    setSelectedAsset(null);
  };

  const handleAssetDeleted = async () => {
    // Refresh search results and go back to list
    if (searchQuery) {
      const results = await searchAssets(searchQuery);
      setSearchResults(results);
    }
    setView("search");
    setSelectedAsset(null);
  };

  const handleAssetCreated = async () => {
    // Refresh search results and go back to list
    if (searchQuery) {
      const results = await searchAssets(searchQuery);
      setSearchResults(results);
    }
    setView("search");
    setSelectedAsset(null);
  };

  // Search View
  if (view === "search") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full sm:max-w-xl p-0 flex flex-col border-none shadow-none bg-transparent gap-0 max-h-[85vh] overflow-hidden">
          <div
            className="relative flex-1 w-full flex flex-col overflow-hidden rounded-lg border border-white/10"
            style={
              {
                "--spread": "90deg",
                "--shimmer-color": "#ffffff",
                "--shimmer-radius": "0.5rem",
                "--speed": "3s",
                "--cut": "0.1em",
                "--bg": "hsl(var(--background))",
              } as React.CSSProperties
            }
          >
            {/* Shimmer spark container */}
            <div
              className={cn(
                "-z-30 blur-[2px]",
                "[container-type:size] absolute inset-0 overflow-visible"
              )}
            >
              <div className="animate-shimmer-slide absolute inset-0 [aspect-ratio:1] h-[100cqh] [border-radius:0] [mask:none]">
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
                <Command
                  className="flex-1 rounded-none border-none"
                  shouldFilter={false}
                >
                  <CommandInput
                    placeholder="Search by name, model, or service tag..."
                    className="h-14 border-b"
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList className="max-h-none h-full">
                    <CommandEmpty className="py-12 flex flex-col items-center gap-4">
                      {isSearching ? (
                        <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <p className="text-muted-foreground">
                            {searchQuery
                              ? "No matching assets found."
                              : "Start typing to search..."}
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => setView("add")}
                          >
                            <IconPlus className="mr-2 h-4 w-4" />
                            Add New Item
                          </Button>
                        </>
                      )}
                    </CommandEmpty>
                    <CommandGroup heading="Search Results" className="px-2">
                      {searchResults.map((asset) => (
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
                              {asset.make} {asset.model}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {asset.serviceTag}
                            </span>
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded-full bg-muted border">
                            {asset.category}
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
                    onClick={() => setView("add")}
                  >
                    <IconPlus className="h-4 w-4" />
                    Didn&apos;t find what you need? Create new.
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

  // Edit View - Using the shared EditAssetSheet component
  if (view === "edit") {
    return (
      <EditAssetSheet
        open={open}
        onOpenChange={onOpenChange}
        asset={selectedAsset}
        onBack={handleBackToList}
        onSaved={handleAssetSaved}
        onDeleted={handleAssetDeleted}
      />
    );
  }

  // Add View - Using the shared AddAssetDialog component
  if (view === "add") {
    return (
      <AddAssetDialog
        open={open}
        onOpenChange={onOpenChange}
        onBack={handleBackToList}
        onCreated={handleAssetCreated}
      />
    );
  }

  return null;
}
