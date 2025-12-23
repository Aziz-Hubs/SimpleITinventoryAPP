import * as React from "react";
import { ParsedModel } from "@/lib/csv-parser";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  UploadCloud,
  AlertCircle,
  Laptop,
  Monitor,
  Smartphone,
  Server,
  Tablet,
  Headphones,
  Printer,
  Cable,
} from "lucide-react";

interface ImportModelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  models: ParsedModel[];
  onConfirm: () => void;
  onCancel: () => void;
  isImporting?: boolean;
}

export function ImportModelsDialog({
  open,
  onOpenChange,
  models,
  onConfirm,
  onCancel,
  isImporting = false,
}: ImportModelsDialogProps) {
  const getIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes("laptop")) return <Laptop className="h-4 w-4" />;
    if (lower.includes("monitor")) return <Monitor className="h-4 w-4" />;
    if (lower.includes("phone")) return <Smartphone className="h-4 w-4" />;
    if (lower.includes("tablet")) return <Tablet className="h-4 w-4" />;
    if (lower.includes("headset")) return <Headphones className="h-4 w-4" />;
    if (lower.includes("printer")) return <Printer className="h-4 w-4" />;
    if (lower.includes("docking")) return <Cable className="h-4 w-4" />;
    return <Server className="h-4 w-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-11/12 sm:max-w-5xl p-0 flex flex-col gap-0 max-h-[85vh] overflow-hidden">
        <DialogHeader className="p-6 border-b bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1 text-left">
              <DialogTitle>Import Models</DialogTitle>
              <DialogDescription>
                Review the {models.length} model{models.length !== 1 ? "s" : ""}{" "}
                found in your CSV file before importing.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col p-6">
          {models.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center space-y-4">
              <div className="p-4 bg-muted rounded-full">
                <AlertCircle className="h-8 w-8 opacity-50" />
              </div>
              <p>No valid model data found in file.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden rounded-md border">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader className="bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Make</TableHead>
                      <TableHead>CPU</TableHead>
                      <TableHead>RAM</TableHead>
                      <TableHead>Storage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {models.map((model, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getIcon(model.category)}
                            <Badge variant="secondary" className="font-normal">
                              {model.category}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{model.name}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {model.make}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {String(model.specs.cpu || "-")}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {String(model.specs.ram || "-")}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {String(model.specs.storage || "-")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 border-t bg-muted/10 items-center justify-end gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isImporting}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={models.length === 0 || isImporting}
            className="flex-1 sm:flex-none px-8 font-bold"
          >
            {isImporting ? (
              <>Importing...</>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Confirm Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
