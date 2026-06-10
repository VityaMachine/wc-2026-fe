"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useLocale } from "@/providers/LocaleProvider";
import { forgotPassword } from "@/services/auth.service";
import styles from "./RegisterForm.module.css";

export function ForgotPasswordForm() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email) {
      setError(t("requiredField"));
      return;
    }

    setIsSubmitting(true);

    try {
      await forgotPassword({ email });
      setIsSuccess(true);
    } catch (forgotError) {
      setError(forgotError instanceof Error ? forgotError.message : t("forgotPasswordFailed"));
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
            <h1>{t("forgotPasswordSuccessTitle")}</h1>
          </div>
          <p className={styles.success}>{t("forgotPasswordSuccessMessage")}</p>
          <Link className={styles.linkButton} href="/login">
            {t("goToLogin")}
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
          <h1>{t("forgotPasswordTitle")}</h1>
          <p className={styles.subtitle}>{t("forgotPasswordSubtitle")}</p>
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

        <button className={styles.submit} type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoadingSpinner size="sm" /> : null}
          <span>{t("sendPasswordResetInstructions")}</span>
        </button>

        <p className={styles.switchText}>
          <Link href="/login">{t("goToLogin")}</Link>
        </p>
      </form>
    </section>
  );
}
