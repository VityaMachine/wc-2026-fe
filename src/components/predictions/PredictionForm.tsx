"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/providers/AuthProvider";
import { useLocale } from "@/providers/LocaleProvider";
import { createPrediction } from "@/services/predictions.service";
import type { Prediction } from "@/types/prediction";
import styles from "./PredictionForm.module.css";

type PredictionFormProps = {
  matchId: string;
  existingPrediction?: Prediction;
  onCreated: (prediction: Prediction) => void;
  isMatchScheduled?: boolean;
};

function isValidScore(value: number) {
  return Number.isInteger(value) && value >= 0 && value <= 20;
}

export function PredictionForm({ matchId, existingPrediction, onCreated, isMatchScheduled = false }: PredictionFormProps) {
  const { isAuthenticated, token } = useAuth();
  const { t } = useLocale();
  const [createdPrediction, setCreatedPrediction] = useState<Prediction | undefined>();
  const [homeScore, setHomeScore] = useState("0");
  const [awayScore, setAwayScore] = useState("0");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const prediction = existingPrediction ?? createdPrediction;

  if (prediction) {
    return (
      <section className={`${styles.prediction} ${styles.locked}`}>
        <div className={styles.lockedHeader}>
          <span className={styles.check} aria-hidden="true">
            ✓
          </span>
          <h4>{t("myPrediction")}</h4>
        </div>
        <p className={styles.lockedScore}>
          {prediction.homeScore} - {prediction.awayScore}
        </p>
        <p className={styles.note}>{t("predictionLocked")}</p>
      </section>
    );
  }

  if (!isAuthenticated || !token) {
    return (
      <section className={styles.prediction}>
        <h4>{t("makePrediction")}</h4>
        <p className={styles.note}>{t("loginToPredict")}</p>
        <Link className={styles.loginLink} href="/login">
          {t("login")}
        </Link>
      </section>
    );
  }

  if (!isMatchScheduled) {
    return (
      <section className={styles.prediction}>
        <h4>{t("makePrediction")}</h4>
        <p className={styles.note}>{t("predictionsClosed")}</p>
      </section>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const normalizedHomeScore = Number(homeScore);
    const normalizedAwayScore = Number(awayScore);

    if (!isValidScore(normalizedHomeScore) || !isValidScore(normalizedAwayScore) || !token) {
      setError(t("invalidPredictionScore"));
      return;
    }

    setIsSubmitting(true);

    try {
      const predictionResponse = await createPrediction(
        {
          matchId,
          homeScore: normalizedHomeScore,
          awayScore: normalizedAwayScore,
        },
        token,
      );

      setCreatedPrediction(predictionResponse);
      setSuccess(t("predictionCreated"));
      onCreated(predictionResponse);
    } catch (predictionError) {
      if (predictionError instanceof ApiError && predictionError.status === 403) {
        setError(t("mustJoinTournamentFirst"));
      } else if (predictionError instanceof ApiError && predictionError.status === 409) {
        setError(t("predictionAlreadyExists"));
      } else {
        setError(predictionError instanceof Error ? predictionError.message : t("authError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.prediction}>
      <h4>{t("makePrediction")}</h4>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.scoreGrid}>
          <label>
            <span>{t("homeScore")}</span>
            <input
              type="number"
              min="0"
              max="20"
              inputMode="numeric"
              value={homeScore}
              onChange={(event) => setHomeScore(event.target.value)}
            />
          </label>
          <span className={styles.separator} aria-hidden="true">
            :
          </span>
          <label>
            <span>{t("awayScore")}</span>
            <input
              type="number"
              min="0"
              max="20"
              inputMode="numeric"
              value={awayScore}
              onChange={(event) => setAwayScore(event.target.value)}
            />
          </label>
        </div>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        {success ? <p className={styles.success}>{success}</p> : null}

        <button className={styles.submit} type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoadingSpinner size="sm" /> : null}
          <span>{t("savePrediction")}</span>
        </button>
      </form>
    </section>
  );
}
