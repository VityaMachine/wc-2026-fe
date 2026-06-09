"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/providers/AuthProvider";
import { useLocale } from "@/providers/LocaleProvider";
import styles from "./RegisterForm.module.css";

export function RegisterForm() {
  const { registerUser } = useAuth();
  const { t } = useLocale();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      setError(t("requiredField"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({ firstName, lastName, username, email, password });
      setIsSuccess(true);
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : t("authError"));
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
            <h1>{t("registrationSuccess")}</h1>
          </div>
          <p className={styles.success}>{t("checkEmailToVerify")}</p>
          <p className={styles.notice}>{t("verifyEmailNotice")}</p>
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
          <h1>{t("registerTitle")}</h1>
          <p className={styles.subtitle}>{t("registerSubtitle")}</p>
        </div>
        <p className={styles.notice}>{t("verifyEmailNotice")}</p>

        {error ? <p className={styles.error}>{error}</p> : null}

        <label className={styles.field}>
          <span>{t("firstName")}</span>
          <input
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>{t("lastName")}</span>
          <input
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>{t("username")}</span>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>

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
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
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
          />
        </label>

        <button className={styles.submit} type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoadingSpinner size="sm" /> : null}
          <span>{t("register")}</span>
        </button>

        <p className={styles.switchText}>
          {t("alreadyHaveAccount")} <Link href="/login">{t("login")}</Link>
        </p>
      </form>
    </section>
  );
}
