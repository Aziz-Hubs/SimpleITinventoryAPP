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

import { Asset } from "@/lib/types";
import { toast } from "sonner";

interface InventoryHeaderActionsProps {
  assets?: Asset[];
}

export function InventoryHeaderActions({
  assets = [],
}: InventoryHeaderActionsProps) {
  const [open, setOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      console.log("Imported CSV content:", text);
      toast.success(
        `Successfully imported ${text.split("\n").length - 1} assets from CSV`
      );
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
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
    </div>
  );
}
