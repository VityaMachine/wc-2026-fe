"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_LOCALE, translations, type TranslationKey } from "@/lib/i18n";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Locale } from "@/types/locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return value === "uk" || value === "en";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const hasLoadedSavedLocale = useRef(false);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem(STORAGE_KEYS.locale);
    const timeoutId = window.setTimeout(() => {
      if (isLocale(savedLocale)) {
        setLocale(savedLocale);
      }

      hasLoadedSavedLocale.current = true;
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!hasLoadedSavedLocale.current) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.locale, locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key) => translations[locale][key],
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider.");
  }

  return context;
}
