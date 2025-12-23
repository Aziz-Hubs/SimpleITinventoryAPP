"use client";

import * as React from "react";
import { Plus, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Model } from "@/lib/types";
import { toast } from "sonner";
import { parseModelsCsv, ParsedModel } from "@/lib/csv-parser";
import { ImportModelsDialog } from "@/components/features/models/import-models-dialog";
import { useModelMutation } from "@/hooks/api/use-models";
import { CreateModelSheet } from "./create-model-dialog";

interface ModelsHeaderActionsProps {
  models?: Model[];
}

export function ModelsHeaderActions({ models = [] }: ModelsHeaderActionsProps) {
  const [createOpen, setCreateOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Import State
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [importModels, setImportModels] = React.useState<ParsedModel[]>([]);
  const [isImporting, setIsImporting] = React.useState(false);

  const { create } = useModelMutation();

  const handleExport = () => {
    if (!models || models.length === 0) {
      toast.error("No models to export");
      return;
    }

    // Create CSV content
    const headers = [
      "Name",
      "Category",
      "Make",
      "CPU",
      "RAM",
      "Storage",
      "Dedicated GPU",
      "USB-A Ports",
      "USB-C Ports",
      "Dimensions",
      "Resolution",
      "Refresh Rate",
    ];
    const rows = models.map((model) =>
      [
        model.name,
        model.category,
        model.make,
        model.specs.cpu || "",
        model.specs.ram || "",
        model.specs.storage || "",
        model.specs.dedicatedgpu || "",
        model.specs["usb-aports"] || "",
        model.specs["usb-cports"] || "",
        model.specs.dimensions || "",
        model.specs.resolution || "",
        model.specs.refreshhertz || "",
      ]
        .map((v) => (typeof v === "string" && v.includes(",") ? `"${v}"` : v))
        .join(",")
    );
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");

    // Create download link and trigger
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "models_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Models exported to CSV");
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
      const parsed = await parseModelsCsv(file);
      setImportModels(parsed);
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
      for (const model of importModels) {
        await create(model);
      }
      toast.success(`Successfully imported ${importModels.length} models`);
      setIsImportOpen(false);
      setImportModels([]);
    } catch (error) {
      toast.error("Failed to import some models");
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

      <Button onClick={() => setCreateOpen(true)} size="sm" className="h-9">
        <Plus className="mr-2 h-4 w-4" />
        Add Model
      </Button>

      <CreateModelSheet open={createOpen} onOpenChange={setCreateOpen} />

      <ImportModelsDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        models={importModels}
        onConfirm={handleConfirmImport}
        onCancel={() => setIsImportOpen(false)}
        isImporting={isImporting}
      />
    </div>
  );
}
