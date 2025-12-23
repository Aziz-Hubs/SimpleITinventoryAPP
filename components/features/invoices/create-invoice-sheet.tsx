"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { invoiceCreateSchema, InvoiceCreate } from "@/lib/types";
import { createInvoice } from "@/services/invoice-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconReceipt,
  IconHash,
  IconBuildingStore,
  IconCalendar,
  IconLoader2,
} from "@tabler/icons-react";

interface CreateInvoiceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInvoiceSheet({
  open,
  onOpenChange,
}: CreateInvoiceSheetProps) {
  const queryClient = useQueryClient();
  const form = useForm<InvoiceCreate>({
    resolver: zodResolver(invoiceCreateSchema),
    defaultValues: {
      invoiceNumber: "",
      vendor: "",
      purchaseDate: new Date().toISOString(),
    },
  });

  const { isPending, mutateAsync } = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice created successfully");
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to create invoice");
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
          <div className="p-6 bg-linear-to-br from-indigo-500/10 via-background to-background border-b">
            <SheetHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 shadow-sm border border-indigo-500/20">
                  <IconReceipt className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold tracking-tight">
                    Add New Invoice
                  </SheetTitle>
                  <SheetDescription className="text-muted-foreground">
                    Enter the details for the new finance invoice.
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
                    <IconReceipt className="h-4 w-4 text-indigo-500" />
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
                                className="pl-10 h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-indigo-500/20 bg-background/50"
                                {...field}
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
                                className="pl-10 h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-indigo-500/20 bg-background/50"
                                {...field}
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
                              <IconCalendar className="absolute left-3 top-1.5 h-4 w-4 text-muted-foreground/70" />
                              <Input
                                type="date"
                                value={
                                  field.value ? field.value.split("T")[0] : ""
                                }
                                onChange={(e) => {
                                  const date = new Date(e.target.value);
                                  field.onChange(date.toISOString());
                                }}
                                className="pl-10 h-10 transition-all border-muted-foreground/20 focus:ring-2 focus:ring-indigo-500/20 bg-background/50"
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
                className="flex-1 sm:flex-none px-10 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all active:scale-[0.98] h-11 border-none"
              >
                {isPending && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Invoice
              </Button>
            </SheetFooter>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
