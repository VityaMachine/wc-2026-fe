"use client";

import { useEffect, useMemo, useState } from "react";
import { MatchCard } from "@/components/matches/MatchCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatMatchStage, getPlayoffStage, PLAYOFF_STAGE_ORDER, type PlayoffStage } from "@/lib/match-stage";
import { useAuth } from "@/providers/AuthProvider";
import { useLocale } from "@/providers/LocaleProvider";
import { getMyPredictions } from "@/services/predictions.service";
import type { Match } from "@/types/match";
import type { Prediction } from "@/types/prediction";
import styles from "./PlayoffsContent.module.css";

type PlayoffsContentProps = {
  matches: Match[];
  error?: string;
};

function getInitialStage(matches: Match[]): PlayoffStage {
  const firstAvailableStage = PLAYOFF_STAGE_ORDER.find((stage) =>
    matches.some((match) => getPlayoffStage(match.stage) === stage),
  );

  return firstAvailableStage ?? "ROUND_OF_32";
}

export function PlayoffsContent({ matches, error }: PlayoffsContentProps) {
  const [activeStage, setActiveStage] = useState<PlayoffStage>(() => getInitialStage(matches));
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [arePredictionsLoading, setArePredictionsLoading] = useState(false);
  const { isAuthenticated, token } = useAuth();
  const { locale, t } = useLocale();
  const matchesByStage = useMemo(() => {
    return PLAYOFF_STAGE_ORDER.reduce<Record<PlayoffStage, Match[]>>((groupedMatches, stage) => {
      groupedMatches[stage] = matches.filter((match) => getPlayoffStage(match.stage) === stage);

      return groupedMatches;
    }, {} as Record<PlayoffStage, Match[]>);
  }, [matches]);
  const activeMatches = matchesByStage[activeStage] ?? [];
  const activeStageLabel = formatMatchStage(activeStage, locale);
  const predictionsByMatchId = useMemo(() => {
    const visiblePredictions = isAuthenticated && token ? predictions : [];

    return new Map(visiblePredictions.map((prediction) => [String(prediction.matchId), prediction]));
  }, [isAuthenticated, predictions, token]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    let isMounted = true;
    const authToken = token;

    async function loadPredictions() {
      setArePredictionsLoading(true);

      try {
        const myPredictions = await getMyPredictions(authToken);

        if (isMounted) {
          setPredictions(myPredictions);
        }
      } catch {
        if (isMounted) {
          setPredictions([]);
        }
      } finally {
        if (isMounted) {
          setArePredictionsLoading(false);
        }
      }
    }

    loadPredictions();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, token]);

  function handlePredictionCreated(prediction: Prediction) {
    setPredictions((currentPredictions) => {
      const nextPredictions = currentPredictions.filter(
        (currentPrediction) => String(currentPrediction.matchId) !== String(prediction.matchId),
      );

      return [...nextPredictions, prediction];
    });
  }

  return (
    <section className={styles.playoffs}>
      <div className={styles.header}>
        <div>
          <h1>{t("playoffsTitle")}</h1>
          <p>{t("playoffsSubtitle")}</p>
        </div>
        <div className={styles.count}>
          <span>{t("matchesCount")}</span>
          <strong>{matches.length}</strong>
        </div>
      </div>

      {error ? (
        <div className={styles.errorBox} role="alert">
          <h2>{t("unableToLoadMatches")}</h2>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className={styles.switcher} role="tablist" aria-label={t("playoffsTitle")}>
            {PLAYOFF_STAGE_ORDER.map((stage) => {
              const label = formatMatchStage(stage, locale);
              const stageMatchesCount = matchesByStage[stage]?.length ?? 0;

              return (
                <button
                  className={
                    activeStage === stage
                      ? `${styles.switcherButton} ${styles.switcherButtonActive}`
                      : styles.switcherButton
                  }
                  type="button"
                  role="tab"
                  aria-selected={activeStage === stage}
                  onClick={() => setActiveStage(stage)}
                  key={stage}
                >
                  <span>{label}</span>
                  <small>{stageMatchesCount}</small>
                </button>
              );
            })}
          </div>

          {isAuthenticated && token && arePredictionsLoading ? (
            <div className={styles.predictionsLoading} aria-live="polite">
              <Skeleton className={styles.predictionsLoadingSkeleton} />
              <span>{t("loadingPredictions")}</span>
            </div>
          ) : null}

          {activeMatches.length > 0 ? (
            <div className={styles.list}>
              {activeMatches.map((match, index) => (
                <MatchCard
                  match={match}
                  existingPrediction={match.id != null ? predictionsByMatchId.get(String(match.id)) : undefined}
                  isAuthenticated={Boolean(isAuthenticated && token)}
                  onPredictionCreated={handlePredictionCreated}
                  key={match.id ?? index}
                />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>{t("noPlayoffMatchesForStage").replace("{stage}", activeStageLabel)}</p>
          )}
        </>
      )}
    </section>
  );
}
