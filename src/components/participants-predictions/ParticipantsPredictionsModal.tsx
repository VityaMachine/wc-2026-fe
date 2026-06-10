"use client";

import { useEffect, useMemo, useState } from "react";
import { getParticipantsPredictions } from "@/services/participants-predictions.service";
import { useAuth } from "@/providers/AuthProvider";
import { useLocale } from "@/providers/LocaleProvider";
import type { Match } from "@/types/match";
import type { ParticipantPrediction, ParticipantsPredictionsResponse } from "@/types/participants-predictions";
import styles from "./ParticipantsPredictionsModal.module.css";

type ParticipantsPredictionsModalProps = {
  isOpen: boolean;
  match: Match;
  onClose: () => void;
};

type HitKey = "exactScoreHit" | "drawHit" | "goalDifferenceHit" | "winnerHit" | "totalGoalsHit";

function getMatchId(match: Match) {
  return match.id !== undefined && match.id !== null ? String(match.id) : null;
}

function getMatchTitle(match: Match) {
  const homeName = match.homeTeam?.name ?? match.homeTeam?.code ?? "Home";
  const awayName = match.awayTeam?.name ?? match.awayTeam?.code ?? "Away";

  return `${homeName} vs ${awayName}`;
}

function sortPredictions(predictions: ParticipantPrediction[]) {
  return [...predictions].sort((first, second) => {
    const firstPoints = typeof first.points === "number" ? first.points : 0;
    const secondPoints = typeof second.points === "number" ? second.points : 0;

    if (secondPoints !== firstPoints) {
      return secondPoints - firstPoints;
    }

    return first.username.localeCompare(second.username);
  });
}

function getHitKeys(prediction: ParticipantPrediction): HitKey[] {
  return [
    prediction.isExactScore ? "exactScoreHit" : null,
    prediction.isDrawGuessed ? "drawHit" : null,
    prediction.isGoalDifferenceGuessed ? "goalDifferenceHit" : null,
    prediction.isWinnerGuessed ? "winnerHit" : null,
    prediction.isTotalGoalsGuessed ? "totalGoalsHit" : null,
  ].filter((hit): hit is HitKey => hit !== null);
}

function formatPredictionScore(prediction: ParticipantPrediction) {
  return `${prediction.homeScore} - ${prediction.awayScore}`;
}

function getDisplayName(username: string, displayName?: string | null) {
  const normalizedDisplayName = displayName?.trim();

  if (!normalizedDisplayName || normalizedDisplayName === username) {
    return null;
  }

  return normalizedDisplayName;
}

function UserIdentity({ prediction }: { prediction: ParticipantPrediction }) {
  const displayName = getDisplayName(prediction.username, prediction.displayName);

  return (
    <span className={styles.userIdentity}>
      <span className={styles.username}>{prediction.username}</span>
      {displayName ? <span className={styles.displayName}>{displayName}</span> : null}
    </span>
  );
}

function formatPoints(points: number | null) {
  return typeof points === "number" ? String(points) : "—";
}

function Hits({ prediction, isFinished }: { prediction: ParticipantPrediction; isFinished: boolean }) {
  const { t } = useLocale();
  const hits = getHitKeys(prediction);

  if (prediction.points === null || !isFinished) {
    return <span className={styles.mutedValue}>—</span>;
  }

  if (hits.length === 0) {
    return <span className={`${styles.hitBadge} ${styles.noHitBadge}`}>{t("noHits")}</span>;
  }

  return (
    <span className={styles.hitList}>
      {hits.map((hit) => (
        <span className={styles.hitBadge} key={hit}>
          {t(hit)}
        </span>
      ))}
    </span>
  );
}

export function ParticipantsPredictionsModal({ isOpen, match, onClose }: ParticipantsPredictionsModalProps) {
  const { token } = useAuth();
  const { t } = useLocale();
  const [state, setState] = useState<ParticipantsPredictionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const matchId = getMatchId(match);
  const isFinished = match.status?.toUpperCase() === "FINISHED";
  const predictions = useMemo(() => sortPredictions(state?.predictions ?? []), [state]);

  useEffect(() => {
    if (!isOpen || !token || !matchId) {
      return;
    }

    let isMounted = true;
    const currentMatchId = matchId;
    const currentToken = token;

    async function loadPredictions() {
      setIsLoading(true);
      setError(null);
      setState(null);

      try {
        const response = await getParticipantsPredictions(currentMatchId, currentToken);

        if (isMounted) {
          setState(response);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : t("unableToLoadPredictions"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPredictions();

    return () => {
      isMounted = false;
    };
  }, [isOpen, matchId, retryKey, t, token]);

  useEffect(() => {
    if (!isOpen) {
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

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="participants-predictions-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <h2 id="participants-predictions-title">{t("participantsPredictionsTitle")}</h2>
            <p>{getMatchTitle(match)}</p>
          </div>
          <button className={styles.closeButton} type="button" aria-label={t("closeMenu")} onClick={onClose}>
            x
          </button>
        </header>

        {isLoading ? (
          <div className={styles.stateCard}>{t("loadingPredictions")}</div>
        ) : error ? (
          <div className={styles.stateCard}>
            <p>{error}</p>
            <button className={styles.secondaryButton} type="button" onClick={() => setRetryKey((current) => current + 1)}>
              {t("retry")}
            </button>
          </div>
        ) : state && !state.canViewPredictions ? (
          <div className={styles.stateCard}>
            <p>{t("predictionsLockedText")}</p>
          </div>
        ) : state && predictions.length === 0 ? (
          <div className={styles.stateCard}>{t("noPredictionsForMatch")}</div>
        ) : state ? (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t("rank")}</th>
                    <th>{t("participant")}</th>
                    <th>{t("prediction")}</th>
                    <th>{t("points")}</th>
                    <th>{t("hits")}</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((prediction, index) => (
                    <tr key={prediction.id}>
                      <td>#{index + 1}</td>
                      <td>
                        <UserIdentity prediction={prediction} />
                      </td>
                      <td className={styles.score}>{formatPredictionScore(prediction)}</td>
                      <td className={styles.points}>{formatPoints(prediction.points)}</td>
                      <td>
                        <Hits prediction={prediction} isFinished={isFinished} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.mobileCards}>
              {predictions.map((prediction, index) => (
                <article className={styles.card} key={prediction.id}>
                  <header>
                    <strong>#{index + 1}</strong>
                    <UserIdentity prediction={prediction} />
                  </header>
                  <dl>
                    <div>
                      <dt>{t("prediction")}</dt>
                      <dd>{formatPredictionScore(prediction)}</dd>
                    </div>
                    <div>
                      <dt>{t("points")}</dt>
                      <dd>{formatPoints(prediction.points)}</dd>
                    </div>
                    <div>
                      <dt>{t("hits")}</dt>
                      <dd>
                        <Hits prediction={prediction} isFinished={isFinished} />
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
