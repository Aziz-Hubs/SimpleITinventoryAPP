import { getAssets } from "@/services/dashboard-service";
import { InventoryMasterClient } from "./inventory-master-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventory Master | Acuative Corp.",
  description: "Centralized asset management and tracking.",
};

export default async function InventoryMasterPage() {
  const assets = await getAssets();

  return <InventoryMasterClient initialAssets={assets} />;
}
