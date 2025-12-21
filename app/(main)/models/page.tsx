import { ModelsClient } from "./models-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Models | Acuative Corp.",
  description: "Hardware models catalog.",
};

export default function ModelsPage() {
  return <ModelsClient />;
}
