"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { PredictionForm } from "@/components/predictions/PredictionForm";
import { ParticipantsPredictionsModal } from "@/components/participants-predictions/ParticipantsPredictionsModal";
import { formatMatchStage, getPlayoffStage } from "@/lib/match-stage";
import { getTeamFlag } from "@/lib/team-flags";
import { useLocale } from "@/providers/LocaleProvider";
import type { Team } from "@/types/team";
import type { Match } from "@/types/match";
import type { Prediction } from "@/types/prediction";
import styles from "./MatchCard.module.css";

type MatchCardProps = {
  match: Match;
  existingPrediction?: Prediction;
  isAuthenticated: boolean;
  onPredictionCreated: (prediction: Prediction) => void;
};

const LOCALE_BY_APP_LOCALE = {
  uk: "uk-UA",
  en: "en-US",
} as const;

function formatMatchScore(match: Match) {
  const hasHomeScore = typeof match.homeScore === "number";
  const hasAwayScore = typeof match.awayScore === "number";

  if (!hasHomeScore || !hasAwayScore) {
    return "-";
  }

  return `${match.homeScore} - ${match.awayScore}`;
}

function getTeamGroup(match: Match) {
  return match.homeTeam?.groupName ?? match.awayTeam?.groupName ?? match.groupName ?? "N/A";
}

function getMatchDisplayInfo({
  match,
  locale,
  t,
}: {
  match: Match;
  locale: ReturnType<typeof useLocale>["locale"];
  t: ReturnType<typeof useLocale>["t"];
}) {
  if (getPlayoffStage(match.stage)) {
    return {
      label: t("stage"),
      value: formatMatchStage(match.stage, locale),
    };
  }

  return {
    label: t("group"),
    value: getTeamGroup(match),
  };
}

function TeamLogo({ team, align }: { team?: Team | null; align: "left" | "right" }) {
  const [hasImageError, setHasImageError] = useState(false);
  const fallbackFlag = getTeamFlag(team?.code, team?.name);
  const className = align === "left" ? styles.logo : `${styles.logo} ${styles.logoRight}`;

  if (team?.logoUrl && !hasImageError) {
    return <img className={className} src={team.logoUrl} alt="" loading="lazy" onError={() => setHasImageError(true)} />;
  }

  if (team?.code) {
    return (
      <span className={className} aria-hidden="true">
        {team.code}
      </span>
    );
  }

  return (
    <span className={className} aria-hidden="true">
      {fallbackFlag}
    </span>
  );
}

function getMatchDate(value: string | undefined, locale: string) {
  if (!value) {
    return { date: "N/A", time: "N/A", full: "N/A" };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { date: value, time: "N/A", full: value };
  }

  return {
    date: new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
    full: new Intl.DateTimeFormat(locale, {
      dateStyle: "full",
      timeStyle: "short",
    }).format(date),
  };
}

function getLiveLabel(label: string, elapsed?: number | null) {
  return typeof elapsed === "number" ? `${label} ${elapsed}'` : label;
}

function getPredictionBadge({
  existingPrediction,
  isAuthenticated,
  status,
  t,
}: {
  existingPrediction?: Prediction;
  isAuthenticated: boolean;
  status?: string;
  t: ReturnType<typeof useLocale>["t"];
}) {
  if (existingPrediction) {
    return {
      className: `${styles.predictionBadge} ${styles.predictionBadgeSuccess}`,
      text: `${t("predictionBadge")}: ${existingPrediction.homeScore}–${existingPrediction.awayScore}`,
    };
  }

  if (status === "SCHEDULED") {
    return {
      className: `${styles.predictionBadge} ${
        isAuthenticated ? styles.predictionBadgeAction : styles.predictionBadgeMuted
      }`,
      text: isAuthenticated ? t("makePredictionShort") : t("loginToPredictShort"),
    };
  }

  if (status === "LIVE" || status === "FINISHED") {
    return {
      className: `${styles.predictionBadge} ${styles.predictionBadgeClosed}`,
      text: t("predictionsClosedShort"),
    };
  }

  return {
    className: `${styles.predictionBadge} ${styles.predictionBadgeMuted}`,
    text: t("predictionsUnavailableShort"),
  };
}

export function MatchCard({ match, existingPrediction, isAuthenticated, onPredictionCreated }: MatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const { locale, t } = useLocale();
  const dateTime = getMatchDate(match.startTime, LOCALE_BY_APP_LOCALE[locale]);
  const status = match.status?.toUpperCase();
  const isLive = status === "LIVE";
  const isFinished = status === "FINISHED";
  const score = formatMatchScore(match);
  const liveLabel = getLiveLabel(t("live"), match.elapsed);
  const homeTeamName = match.homeTeam?.name ?? t("unknownTeam");
  const awayTeamName = match.awayTeam?.name ?? t("unknownTeam");
  const homeTeamCode = match.homeTeam?.code || homeTeamName;
  const awayTeamCode = match.awayTeam?.code || awayTeamName;
  const displayInfo = getMatchDisplayInfo({ match, locale, t });
  const matchId = match.id != null ? String(match.id) : null;
  const predictionBadge = getPredictionBadge({
    existingPrediction,
    isAuthenticated,
    status,
    t,
  });

  return (
    <article className={styles.item}>
      <button
        className={styles.row}
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((current) => !current)}
      >
        <span className={styles.homeTeam}>
          <TeamLogo team={match.homeTeam} align="left" />
          <span className={styles.teamNameFull}>{homeTeamName}</span>
          <span className={styles.teamNameCode}>{homeTeamCode}</span>
        </span>

        <span className={styles.center}>
          {isLive ? (
            <>
              <span className={styles.liveBadge}>{liveLabel}</span>
              <span className={styles.liveScore}>{score}</span>
            </>
          ) : isFinished ? (
            <>
              <span className={styles.score}>{score}</span>
              <span className={styles.finished}>{t("finished")}</span>
            </>
          ) : (
            <>
              <span className={styles.date}>{dateTime.date}</span>
              <span className={styles.time}>{dateTime.time}</span>
            </>
          )}
          <span className={predictionBadge.className}>{predictionBadge.text}</span>
        </span>

        <span className={styles.awayTeam}>
          <span className={styles.teamNameFull}>{awayTeamName}</span>
          <span className={styles.teamNameCode}>{awayTeamCode}</span>
          <TeamLogo team={match.awayTeam} align="right" />
        </span>
      </button>

      {isExpanded ? (
        <div className={styles.details}>
          <h3>{t("matchDetails")}</h3>
          <dl>
            <div>
              <dt>{displayInfo.label}</dt>
              <dd>{displayInfo.value}</dd>
            </div>
            <div>
              <dt>{t("status")}</dt>
              <dd>{match.status ?? "N/A"}</dd>
            </div>
            <div>
              <dt>{t("startTime")}</dt>
              <dd>{dateTime.full}</dd>
            </div>
          </dl>
          <div className={styles.predictionActions}>
            {matchId ? (
              <PredictionForm
                matchId={matchId}
                existingPrediction={existingPrediction}
                onCreated={onPredictionCreated}
                isMatchScheduled={status === "SCHEDULED"}
              />
            ) : null}
            {isAuthenticated && existingPrediction ? (
              <button
                className={styles.participantsButton}
                type="button"
                onClick={() => setIsParticipantsModalOpen(true)}
              >
                {t("showParticipantsPredictions")}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      <ParticipantsPredictionsModal
        isOpen={isParticipantsModalOpen}
        match={match}
        onClose={() => setIsParticipantsModalOpen(false)}
      />
    </article>
  );
}
