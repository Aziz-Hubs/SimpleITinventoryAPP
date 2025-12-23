"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  invoiceCreateSchema,
  Invoice,
  InvoiceCreate,
  InvoiceUpdate,
} from "@/lib/types";
import { updateInvoice } from "@/services/invoice-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  IconReceipt,
  IconHash,
  IconBuildingStore,
  IconCalendar,
  IconLoader2,
  IconPencil,
} from "@tabler/icons-react";

interface EditInvoiceSheetProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditInvoiceSheet({
  invoice,
  open,
  onOpenChange,
}: EditInvoiceSheetProps) {
  const queryClient = useQueryClient();
  const form = useForm<InvoiceCreate>({
    resolver: zodResolver(invoiceCreateSchema),
    defaultValues: {
      invoiceNumber: "",
      vendor: "",
      purchaseDate: "",
    },
  });

  useEffect(() => {
    if (invoice) {
      form.reset({
        invoiceNumber: invoice.invoiceNumber,
        vendor: invoice.vendor,
        purchaseDate: invoice.purchaseDate,
      });
    }
  }, [invoice, form]);

  const { isPending, mutateAsync } = useMutation({
    mutationFn: (data: InvoiceUpdate) => {
      if (!invoice) throw new Error("No invoice selected");
      // Use invoice.id directly. Services expect string or number depending on implementation.
      // Current service impl expects string ID. Invoice type uses number ID.
      // We will cast to string.
      return updateInvoice(String(invoice.id), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice updated successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to update invoice");
      console.error(error);
    },
  });

  const onSubmit = async (data: InvoiceCreate) => {
    await mutateAsync(data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col border-l shadow-2xl overflow-hidden"
      >
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col h-full bg-background"
        >
          {/* Header */}
          <div className="p-6 bg-linear-to-br from-amber-500/10 via-background to-background border-b">
            <SheetHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-amber-500/10 shadow-sm border border-amber-500/20">
                  <IconPencil className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold tracking-tight">
                    Edit Invoice
                  </SheetTitle>
                  <SheetDescription className="text-muted-foreground">
                    Update the details for invoice{" "}
                    <span className="font-semibold text-foreground">
                      {invoice?.invoiceNumber}
                    </span>
                    .
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-8 pb-10">
              <Form {...form}>
                <div className="space-y-5 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <IconReceipt className="h-12 w-12" />
                  </div>

                  <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                    <IconReceipt className="h-4 w-4 text-amber-600" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                      Invoice Information
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="invoiceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Invoice Number *
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <IconHash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                              <Input
                                placeholder="INV-2025-001"
                                className="pl-10 h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-amber-500/20 bg-background/50"
                                {...field}
                                value={field.value || ""}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vendor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Vendor Name *
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <IconBuildingStore className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                              <Input
                                placeholder="e.g., TechSupplier Inc."
                                className="pl-10 h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-amber-500/20 bg-background/50"
                                {...field}
                                value={field.value || ""}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="purchaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Purchase Date *
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <IconCalendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                              <Input
                                type="date"
                                value={
                                  field.value
                                    ? typeof field.value === "string"
                                      ? field.value.split("T")[0]
                                      : ""
                                    : ""
                                }
                                onChange={(e) => {
                                  const date = new Date(e.target.value);
                                  if (!isNaN(date.getTime())) {
                                    field.onChange(date.toISOString());
                                  }
                                }}
                                className="pl-10 h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-amber-500/20 bg-background/50"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Form>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-muted/30 border-t backdrop-blur-md">
            <SheetFooter className="items-center justify-end gap-3 flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="flex-1 sm:flex-none px-8 font-semibold hover:bg-background h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 sm:flex-none px-10 font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all active:scale-[0.98] h-11 border-none"
              >
                {isPending && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </SheetFooter>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
