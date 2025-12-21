/**
 * @file theme-provider.tsx
 * @description Thin wrapper around next-themes ThemeProvider for consistent dark/light mode support.
 * @path /components/layout/theme-provider.tsx
 */

"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
