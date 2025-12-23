"use client";

import * as React from "react";
import { Plus, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddAssetDialog } from "@/components/features/inventory/add-asset-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Asset, AssetCreate, AssetStateEnum } from "@/lib/types";
import { toast } from "sonner";
import { parseInventoryCsv, ParsedAsset } from "@/lib/csv-parser";
import { ImportInventoryDialog } from "@/components/features/inventory/import-inventory-dialog";
import { useCreateAsset } from "@/hooks/api/use-assets";

interface InventoryHeaderActionsProps {
  assets?: Asset[];
}

export function InventoryHeaderActions({
  assets = [],
}: InventoryHeaderActionsProps) {
  const [open, setOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Import State
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [importAssets, setImportAssets] = React.useState<ParsedAsset[]>([]);
  const [isImporting, setIsImporting] = React.useState(false);

  const createMutation = useCreateAsset();

  const handleExport = () => {
    if (!assets || assets.length === 0) return;

    // Create CSV content
    const headers = Object.keys(assets[0]).join(",");
    const rows = assets.map((asset) =>
      Object.values(asset)
        .map((v) => (typeof v === "string" && v.includes(",") ? `"${v}"` : v))
        .join(",")
    );
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");

    // Create download link and trigger
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventory_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Inventory exported to CSV");
  };

  const handleExportPDF = () => {
    // Simple print-based PDF export for now as no PDF library is installed
    window.print();
    toast.info("Opening print dialog for PDF export");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseInventoryCsv(file);
      setImportAssets(parsed);
      setIsImportOpen(true);
    } catch (error) {
      toast.error("Failed to parse CSV file");
      console.error(error);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleConfirmImport = async () => {
    setIsImporting(true);
    try {
      // Process sequentially
      for (const asset of importAssets) {
        const mappedAsset: AssetCreate = {
          tenantId: "current",
          serviceTag: asset.serviceTag,
          modelId: 1, // Default ID
          state: asset.state as AssetStateEnum,
          employee: asset.employee,
          employeeId: null,
          location: asset.location,
          notes: asset.notes,
          category: asset.category,
          make: asset.make,
          model: asset.model,
          invoiceLineItemId: null,
          warrantyExpiry: asset.warrantyExpiry || null,
          isDeleted: false,
        };
        await createMutation.mutateAsync(mappedAsset);
      }
      toast.success(`Successfully imported ${importAssets.length} items`);
      setIsImportOpen(false);
      setImportAssets([]);
    } catch (error) {
      toast.error("Failed to import some items");
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".csv"
        className="hidden"
      />

      <div className="hidden md:flex items-center gap-2 mr-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={handleExport}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Mobile Menu for Import/Export */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9 mr-2">
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Import CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" /> Export PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Button onClick={() => setOpen(true)} size="sm" className="h-9">
        <Plus className="mr-2 h-4 w-4" />
        Add Asset
      </Button>

      <AddAssetDialog open={open} onOpenChange={setOpen} />

      <ImportInventoryDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        assets={importAssets}
        onConfirm={handleConfirmImport}
        onCancel={() => setIsImportOpen(false)}
        isImporting={isImporting}
      />
    </div>
  );
}
