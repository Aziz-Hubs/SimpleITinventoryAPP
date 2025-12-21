import * as React from "react";
import { ParsedEmployee } from "@/lib/csv-parser";
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
import { Check, UploadCloud, AlertCircle } from "lucide-react";

interface ImportEmployeesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: ParsedEmployee[];
  onConfirm: () => void;
  onCancel: () => void;
  isImporting?: boolean;
}

export function ImportEmployeesDialog({
  open,
  onOpenChange,
  employees,
  onConfirm,
  onCancel,
  isImporting = false,
}: ImportEmployeesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-11/12 sm:max-w-5xl p-0 flex flex-col gap-0 max-h-[85vh] overflow-hidden">
        <DialogHeader className="p-6 border-b bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1 text-left">
              <DialogTitle>Import Employees</DialogTitle>
              <DialogDescription>
                Review the {employees.length} employees found in your CSV file
                before importing.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col p-6">
          {employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center space-y-4">
              <div className="p-4 bg-muted rounded-full">
                <AlertCircle className="h-8 w-8 opacity-50" />
              </div>
              <p>No valid employee data found in channel.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden rounded-md border">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader className="bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {emp.fullName}
                        </TableCell>
                        <TableCell>{emp.email}</TableCell>
                        <TableCell>{emp.department}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {emp.position}
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
            disabled={employees.length === 0 || isImporting}
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
