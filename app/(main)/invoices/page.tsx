import { InvoicesClient } from "@/components/features/invoices/invoices-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoices | Acuative Corp.",
  description: "Finance department invoices management.",
};

export default function InvoicesPage() {
  return <InvoicesClient />;
}
