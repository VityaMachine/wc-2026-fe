"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TELEGRAM_CHANNEL_URL } from "@/config/links";
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
            <Image
              src="/logo.png"
              alt={t("appName")}
              width={36}
              height={36}
              priority
              className={styles.logoImage}
            />
            <span>{t("appName")}</span>
          </Link>
        </div>
        <div className={styles.actions}>
          <div className={styles.controls}>
            <a
              className={styles.telegramLink}
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("telegramChannel")}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                <path d="M21.8 4.3 18.5 20c-.2 1-.8 1.2-1.6.8l-4.8-3.5-2.3 2.2c-.3.3-.5.5-.9.5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2l-11 6.9-4.7-1.5c-1-.3-1-1 .2-1.5L20.4 3.7c.9-.3 1.6.2 1.4.6Z" />
              </svg>
              <span>{t("telegram")}</span>
            </a>
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
