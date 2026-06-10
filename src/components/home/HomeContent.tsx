"use client";

import { useLocale } from "@/providers/LocaleProvider";
import { HomeInfoSections } from "@/components/home/HomeInfoSections";
import { TournamentParticipationCard } from "@/components/tournaments/TournamentParticipationCard";
import styles from "./HomeContent.module.css";

export function HomeContent() {
  const { t } = useLocale();

  return (
    <section className={styles.home}>
      <div className={styles.hero}>
        <h1>{t("heroTitle")}</h1>
        <p>{t("heroSubtitle")}</p>
      </div>

      <TournamentParticipationCard slug="world-cup-2026" />

      <HomeInfoSections />
    </section>
  );
}
