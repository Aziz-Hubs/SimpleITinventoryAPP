import { InventoryMasterClient } from "./inventory-master-client";
import { Metadata } from "next";
import { promises as fs } from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Inventory | Acuative Corp.",
  description: "Centralized asset management and tracking.",
};

export default async function InventoryMasterPage() {
  let totalAssetCount = 0;

  try {
    const filePath = path.join(process.cwd(), "data/inv.json");
    const fileContents = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(fileContents);
    totalAssetCount = Array.isArray(data) ? data.length : 0;
  } catch (error) {
    console.error("Error reading inventory file:", error);
  }

  return <InventoryMasterClient totalAssetCount={totalAssetCount} />;
}
