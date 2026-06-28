"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatMatchStage } from "@/lib/match-stage";
import { getTeamFlag } from "@/lib/team-flags";
import { useAuth } from "@/providers/AuthProvider";
import { useLocale } from "@/providers/LocaleProvider";
import { getMatches } from "@/services/matches.service";
import { getMyPredictions } from "@/services/predictions.service";
import type { Match } from "@/types/match";
import type { Prediction } from "@/types/prediction";
import styles from "./MyPredictionsContent.module.css";

type TeamLike = {
  id?: string | number;
  name?: string | null;
  code?: string | null;
  logoUrl?: string | null;
} | null | undefined;

type ResolvedMatch = {
  id?: string | number | null;
  status?: string;
  stage?: string | null;
  groupName?: string | null;
  startTime?: string | null;
  startsAt?: string | null;
  kickoffAt?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam?: TeamLike;
  awayTeam?: TeamLike;
};

type PredictionWithResolvedMatch = Prediction & {
  resolvedMatch?: ResolvedMatch | null;
};

type PredictionFilter = "all" | "upcoming" | "finished";

function formatScore(home?: number | null, away?: number | null) {
  return typeof home === "number" && typeof away === "number" ? `${home} - ${away}` : "—";
}

function formatPredictionScore(prediction: Prediction) {
  return `${prediction.homeScore} - ${prediction.awayScore}`;
}

function formatCalculatedPoints(points: number | undefined, isFinished: boolean) {
  if (!isFinished) {
    return "—";
  }

  return typeof points === "number" ? String(points) : "0";
}

function getMatchStatus(match?: ResolvedMatch | null) {
  return match?.status?.toUpperCase();
}

function isFinishedMatch(match?: ResolvedMatch | null) {
  return getMatchStatus(match) === "FINISHED";
}

function getMatchTimeValue(match?: ResolvedMatch | null) {
  const value = match?.kickoffAt ?? match?.startTime ?? match?.startsAt;

  if (!value) {
    return 0;
  }

  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
}

function sortPredictions(predictions: PredictionWithResolvedMatch[]) {
  return [...predictions].sort((first, second) => {
    const firstMatch = first.resolvedMatch ?? first.match;
    const secondMatch = second.resolvedMatch ?? second.match;
    const firstFinished = isFinishedMatch(firstMatch);
    const secondFinished = isFinishedMatch(secondMatch);
    const firstTime = getMatchTimeValue(firstMatch);
    const secondTime = getMatchTimeValue(secondMatch);

    if (firstFinished !== secondFinished) {
      return firstFinished ? 1 : -1;
    }

    return firstFinished ? secondTime - firstTime : firstTime - secondTime;
  });
}

function filterPredictions(predictions: PredictionWithResolvedMatch[], filter: PredictionFilter) {
  if (filter === "all") {
    return predictions;
  }

  return predictions.filter((prediction) => {
    const finished = isFinishedMatch(prediction.resolvedMatch ?? prediction.match);

    return filter === "finished" ? finished : !finished;
  });
}

function getPredictionHits(prediction: Prediction) {
  return [
    prediction.isExactScore === true ? "exactScoreHit" : null,
    prediction.isWinnerGuessed === true ? "winnerHit" : null,
    prediction.isGoalDifferenceGuessed === true ? "goalDifferenceHit" : null,
    prediction.isDrawGuessed === true ? "drawHit" : null,
    prediction.isTotalGoalsGuessed === true ? "totalGoalsHit" : null,
  ].filter((hit): hit is "exactScoreHit" | "winnerHit" | "goalDifferenceHit" | "drawHit" | "totalGoalsHit" =>
    hit !== null,
  );
}

function getMatchId(match?: ResolvedMatch | null) {
  return match?.id !== undefined && match.id !== null ? String(match.id) : null;
}

function mergeTeam(predictionTeam: TeamLike, matchTeam: TeamLike): TeamLike {
  if (!predictionTeam) {
    return matchTeam ?? null;
  }

  if (!matchTeam) {
    return predictionTeam;
  }

  return {
    ...matchTeam,
    ...predictionTeam,
    name: predictionTeam.name ?? matchTeam.name,
    code: predictionTeam.code ?? matchTeam.code,
    logoUrl: predictionTeam.logoUrl ?? matchTeam.logoUrl,
  };
}

function resolvePredictionMatch(prediction: Prediction, matchFromList?: Match): ResolvedMatch | null {
  if (!prediction.match) {
    return matchFromList ?? null;
  }

  if (!matchFromList) {
    return prediction.match;
  }

  return {
    ...matchFromList,
    ...prediction.match,
    status: prediction.match.status ?? matchFromList.status,
    stage: prediction.match.stage ?? matchFromList.stage,
    groupName: prediction.match.groupName ?? matchFromList.groupName,
    startTime: prediction.match.startTime ?? matchFromList.startTime,
    kickoffAt: prediction.match.kickoffAt ?? matchFromList.kickoffAt,
    homeScore: prediction.match.homeScore ?? matchFromList.homeScore,
    awayScore: prediction.match.awayScore ?? matchFromList.awayScore,
    homeTeam: mergeTeam(prediction.match.homeTeam, matchFromList.homeTeam),
    awayTeam: mergeTeam(prediction.match.awayTeam, matchFromList.awayTeam),
  };
}

