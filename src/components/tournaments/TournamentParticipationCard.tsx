"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/providers/AuthProvider";
import { useLocale } from "@/providers/LocaleProvider";
import { getTournamentParticipation, joinTournament } from "@/services/participation.service";
import type { ParticipantType, ParticipationStatus } from "@/types/participation";
import styles from "./TournamentParticipationCard.module.css";

type TournamentParticipationCardProps = {
  slug: string;
};

function ParticipationSkeletonBody() {
  return (
    <div className={styles.participationSkeleton} aria-hidden="true">
      <Skeleton className={styles.optionSkeleton} />
      <Skeleton className={styles.optionSkeleton} />
      <Skeleton className={styles.buttonSkeleton} />
    </div>
  );
}

export function TournamentParticipationCardSkeleton() {
  return (
    <section className={styles.card} aria-busy="true">
      <div className={styles.header}>
        <Skeleton className={styles.eyebrowSkeleton} />
        <Skeleton className={styles.headingSkeleton} />
        <Skeleton className={styles.copySkeleton} />
      </div>
      <ParticipationSkeletonBody />
    </section>
  );
}

const participantTypes: ParticipantType[] = ["FREE", "PAID"];

export function TournamentParticipationCard({ slug }: TournamentParticipationCardProps) {
  const { isAuthenticated, isLoading: isAuthLoading, token } = useAuth();
  const { t } = useLocale();
  const [participation, setParticipation] = useState<ParticipationStatus | null>(null);
  const [selectedType, setSelectedType] = useState<ParticipantType>("FREE");
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showPaymentExample, setShowPaymentExample] = useState(true);
  const [error, setError] = useState("");

  const loadParticipation = useCallback(async (currentToken: string) => {
    setIsLoading(true);
    setError("");

    try {
      const status = await getTournamentParticipation(slug, currentToken);
      setParticipation(status);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t("unableToLoadParticipation"));
    } finally {
      setIsLoading(false);
    }
  }, [slug, t]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      loadParticipation(token);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthenticated, loadParticipation, token]);

  async function handleJoin() {
    if (!token) {
      return;
    }

    setIsJoining(true);
    setError("");

    try {
      const status = await joinTournament(slug, { participationType: selectedType }, token);
      setParticipation(status);
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : t("unableToJoinTournament"));
    } finally {
      setIsJoining(false);
    }
  }

  const currentParticipationType = participation?.participationType ?? participation?.type ?? null;
  const isJoined = Boolean(participation?.isJoined || currentParticipationType);
  const isPaid = currentParticipationType === "PAID";
  const isPaymentConfirmed = participation?.paymentStatus === "PAID" || participation?.prizeEligible === true;

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>World Cup 2026</p>
        <h2>{t("joinContestTitle")}</h2>
        <p>{isAuthenticated ? t("joinContestAuthText") : t("joinContestGuestText")}</p>
      </div>

      {isAuthLoading ? <ParticipationSkeletonBody /> : null}

      {!isAuthLoading && !isAuthenticated ? (
        <Link className={styles.primaryLink} href="/login">
          {t("loginToJoin")}
        </Link>
      ) : null}

      {!isAuthLoading && isAuthenticated ? (
        <>
          {isLoading ? <ParticipationSkeletonBody /> : null}

          {error ? (
            <div className={styles.error} role="alert">
              <p>{error}</p>
              {token ? (
                <button type="button" onClick={() => loadParticipation(token)}>
                  {t("retry")}
                </button>
              ) : null}
            </div>
          ) : null}

          {!isLoading && isJoined && isPaid && isPaymentConfirmed ? (
            <div className={`${styles.joinedBox} ${styles.paidConfirmedBox}`}>
              <div className={styles.joinedHeader}>
                <span className={styles.freeIcon}>✓</span>
                <div>
                  <h3>{t("paidConfirmedTitle")}</h3>
                  <span className={`${styles.typeBadge} ${styles.freeBadge}`}>{t("paidTier")}</span>
                </div>
              </div>
              <p>{t("paidConfirmedMessage")}</p>
              <dl className={styles.statusList}>
                <div>
                  <dt>{t("participationType")}</dt>
                  <dd>{t("paidTier")}</dd>
                </div>
                <div>
                  <dt>{t("paymentStatus")}</dt>
                  <dd>{participation?.paymentStatus ?? "PAID"}</dd>
                </div>
                <div>
                  <dt>{t("prizePool")}</dt>
                  <dd>{t("eligible")}</dd>
                </div>
              </dl>
            </div>
          ) : null}

          {!isLoading && isJoined && isPaid && !isPaymentConfirmed ? (
            <div className={`${styles.joinedBox} ${styles.paidBox}`}>
              <div className={styles.joinedHeader}>
                <span className={styles.paidIcon}>!</span>
                <div>
                  <h3>{t("paidJoinedTitle")}</h3>
                  <span className={`${styles.typeBadge} ${styles.paidBadge}`}>{t("paidTier")}</span>
                </div>
              </div>
              <p>{t("paidJoinedMessage")}</p>
              <p className={styles.minimum}>{t("minimumPaymentAmount")}</p>
              <p className={styles.pendingNote}>{t("paidPendingNote")}</p>
              <div className={styles.warning}>
                <strong>{t("paidPaymentWarning")}</strong>
              </div>
              {participation?.paymentStatus ? (
                <dl className={styles.statusList}>
                  <div>
                    <dt>{t("paymentStatus")}</dt>
                    <dd>{participation.paymentStatus}</dd>
                  </div>
                </dl>
              ) : null}
              <a
                className={styles.monobankButton}
                href="https://send.monobank.ua/jar/7PBiVFSVHS"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("topUpMonobank")}
              </a>
              {showPaymentExample ? (
                <figure className={styles.paymentExample}>
                  {/* TODO: Add the real screenshot at public/images/monobank-payment-example.png when available. */}
                  <Image
                    src="/images/monobank-payment-example.png"
                    alt="Monobank payment comment example"
                    width={420}
                    height={640}
                    unoptimized
                    onError={() => setShowPaymentExample(false)}
                  />
                  <figcaption>{t("paymentExample")}</figcaption>
                </figure>
              ) : null}
            </div>
          ) : null}

          {!isLoading && isJoined && !isPaid ? (
            <div className={`${styles.joinedBox} ${styles.freeBox}`}>
              <div className={styles.joinedHeader}>
                <span className={styles.freeIcon}>✓</span>
                <div>
                  <h3>{t("freeJoinedTitle")}</h3>
                  <span className={`${styles.typeBadge} ${styles.freeBadge}`}>{t("freeTier")}</span>
                </div>
              </div>
              <p>{t("freeJoinedMessage")}</p>
            </div>
          ) : null}

          {!isLoading && !isJoined ? (
            <div className={styles.joinArea}>
              <div className={styles.options} role="radiogroup" aria-label={t("participationType")}>
                {participantTypes.map((type) => (
                  <button
                    key={type}
                    className={selectedType === type ? `${styles.option} ${styles.selected}` : styles.option}
                    type="button"
                    role="radio"
                    aria-checked={selectedType === type}
                    onClick={() => setSelectedType(type)}
                  >
                    <span className={styles.optionTitle}>{type === "FREE" ? t("freeTier") : t("paidTier")}</span>
                    <span>{type === "FREE" ? t("freeTierDescription") : t("paidTierDescription")}</span>
                  </button>
                ))}
              </div>
              <button className={styles.primaryButton} type="button" onClick={handleJoin} disabled={isJoining}>
                {isJoining ? t("joining") : selectedType === "FREE" ? t("joinFree") : t("joinPaid")}
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
