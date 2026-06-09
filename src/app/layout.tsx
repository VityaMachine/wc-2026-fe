import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "WC2026 Predictor",
  description: "World Cup 2026 prediction game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
