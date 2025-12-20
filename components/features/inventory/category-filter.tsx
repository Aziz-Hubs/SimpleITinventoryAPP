"use client";

import { motion } from "framer-motion";
import {
  Laptop,
  Monitor,
  Usb,
  Headphones,
  Server,
  Network,
  Shield,
  Wifi,
  Radio,
  Battery,
  Video,
  Printer,
  Tv,
  LayoutGrid,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ASSET_CATEGORIES } from "@/lib/types";

const categoryIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Laptop: Laptop,
  Monitor: Monitor,
  Docking: Usb,
  Headset: Headphones,
  Desktop: Server,
  "Network Switch": Network,
  Firewall: Shield,
  "Access Point": Wifi,
  "5G/4G Modem": Radio,
  UPS: Battery,
  NVR: Video,
  Printer: Printer,
  TV: Tv,
};

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2"
    >
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[200px] bg-card/50 backdrop-blur-sm border-border/50 hover:border-border transition-all">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span>All Categories</span>
            </div>
          </SelectItem>
          {ASSET_CATEGORIES.map((category) => {
            const CategoryIcon = categoryIcons[category] || LayoutGrid;
            return (
              <SelectItem key={category} value={category}>
                <div className="flex items-center gap-2">
                  <CategoryIcon className="h-4 w-4" />
                  <span>{category}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>


    </motion.div>
  );
}
