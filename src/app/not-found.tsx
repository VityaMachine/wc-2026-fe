"use client";

import Link from "next/link";
import { useLocale } from "@/providers/LocaleProvider";
import styles from "./not-found.module.css";

export default function NotFound() {
  const { t } = useLocale();

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.pitch} aria-hidden="true">
          <span className={styles.ball} />
          <span className={styles.goal} />
        </div>

        <p className={styles.brand}>WC2026 Predictor</p>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>{t("notFoundTitle")}</h2>
        <p className={styles.subtitle}>{t("notFoundSubtitle")}</p>

        <Link className={styles.homeLink} href="/">
          {t("notFoundHome")}
        </Link>
      </div>
    </section>
  );
}
