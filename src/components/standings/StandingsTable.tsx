"use client";

/* eslint-disable @next/next/no-img-element */
import { useLocale } from "@/providers/LocaleProvider";
import type { StandingsGroup, StandingTeam } from "@/types/standings";
import styles from "./StandingsTable.module.css";

type StandingsTableProps = {
  group: StandingsGroup;
};

function TeamLogo({ team }: { team: StandingTeam }) {
  if (!team.logoUrl) {
    return <span className={styles.logoFallback}>{team.code ?? team.name.slice(0, 3)}</span>;
  }

  return <img className={styles.logo} src={team.logoUrl} alt="" loading="lazy" />;
}

export function StandingsTable({ group }: StandingsTableProps) {
  const { t } = useLocale();

  return (
    <section className={styles.group}>
      <h2>{group.groupName}</h2>
      {group.teams.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("position")}</th>
                <th>{t("team")}</th>
                <th>{t("played")}</th>
                <th>{t("won")}</th>
                <th>{t("drawn")}</th>
                <th>{t("lost")}</th>
                <th>{t("goalsFor")}</th>
                <th>{t("goalsAgainst")}</th>
                <th>{t("goalDifference")}</th>
                <th>{t("points")}</th>
              </tr>
            </thead>
            <tbody>
              {group.teams.map((row) => {
                const teamCode = row.team.code || row.team.name;

                return (
                  <tr key={row.team.id}>
                    <td>{row.position}</td>
                    <td>
                      <span className={styles.teamCell}>
                        <TeamLogo team={row.team} />
                        <span className={styles.teamNameFull}>{row.team.name}</span>
                        <span className={styles.teamNameCode}>{teamCode}</span>
                      </span>
                    </td>
                    <td>{row.played}</td>
                    <td>{row.wins}</td>
                    <td>{row.draws}</td>
                    <td>{row.losses}</td>
                    <td>{row.goalsFor}</td>
                    <td>{row.goalsAgainst}</td>
                    <td>{row.goalDifference}</td>
                    <td className={styles.points}>{row.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={styles.empty}>No standings rows yet.</p>
      )}
    </section>
  );
}
