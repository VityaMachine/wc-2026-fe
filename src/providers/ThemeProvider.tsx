"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Theme } from "@/types/theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const DEFAULT_THEME: Theme = "light";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const hasLoadedSavedTheme = useRef(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(STORAGE_KEYS.theme);
    const timeoutId = window.setTimeout(() => {
      if (isTheme(savedTheme)) {
        setTheme(savedTheme);
      }

      hasLoadedSavedTheme.current = true;
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!hasLoadedSavedTheme.current) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
}
