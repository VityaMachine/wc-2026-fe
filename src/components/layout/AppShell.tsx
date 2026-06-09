"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import styles from "./AppShell.module.css";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <Header isMenuOpen={isMobileMenuOpen} onMenuClick={() => setIsMobileMenuOpen(true)} />
      <div className={styles.shell}>
        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <main className={styles.main}>{children}</main>
      </div>
    </>
  );
}