function getTeamName(team: TeamLike) {
  return team?.name || team?.code || "";
}

function TeamDisplay({ team, side, name }: { team: TeamLike; side: "home" | "away"; name: string }) {
  const [hasImageError, setHasImageError] = useState(false);
  const logoUrl = !hasImageError && team?.logoUrl ? team.logoUrl : null;
  const hasLogo = Boolean(logoUrl);
  const fallbackCode = team?.code || getTeamFlag(team?.code, team?.name) || "";
  const mobileLabel = hasLogo ? team?.code || name : team?.code ? null : name;
  const marker =
    logoUrl ? (
      <img className={styles.teamLogo} src={logoUrl} alt="" loading="lazy" onError={() => setHasImageError(true)} />
    ) : fallbackCode ? (
      <span className={styles.teamCode} aria-hidden="true">
        {fallbackCode}
      </span>
    ) : null;
  const teamName = (
    <>
      <span className={styles.desktopTeamName} title={name}>
        {name}
      </span>
      {mobileLabel ? (
        <span className={styles.mobileTeamCode} title={name}>
          {mobileLabel}
        </span>
      ) : null}
    </>
  );

  if (side === "away") {
    return (
      <>
        {teamName}
        {marker}
      </>
    );
  }

  return (
    <>
      {marker}
      {teamName}
    </>
  );
}

