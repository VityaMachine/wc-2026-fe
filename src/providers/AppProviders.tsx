"use client";

import { AuthProvider } from "@/providers/AuthProvider";
import { LocaleProvider } from "@/providers/LocaleProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <AuthProvider>{children}</AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
