"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useLocale } from "@/providers/LocaleProvider";
import { resetPassword } from "@/services/auth.service";
import styles from "./RegisterForm.module.css";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(token ? "" : t("missingResetPasswordToken"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError(t("missingResetPasswordToken"));
      return;
    }

    if (!password || !confirmPassword) {
      setError(t("requiredField"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({ token, password });
      setIsSuccess(true);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : t("resetPasswordFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <section className={styles.authPage}>
        <div className={styles.authCard}>
          <div className={styles.statusHeader}>
            <span className={styles.statusIcon}>✓</span>
            <p className={styles.eyebrow}>{t("authEyebrow")}</p>
            <h1>{t("resetPasswordSuccessTitle")}</h1>
          </div>
          <p className={styles.success}>{t("resetPasswordSuccessMessage")}</p>
          <Link className={styles.linkButton} href="/login">
            {t("login")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.authPage}>
      <form className={styles.authCard} onSubmit={handleSubmit}>
        <div className={styles.cardHeader}>
          <div className={styles.topline}>
            <p className={styles.eyebrow}>{t("authEyebrow")}</p>
            <span className={styles.badge}>{t("predictionContestBadge")}</span>
          </div>
          <h1>{t("resetPasswordTitle")}</h1>
          <p className={styles.subtitle}>{t("resetPasswordSubtitle")}</p>
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}

        <label className={styles.field}>
          <span>{t("newPassword")}</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={!token}
          />
        </label>

        <label className={styles.field}>
          <span>{t("confirmPassword")}</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            disabled={!token}
          />
        </label>

        <button className={styles.submit} type="submit" disabled={isSubmitting || !token}>
          {isSubmitting ? <LoadingSpinner size="sm" /> : null}
          <span>{t("resetPasswordSubmit")}</span>
        </button>

        <p className={styles.switchText}>
          <Link href="/login">{t("goToLogin")}</Link>
        </p>
      </form>
    </section>
  );
}
