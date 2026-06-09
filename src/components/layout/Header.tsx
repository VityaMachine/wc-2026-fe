"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useLocale } from "@/providers/LocaleProvider";
import { useTheme } from "@/providers/ThemeProvider";
import type { Locale } from "@/types/locale";
import type { Theme } from "@/types/theme";
import styles from "./Header.module.css";

type HeaderProps = {
  isMenuOpen?: boolean;
  onMenuClick?: () => void;
};

export function Header({ isMenuOpen = false, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const { theme, setTheme } = useTheme();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <button
            className={styles.menuButton}
            type="button"
            aria-label={t("openMenu")}
            aria-controls="mobile-sidebar"
            aria-expanded={isMenuOpen}
            onClick={onMenuClick}
          >
            =
          </button>
          <Link className={styles.logo} href="/">
            {t("appName")}
          </Link>
        </div>
        <div className={styles.actions}>
          <div className={styles.controls}>
            <label className={styles.control}>
              <span>{t("language")}</span>
              <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
                <option value="uk">UK</option>
                <option value="en">EN</option>
              </select>
            </label>
            <label className={styles.control}>
              <span>{t("theme")}</span>
              <select value={theme} onChange={(event) => setTheme(event.target.value as Theme)}>
                <option value="light">{t("light")}</option>
                <option value="dark">{t("dark")}</option>
              </select>
            </label>
          </div>
          {isLoading ? null : isAuthenticated ? (
            <div className={styles.userActions}>
              <span className={styles.username}>{user?.username}</span>
              <button className={styles.authLink} type="button" onClick={handleLogout}>
                {t("logout")}
              </button>
            </div>
          ) : (
            <Link className={styles.authLink} href="/login">
              {t("loginRegister")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
