"use client";

import { useQuery } from "@tanstack/react-query";
import { getInvoices } from "@/services/invoice-service";
import { InvoicesTable } from "./invoices-table";
import { Skeleton } from "@/components/ui/skeleton";

export function InvoicesClient() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 h-full gap-8 p-8 max-w-(--breakpoint-2xl) mx-auto w-full">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full gap-8 p-8 max-w-(--breakpoint-2xl) mx-auto w-full">
      <InvoicesTable data={invoices || []} />
    </div>
  );
}
