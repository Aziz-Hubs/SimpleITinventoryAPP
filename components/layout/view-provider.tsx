/**
 * @file view-provider.tsx
 * @description Global context provider for managing application view state, search queries, and inventory data.
 * Provides memoized data source to prevent unnecessary re-renders.
 * @path /components/layout/view-provider.tsx
 */

"use client";

import * as React from "react";
import initialData from "@/data/inv.json";

export type ViewType =
  | "dashboard"
  | "inventory"
  | "computing"
  | "peripherals"
  | "network"
  | "utilities"
  | "deployments"
  | "activity-log"
  | "employees"
  | "warranty-watch"
  | "settings"
  | "computing-summary"
  | "peripherals-summary";

export type Asset = (typeof initialData)[0];

interface ViewContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  viewFilter: string | null;
  setViewFilter: (filter: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  data: Asset[]; // Global data source
}

const ViewContext = React.createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentView] = React.useState<ViewType>("dashboard");
  const [viewFilter, setViewFilter] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Memoize data to prevent unnecessary re-renders if we add mutation logic later
  // For now it's static import, but good practice
  const data = React.useMemo(() => initialData, []);

  return (
    <ViewContext.Provider
      value={{
        currentView,
        setCurrentView,
        viewFilter,
        setViewFilter,
        searchQuery,
        setSearchQuery,
        data,
      }}
    >
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const context = React.useContext(ViewContext);
  if (context === undefined) {
    throw new Error("useView must be used within a ViewProvider");
  }
  return context;
}
