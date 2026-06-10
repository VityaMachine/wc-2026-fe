"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useLocale } from "@/providers/LocaleProvider";
import styles from "./Sidebar.module.css";

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const navItems = [
  { href: "/", labelKey: "navHome" },
  { href: "/matches", labelKey: "navMatches" },
  { href: "/standings", labelKey: "navStandings" },
] as const;

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { t } = useLocale();
  const visibleNavItems = isAuthenticated
    ? [
        ...navItems,
        { href: "/leaderboard", labelKey: "navLeaderboard" } as const,
        { href: "/my-predictions", labelKey: "navMyPredictions" } as const,
      ]
    : navItems;

  useEffect(() => {
    if (!isOpen || !onClose) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <aside
        id="mobile-sidebar"
        className={isOpen ? `${styles.sidebar} ${styles.open}` : styles.sidebar}
        aria-label={t("menu")}
      >
        <div className={styles.header}>
          <h2>{t("menu")}</h2>
          <button className={styles.closeButton} type="button" aria-label={t("closeMenu")} onClick={onClose}>
            ×
          </button>
        </div>
        <nav className={styles.nav} aria-label={t("menu")}>
          {visibleNavItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                className={isActive ? `${styles.link} ${styles.active}` : styles.link}
                href={item.href}
                onClick={onClose}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div
        className={isOpen ? `${styles.backdrop} ${styles.backdropOpen}` : styles.backdrop}
        aria-hidden="true"
        onClick={onClose}
      />
    </>
  );
}
