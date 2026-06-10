"use client";

import { useLocale } from "@/providers/LocaleProvider";
import type { LeaderboardEntry } from "@/types/leaderboard";
import styles from "./LeaderboardTable.module.css";

type LeaderboardTableProps = {
  entries: LeaderboardEntry[];
  emptyMessage: string;
  prizePoolAmount?: number;
  prizeUserIds?: Set<string>;
  variant: "overall" | "prize";
};

const PRIZE_DISTRIBUTION = [0.5, 0.3, 0.2];

function getPrizeAmount(position: number, totalAmount: number) {
  const percent = PRIZE_DISTRIBUTION[position - 1] ?? 0;

  if (!percent || totalAmount <= 0) {
    return null;
  }

  return Math.round(totalAmount * percent);
}

function getPrizeBadgeClass(position: number) {
  if (position === 1) {
    return `${styles.prizeBadge} ${styles.prizeGold}`;
  }

  if (position === 2) {
    return `${styles.prizeBadge} ${styles.prizeSilver}`;
  }

  if (position === 3) {
    return `${styles.prizeBadge} ${styles.prizeBronze}`;
  }

  return styles.prizeEmpty;
}

function getPrizeIcon(position: number) {
  if (position === 1) {
    return "🥇";
  }

  if (position === 2) {
    return "🥈";
  }

  if (position === 3) {
    return "🥉";
  }

  return "";
}

function resolveParticipantType(entry: LeaderboardEntry, prizeUserIds: Set<string>) {
  if (entry.participantType) {
    return entry.participantType;
  }

  if (entry.type) {
    return entry.type;
  }

  return entry.userId && prizeUserIds.has(entry.userId) ? "PAID" : "FREE";
}

function getRankClass(rank: number) {
  if (rank === 1) {
    return `${styles.rank} ${styles.rankGold}`;
  }

  if (rank === 2) {
    return `${styles.rank} ${styles.rankSilver}`;
  }

  if (rank === 3) {
    return `${styles.rank} ${styles.rankBronze}`;
  }

  return styles.rank;
}

function getCount(value: number | undefined) {
  return value ?? 0;
}

function getDisplayName(username: string, displayName?: string | null) {
  const normalizedDisplayName = displayName?.trim();

  if (!normalizedDisplayName || normalizedDisplayName === username) {
    return null;
  }

  return normalizedDisplayName;
}

function UserIdentity({ displayName, username }: { displayName: string | null; username: string }) {
  return (
    <span className={styles.userIdentity}>
      <span className={styles.username}>{username}</span>
      {displayName ? <span className={styles.displayName}>{displayName}</span> : null}
    </span>
  );
}

export function LeaderboardTable({
  entries,
  emptyMessage,
  prizePoolAmount = 0,
  prizeUserIds = new Set(),
  variant,
}: LeaderboardTableProps) {
  const { t } = useLocale();
  const shouldShowParticipantType = variant === "overall";
  const shouldShowPrize = variant === "prize";
  const rows = entries.map((entry, index) => {
    const rank = entry.rank ?? index + 1;
    const username = entry.username ?? entry.email ?? t("unknownUser");
    const displayName = getDisplayName(username, entry.displayName);
    const points = entry.points ?? entry.totalPoints ?? 0;
    const predictions = getCount(entry.predictionsCount);
    const exact = getCount(entry.exactScoreCount);
    const draws = getCount(entry.drawGuessedCount);
    const goalDiff = getCount(entry.goalDifferenceGuessedCount);
    const winner = getCount(entry.winnerGuessedCount);
    const goals = getCount(entry.totalGoalsGuessedCount);
    const participantType = resolveParticipantType(entry, prizeUserIds);
    const prizeAmount = getPrizeAmount(rank, prizePoolAmount);

    return {
      draws,
      entry,
      exact,
      goalDiff,
      goals,
      participantType,
      points,
      predictions,
      prizeAmount,
      rank,
      displayName,
      winner,
      username,
    };
  });

  if (entries.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t("rank")}</th>
              <th>{t("user")}</th>
              <th>{t("points")}</th>
              <th>{t("predictions")}</th>
              <th>{t("exact")}</th>
              <th>{t("draws")}</th>
              <th>{t("goalDiff")}</th>
              <th>{t("winner")}</th>
              <th>{t("goals")}</th>
              {shouldShowParticipantType ? <th>{t("participantType")}</th> : null}
              {shouldShowPrize ? <th>{t("prize")}</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map(
              ({ displayName, draws, entry, exact, goalDiff, goals, participantType, points, predictions, prizeAmount, rank, username, winner }) => (
              <tr key={`${entry.userId ?? entry.email ?? username}-${rank}`}>
                <td>
                  <span className={getRankClass(rank)}>{rank}</span>
                </td>
                <td className={styles.userCell}>
                  <UserIdentity displayName={displayName} username={username} />
                </td>
                <td className={styles.points}>{points}</td>
                <td>{predictions}</td>
                <td>{exact}</td>
                <td>{draws}</td>
                <td>{goalDiff}</td>
                <td>{winner}</td>
                <td>{goals}</td>
                {shouldShowParticipantType ? (
                  <td>
                    <span className={`${styles.badge} ${participantType === "PAID" ? styles.paid : styles.free}`}>
                      {participantType === "PAID" ? t("paid") : t("free")}
                    </span>
                  </td>
                ) : null}
                {shouldShowPrize ? (
                  <td>
                    {prizeAmount ? (
                      <span className={getPrizeBadgeClass(rank)}>
                        {getPrizeIcon(rank)} {prizeAmount} грн
                      </span>
                    ) : (
                      <span className={styles.prizeEmpty}>—</span>
                    )}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.mobileCards}>
        {rows.map(({ displayName, draws, entry, exact, goalDiff, goals, participantType, points, predictions, prizeAmount, rank, username, winner }) => (
          <article className={styles.mobileCard} key={`${entry.userId ?? entry.email ?? username}-${rank}`}>
            <div className={styles.mobileCardHeader}>
              <span className={getRankClass(rank)}>#{rank}</span>
              <UserIdentity displayName={displayName} username={username} />
              {shouldShowParticipantType ? (
                <span className={`${styles.badge} ${participantType === "PAID" ? styles.paid : styles.free}`}>
                  {participantType === "PAID" ? t("paid") : t("free")}
                </span>
              ) : null}
            </div>
            <dl className={styles.mobileStats}>
              <div>
                <dt>{t("points")}</dt>
                <dd>{points}</dd>
              </div>
              <div>
                <dt>{t("predictions")}</dt>
                <dd>{predictions}</dd>
              </div>
              <div>
                <dt>{t("exact")}</dt>
                <dd>{exact}</dd>
              </div>
              <div>
                <dt>{t("draws")}</dt>
                <dd>{draws}</dd>
              </div>
              <div>
                <dt>{t("goalDiff")}</dt>
                <dd>{goalDiff}</dd>
              </div>
              <div>
                <dt>{t("winner")}</dt>
                <dd>{winner}</dd>
              </div>
              <div>
                <dt>{t("goals")}</dt>
                <dd>{goals}</dd>
              </div>
              {shouldShowPrize ? (
                <div>
                  <dt>{t("prize")}</dt>
                  <dd>
                    {prizeAmount ? (
                      <span className={getPrizeBadgeClass(rank)}>
                        {getPrizeIcon(rank)} {prizeAmount} грн
                      </span>
                    ) : (
                      <span className={styles.prizeEmpty}>—</span>
                    )}
                  </dd>
                </div>
              ) : null}
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}
