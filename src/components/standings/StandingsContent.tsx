"use client";

import { useLocale } from "@/providers/LocaleProvider";
import type { StandingsResponse } from "@/types/standings";
import { StandingsTable } from "./StandingsTable";
import styles from "./StandingsContent.module.css";

type StandingsContentProps = {
  standings?: StandingsResponse;
  error?: string;
};

export function StandingsContent({ standings, error }: StandingsContentProps) {
  const { t } = useLocale();

  return (
    <section className={styles.standings}>
      <div className={styles.header}>
        <h1>{t("standingsTitle")}</h1>
        <p>{t("standingsSubtitle")}</p>
      </div>

      {error ? (
        <div className={styles.errorBox} role="alert">
          <h2>{t("unableToLoadStandings")}</h2>
          <p>{error}</p>
        </div>
      ) : standings && standings.groups.length > 0 ? (
        <div className={styles.groups}>
          {standings.groups.map((group) => (
            <StandingsTable group={group} key={group.groupName} />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>{t("unableToLoadStandings")}</p>
      )}
    </section>
  );
}
