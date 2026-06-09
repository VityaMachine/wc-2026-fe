"use client";

import { useLocale } from "@/providers/LocaleProvider";
import { TournamentParticipationCard } from "@/components/tournaments/TournamentParticipationCard";
import type { Tournament } from "@/types/tournament";
import styles from "./HomeContent.module.css";

type HomeContentProps = {
  tournaments: Tournament[];
  error?: string;
};

export function HomeContent({ tournaments, error }: HomeContentProps) {
  const { t } = useLocale();

  return (
    <section className={styles.home}>
      <div className={styles.hero}>
        <h1>{t("heroTitle")}</h1>
        <p>{t("heroSubtitle")}</p>
      </div>

      <TournamentParticipationCard slug="world-cup-2026" />

      {error ? (
        <div className={styles.errorBox} role="alert">
          <h2>Unable to load tournaments</h2>
          <p>{error}</p>
        </div>
      ) : (
        <section className={styles.section}>
          <h2>{t("availableTournaments")}</h2>
          {tournaments.length > 0 ? (
            <ul className={styles.tournamentList}>
              {tournaments.map((tournament) => (
                <li className={styles.tournamentItem} key={tournament.id ?? tournament.slug}>
                  <h3>{tournament.name ?? "Unnamed tournament"}</h3>
                  <dl>
                    <div>
                      <dt>{t("slug")}</dt>
                      <dd>{tournament.slug ?? "N/A"}</dd>
                    </div>
                    <div>
                      <dt>{t("status")}</dt>
                      <dd>{tournament.status ?? "N/A"}</dd>
                    </div>
                    <div>
                      <dt>{t("year")}</dt>
                      <dd>{tournament.year ?? "N/A"}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptyState}>No tournaments are available yet.</p>
          )}
        </section>
      )}
    </section>
  );
}