function formatDateTime(value: string | null | undefined, locale: "uk" | "en") {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusClass(status?: string) {
  if (status === "LIVE") {
    return `${styles.statusBadge} ${styles.statusLive}`;
  }

  if (status === "FINISHED") {
    return `${styles.statusBadge} ${styles.statusFinished}`;
  }

  return styles.statusBadge;
}

function getStatusLabel(status: string | undefined, t: ReturnType<typeof useLocale>["t"]) {
  if (status === "LIVE") {
    return t("live");
  }

  if (status === "FINISHED") {
    return t("finished");
  }

  if (status === "SCHEDULED") {
    return t("scheduled");
  }

  return status ?? "—";
}

function MyPredictionsSkeleton() {
  return (
    <section className={styles.page} aria-busy="true">
      <div className={styles.header}>
        <Skeleton className={styles.titleSkeleton} />
        <Skeleton className={styles.subtitleSkeleton} />
      </div>
      <div className={styles.list}>
        {[0, 1, 2].map((item) => (
          <article className={styles.card} key={item}>
            <Skeleton className={styles.cardTitleSkeleton} />
            <Skeleton className={styles.cardLineSkeleton} />
            <Skeleton className={styles.cardLineSkeleton} />
          </article>
        ))}
      </div>
    </section>
  );
}

export function MyPredictionsContent() {
  const { isAuthenticated, isLoading: isAuthLoading, token } = useAuth();
  const { locale, t } = useLocale();
  const [predictions, setPredictions] = useState<PredictionWithResolvedMatch[]>([]);
  const [activeFilter, setActiveFilter] = useState<PredictionFilter>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sortedPredictions = useMemo(() => sortPredictions(predictions), [predictions]);
  const visiblePredictions = useMemo(
    () => filterPredictions(sortedPredictions, activeFilter),
    [activeFilter, sortedPredictions],
  );
  const predictionSummary = useMemo(
    () => ({
      total: predictions.length,
      finished: predictions.filter((prediction) => isFinishedMatch(prediction.resolvedMatch ?? prediction.match)).length,
      points: predictions.reduce((total, prediction) => {
        return total + (typeof prediction.points === "number" ? prediction.points : 0);
      }, 0),
      exactScores: predictions.filter((prediction) => prediction.isExactScore === true).length,
      winners: predictions.filter((prediction) => prediction.isWinnerGuessed === true).length,
    }),
    [predictions],
  );

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !token) {
      return;
    }

    let isMounted = true;

    async function loadPredictions(currentToken: string) {
      setIsLoading(true);
      setError(null);

      try {
        const items = await getMyPredictions(currentToken);
        let matchesById = new Map<string, Match>();

        try {
          const matchesResponse = await getMatches({ limit: 100 });

          matchesById = new Map(
            matchesResponse.items
              .map((match) => [getMatchId(match), match] as const)
              .filter((entry): entry is readonly [string, Match] => Boolean(entry[0])),
          );
        } catch {
          matchesById = new Map();
        }

        const resolvedItems = items.map((prediction) => ({
          ...prediction,
          resolvedMatch: resolvePredictionMatch(prediction, matchesById.get(String(prediction.matchId))),
        }));

        if (isMounted) {
          setPredictions(resolvedItems);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : t("unableToLoadPredictions"));
          setPredictions([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPredictions(token);

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, isAuthenticated, token, t]);

  if (isAuthLoading || isLoading) {
    return <MyPredictionsSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <section className={styles.page}>
        <div className={styles.header}>
          <h1>{t("myPredictionsTitle")}</h1>
          <p>{t("myPredictionsSubtitle")}</p>
        </div>
        <div className={styles.stateCard}>
          <p>{t("loginToViewMyPredictions")}</p>
          <Link className={styles.primaryLink} href="/login">
            {t("loginRegister")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h1>{t("myPredictionsTitle")}</h1>
        <p>{t("myPredictionsSubtitle")}</p>
      </div>

      {error ? (
        <div className={styles.errorBox} role="alert">
          <h2>{t("unableToLoadPredictions")}</h2>
          <p>{error}</p>
        </div>
      ) : predictions.length === 0 ? (
        <div className={styles.stateCard}>
          <p>{t("noPredictionsYet")}</p>
          <Link className={styles.primaryLink} href="/matches">
            {t("goToMatches")}
          </Link>
        </div>
      ) : (
        <>
          <section className={styles.statsPanel} aria-label={t("myPredictionsSummary")}>
            <h2>{t("myPredictionsSummary")}</h2>
            <dl className={styles.statsGrid}>
              <div>
                <dt>{t("totalPredictions")}</dt>
                <dd>{predictionSummary.total}</dd>
              </div>
              <div>
                <dt>{t("finishedPredictions")}</dt>
                <dd>{predictionSummary.finished}</dd>
              </div>
              <div>
                <dt>{t("totalPoints")}</dt>
                <dd>{predictionSummary.points}</dd>
              </div>
              <div>
                <dt>{t("exactScores")}</dt>
                <dd>{predictionSummary.exactScores}</dd>
              </div>
              <div>
                <dt>{t("winners")}</dt>
                <dd>{predictionSummary.winners}</dd>
              </div>
            </dl>
          </section>

          <div className={styles.filterScroller}>
            <div className={styles.filterTabs} role="tablist" aria-label={t("filters")}>
              {(
                [
                  ["all", t("allPredictions")],
                  ["upcoming", t("upcomingPredictions")],
                  ["finished", t("finishedPredictions")],
                ] as const
              ).map(([filter, label]) => (
                <button
                  className={
                    activeFilter === filter ? `${styles.filterButton} ${styles.filterButtonActive}` : styles.filterButton
                  }
                  key={filter}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.list}>
            {visiblePredictions.map((prediction) => {
            const match = prediction.resolvedMatch ?? prediction.match;
            const homeTeam = match?.homeTeam ?? null;
            const awayTeam = match?.awayTeam ?? null;
            const homeName = getTeamName(homeTeam) || t("homeTeam");
            const awayName = getTeamName(awayTeam) || t("awayTeam");
            const matchTime = formatDateTime(match?.kickoffAt ?? match?.startTime, locale);
            const matchStatus = getMatchStatus(match);
            const resultHome = match?.homeScore;
            const resultAway = match?.awayScore;
            const hasResult =
              matchStatus === "FINISHED" && typeof resultHome === "number" && typeof resultAway === "number";
            const result = hasResult ? formatScore(resultHome, resultAway) : "vs";
            const calculatedPoints = formatCalculatedPoints(prediction.points, matchStatus === "FINISHED");
            const predictionHits = getPredictionHits(prediction);

            return (
              <article className={styles.card} key={prediction.id}>
                <div className={styles.matchRow}>
                  <div className={styles.homeTeam}>
                    <TeamDisplay team={homeTeam} side="home" name={homeName} />
                  </div>

                  <div className={styles.center}>
                    <span className={hasResult ? styles.matchScore : styles.vs}>{result}</span>
                    <span className={getStatusClass(matchStatus)}>{getStatusLabel(matchStatus, t)}</span>
                  </div>

                  <div className={styles.awayTeam}>
                    <TeamDisplay team={awayTeam} side="away" name={awayName} />
                  </div>
                </div>

                <dl className={styles.summary}>
                  <div>
                    <dt>{t("myPrediction")}</dt>
                    <dd className={styles.score}>{formatPredictionScore(prediction)}</dd>
                  </div>
                  <div>
                    <dt>{t("calculatedPoints")}</dt>
                    <dd className={styles.points}>{calculatedPoints}</dd>
                  </div>
                </dl>

                {matchStatus === "FINISHED" ? (
                  <div className={styles.hitBadges} aria-label={t("predictionHits")}>
                    {predictionHits.length > 0 ? (
                      predictionHits.map((hit) => (
                        <span className={styles.hitBadge} key={hit}>
                          {t(hit)}
                        </span>
                      ))
                    ) : (
                      <span className={`${styles.hitBadge} ${styles.noHitBadge}`}>{t("noHits")}</span>
                    )}
                  </div>
                ) : null}

                <dl className={styles.meta}>
                  <div>
                    <dt>{t("startTime")}</dt>
                    <dd>{matchTime}</dd>
                  </div>
                  <div>
                    <dt>{t("stage")}</dt>
                    <dd>{formatMatchStage(match?.stage, locale)}</dd>
                  </div>
                </dl>
              </article>
            );
            })}
          </div>
        </>
      )}
    </section>
  );
}
