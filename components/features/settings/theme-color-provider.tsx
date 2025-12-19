"use client";

import * as React from "react";
import { useTheme } from "next-themes";

export type ThemeColor = "zinc" | "rose" | "blue" | "green" | "orange";

type ThemeColorProviderProps = {
  children: React.ReactNode;
  defaultThemeColor?: ThemeColor;
  storageKey?: string;
};

type ThemeColorContextType = {
  themeColor: ThemeColor;
  setThemeColor: (theme: ThemeColor) => void;
};

const ThemeColorContext = React.createContext<ThemeColorContextType>({
  themeColor: "zinc",
  setThemeColor: () => null,
});

export function useThemeColor() {
  return React.useContext(ThemeColorContext);
}

export function ThemeColorProvider({
  children,
  defaultThemeColor = "zinc",
  storageKey = "theme-color",
  ...props
}: ThemeColorProviderProps) {
  const [themeColor, setThemeColor] = React.useState<ThemeColor>(() =>
    typeof localStorage !== "undefined"
      ? (localStorage.getItem(storageKey) as ThemeColor)
      : defaultThemeColor
  );

  React.useEffect(() => {
    const root = window.document.body;
    root.classList.remove(
      "theme-zinc",
      "theme-rose",
      "theme-blue",
      "theme-green",
      "theme-orange"
    );
    root.classList.add(`theme-${themeColor}`);
    // Also set data attribute for easier CSS selection if needed
    root.setAttribute("data-theme-color", themeColor);

    if (typeof localStorage !== "undefined") {
      localStorage.setItem(storageKey, themeColor);
    }
  }, [themeColor, storageKey]);

  return (
    <ThemeColorContext.Provider
      value={{
        themeColor,
        setThemeColor,
      }}
      {...props}
    >
      {children}
    </ThemeColorContext.Provider>
  );
}
