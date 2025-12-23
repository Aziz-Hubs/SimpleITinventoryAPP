"use client";

import { ActionDialog } from "@/components/shared/action-dialog";
import { deleteInvoice } from "@/services/invoice-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Invoice } from "@/lib/types";
import { IconTrash, IconAlertTriangle } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DeleteInvoiceDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteInvoiceDialog({
  invoice,
  open,
  onOpenChange,
}: DeleteInvoiceDialogProps) {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice deleted successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to delete invoice");
      console.error(error);
    },
  });

  const handleDelete = async () => {
    if (invoice) {
      await mutateAsync(String(invoice.id));
    }
  };

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Invoice"
      description={`You are about to permanently delete invoice ${invoice?.invoiceNumber}.`}
      confirmText="Delete Invoice"
      variant="destructive"
      onConfirm={handleDelete}
      isLoading={isPending}
      icon={<IconTrash className="h-6 w-6" />}
    >
      <Alert
        variant="destructive"
        className="bg-destructive/5 border-destructive/10"
      >
        <IconAlertTriangle className="h-4 w-4" />
        <AlertTitle className="text-xs font-bold uppercase tracking-wider">
          Warning
        </AlertTitle>
        <AlertDescription className="text-[11px] opacity-80 leading-relaxed">
          This action cannot be undone. All data associated with this invoice
          will be permanently removed from the system.
        </AlertDescription>
      </Alert>
    </ActionDialog>
  );
}
