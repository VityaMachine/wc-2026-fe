"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useAuth } from "@/providers/AuthProvider";
import { useLocale } from "@/providers/LocaleProvider";
import { getTournamentParticipation } from "@/services/participation.service";
import type { ParticipationStatus } from "@/types/participation";
import styles from "./LoginForm.module.css";

const TOURNAMENT_SLUG = "world-cup-2026";

function hasJoinedTournament(participation: ParticipationStatus) {
  return (
    participation.joined === true ||
    participation.isJoined === true ||
    Boolean(participation.participationType) ||
    Boolean(participation.type)
  );
}

export function LoginForm() {
  const router = useRouter();
  const { loginUser } = useAuth();
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t("requiredField"));
      return;
    }

    setIsSubmitting(true);

    try {
      await loginUser({ email, password });
      const token = window.localStorage.getItem(STORAGE_KEYS.authToken);

      if (!token) {
        router.push("/");
        return;
      }

      try {
        const participation = await getTournamentParticipation(TOURNAMENT_SLUG, token);
        router.push(hasJoinedTournament(participation) ? "/matches" : "/");
      } catch {
        router.push("/");
      }
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : t("authError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.authPage}>
      <form className={styles.authCard} onSubmit={handleSubmit}>
        <div className={styles.cardHeader}>
          <div className={styles.topline}>
            <p className={styles.eyebrow}>{t("authEyebrow")}</p>
            <span className={styles.badge}>{t("predictionContestBadge")}</span>
          </div>
          <h1>{t("loginTitle")}</h1>
          <p className={styles.subtitle}>{t("loginSubtitle")}</p>
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}

        <label className={styles.field}>
          <span>{t("email")}</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>{t("password")}</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <button className={styles.submit} type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoadingSpinner size="sm" /> : null}
          <span>{t("login")}</span>
        </button>

        <Link className={styles.forgotPassword} href="/forgot-password">
          {t("forgotPasswordLink")}
        </Link>

        <p className={styles.switchText}>
          {t("dontHaveAccount")} <Link href="/register">{t("register")}</Link>
        </p>
      </form>
    </section>
  );
}
