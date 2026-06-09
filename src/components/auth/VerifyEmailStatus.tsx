"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Skeleton } from "@/components/ui/Skeleton";
import { verifyEmail } from "@/services/auth.service";
import { useLocale } from "@/providers/LocaleProvider";
import styles from "./VerifyEmailStatus.module.css";

export function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;
    const verificationToken = token;

    async function runVerification() {
      try {
        const response = await verifyEmail(verificationToken);
        if (isMounted) {
          setStatus("success");
          setMessage(response.message || t("emailVerifiedSuccessfully"));
        }
      } catch (error) {
        if (isMounted) {
          setStatus("error");
          setMessage(error instanceof Error ? error.message : t("emailVerificationFailed"));
        }
      }
    }

    runVerification();

    return () => {
      isMounted = false;
    };
  }, [t, token]);

  if (status === "loading") {
    return (
      <section className={styles.authPage} aria-busy="true">
        <div className={styles.authCard}>
          <div className={styles.loadingCard}>
            <span className={styles.loadingIcon}>
              <LoadingSpinner />
            </span>
            <Skeleton className={styles.loadingTitleSkeleton} />
            <Skeleton className={styles.loadingTextSkeleton} />
            <Skeleton className={styles.loadingNoticeSkeleton} />
          </div>
        </div>
      </section>
    );
  }

  const displayMessage = message || t("missingVerificationToken");

  return (
    <section className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.cardHeader}>
          <div className={styles.topline}>
            <p className={styles.eyebrow}>{t("authEyebrow")}</p>
            <span className={styles.badge}>{t("predictionContestBadge")}</span>
          </div>
          <span className={status === "success" ? styles.successIcon : status === "error" ? styles.errorIcon : styles.loadingIcon}>
            {status === "success" ? "✓" : status === "error" ? "!" : ""}
          </span>
          <h1>{status === "success" ? t("emailVerifiedSuccessfully") : t("emailVerificationFailed")}</h1>
          <p className={styles.subtitle}>{t("verifyEmailSubtitle")}</p>
        </div>
        <p className={status === "success" ? styles.success : status === "error" ? styles.error : styles.notice}>
          {displayMessage}
        </p>
        <Link className={styles.linkButton} href="/login">
          {t("goToLogin")}
        </Link>
      </div>
    </section>
  );
}
