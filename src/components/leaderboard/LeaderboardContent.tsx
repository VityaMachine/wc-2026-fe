"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/providers/AuthProvider";
import { useLocale } from "@/providers/LocaleProvider";
import { extractLeaderboardItems, getLeaderboard, getPrizeLeaderboard } from "@/services/leaderboard.service";
import { getTournamentParticipation } from "@/services/participation.service";
import { getPrizePool } from "@/services/prize-pool.service";
import type { LeaderboardEntry } from "@/types/leaderboard";
import type { PrizePool } from "@/types/prize-pool";
import { LeaderboardTable } from "./LeaderboardTable";
import styles from "./LeaderboardContent.module.css";

const TOURNAMENT_SLUG = "world-cup-2026";

type LoadState = "idle" | "loading" | "ready" | "not-joined" | "error";
type LeaderboardView = "overall" | "prize";

function LeaderboardSkeleton() {
  return (
    <section className={styles.leaderboard} aria-busy="true">
      <div className={styles.header}>
        <div>
          <Skeleton className={styles.titleSkeleton} />
          <Skeleton className={styles.subtitleSkeleton} />
        </div>
      </div>
      {[0, 1].map((section) => (
        <div className={styles.card} key={section}>
          <Skeleton className={styles.sectionTitleSkeleton} />
          <div className={styles.skeletonRows}>
            {[0, 1, 2].map((row) => (
              <Skeleton className={styles.rowSkeleton} key={row} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export function LeaderboardContent() {
  const { isAuthenticated, isLoading: isAuthLoading, token } = useAuth();
  const { t } = useLocale();
  const [state, setState] = useState<LoadState>("idle");
  const [overallEntries, setOverallEntries] = useState<LeaderboardEntry[]>([]);
  const [prizeEntries, setPrizeEntries] = useState<LeaderboardEntry[]>([]);
  const [prizePool, setPrizePool] = useState<PrizePool | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prizeError, setPrizeError] = useState<string | null>(null);
  const [prizePoolError, setPrizePoolError] = useState<string | null>(null);
  const [isPrizePoolLoading, setIsPrizePoolLoading] = useState(false);
  const [activeView, setActiveView] = useState<LeaderboardView>("overall");
  const prizeUserIds = new Set(prizeEntries.map((entry) => entry.userId).filter((userId): userId is string => Boolean(userId)));

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated || !token) {
      return;
    }

    let isMounted = true;

    async function loadLeaderboard(currentToken: string) {
      setState("loading");
      setError(null);
      setPrizeError(null);
      setPrizePool(null);
      setPrizePoolError(null);
      setIsPrizePoolLoading(false);

      try {
        const participation = await getTournamentParticipation(TOURNAMENT_SLUG, currentToken);

        if (!isMounted) {
          return;
        }

        const hasJoined =
          participation.joined === true ||
          participation.isJoined === true ||
          Boolean(participation.participationType) ||
          Boolean(participation.type);

        if (!hasJoined) {
          setOverallEntries([]);
          setPrizeEntries([]);
          setState("not-joined");
          return;
        }

        setIsPrizePoolLoading(true);
        void getPrizePool(TOURNAMENT_SLUG)
          .then((prizePoolResponse) => {
            if (!isMounted) {
              return;
            }

            setPrizePool(prizePoolResponse);
            setPrizePoolError(null);
          })
          .catch((loadPrizePoolError) => {
            if (!isMounted) {
              return;
            }

            setPrizePool(null);
            setPrizePoolError(
              loadPrizePoolError instanceof Error ? loadPrizePoolError.message : t("unableToLoadPrizePool"),
            );
          })
          .finally(() => {
            if (!isMounted) {
              return;
            }

            setIsPrizePoolLoading(false);
          });

        const leaderboardResponse = await getLeaderboard(currentToken);

        if (!isMounted) {
          return;
        }

        setOverallEntries(extractLeaderboardItems(leaderboardResponse));

        try {
          const prizeResponse = await getPrizeLeaderboard(currentToken);

          if (!isMounted) {
            return;
          }

          setPrizeEntries(extractLeaderboardItems(prizeResponse));
        } catch (loadPrizeError) {
          if (!isMounted) {
            return;
          }

          setPrizeEntries([]);
          setPrizeError(loadPrizeError instanceof Error ? loadPrizeError.message : t("unableToLoadLeaderboard"));
        }

        setState("ready");
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : t("unableToLoadLeaderboard"));
        setState("error");
      }
    }

    loadLeaderboard(token);

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, isAuthenticated, token, t]);

  if (isAuthLoading || state === "loading") {
    return <LeaderboardSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <section className={styles.leaderboard}>
        <div className={styles.header}>
          <div>
            <h1>{t("leaderboardTitle")}</h1>
            <p>{t("leaderboardSubtitle")}</p>
          </div>
        </div>
        <div className={styles.ctaCard}>
          <p>{t("loginToViewLeaderboard")}</p>
          <Link className={styles.ctaLink} href="/login">
            {t("loginRegister")}
          </Link>
        </div>
      </section>
    );
  }

  if (state === "not-joined") {
    return (
      <section className={styles.leaderboard}>
        <div className={styles.header}>
          <div>
            <h1>{t("leaderboardTitle")}</h1>
            <p>{t("leaderboardSubtitle")}</p>
          </div>
        </div>
        <div className={styles.ctaCard}>
          <p>{t("joinToViewLeaderboard")}</p>
          <Link className={styles.ctaLink} href="/">
            {t("joinContestTitle")}
          </Link>
        </div>
      </section>
    );
  }

  if (state === "error") {
    return (
      <section className={styles.leaderboard}>
        <div className={styles.header}>
          <div>
            <h1>{t("leaderboardTitle")}</h1>
            <p>{t("leaderboardSubtitle")}</p>
          </div>
        </div>
        <div className={styles.errorBox} role="alert">
          <h2>{t("unableToLoadLeaderboard")}</h2>
          {error ? <p>{error}</p> : null}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.leaderboard}>
      <div className={styles.header}>
        <div>
          <h1>{t("leaderboardTitle")}</h1>
          <p>{t("leaderboardSubtitle")}</p>
        </div>
        {prizePoolError ? (
          <p className={styles.prizePoolFallback}>{t("unableToLoadPrizePool")}</p>
        ) : isPrizePoolLoading ? (
          <div className={styles.prizePoolStats} aria-hidden="true">
            <Skeleton className={styles.prizePoolStatSkeleton} />
            <Skeleton className={styles.prizePoolStatSkeleton} />
          </div>
        ) : (
          <div className={styles.prizePoolStats}>
            <div>
              <span aria-hidden="true">🏆</span>
              <strong>
                <span className={styles.prizePoolLabel}>{t("prizePool")}:</span> {prizePool?.totalAmount ?? 0} грн
              </strong>
            </div>
            <div>
              <span aria-hidden="true">👥</span>
              <strong>
                <span className={styles.prizePoolLabel}>{t("paidUsersCount")}:</span>{" "}
                {prizePool?.paidUsersCount ?? 0}
              </strong>
            </div>
          </div>
        )}
      </div>

      <div className={styles.sections}>
        <div className={styles.switcher} role="tablist" aria-label={t("leaderboardTitle")}>
          <button
            className={
              activeView === "overall" ? `${styles.switcherButton} ${styles.switcherButtonActive}` : styles.switcherButton
            }
            type="button"
            role="tab"
            aria-selected={activeView === "overall"}
            onClick={() => setActiveView("overall")}
          >
            {t("overallLeaderboard")}
          </button>
          <button
            className={
              activeView === "prize" ? `${styles.switcherButton} ${styles.switcherButtonActive}` : styles.switcherButton
            }
            type="button"
            role="tab"
            aria-selected={activeView === "prize"}
            onClick={() => setActiveView("prize")}
          >
            {t("prizeLeaderboard")}
          </button>
        </div>

        <section className={styles.card}>
          <h2>{activeView === "overall" ? t("overallLeaderboard") : t("prizeLeaderboard")}</h2>
          {activeView === "overall" ? (
            <LeaderboardTable
              entries={overallEntries}
              emptyMessage={t("noLeaderboardEntries")}
              prizeUserIds={prizeUserIds}
              variant="overall"
            />
          ) : prizeError ? (
            <p className={styles.warning} role="status">
              {prizeError}
            </p>
          ) : (
            <LeaderboardTable
              entries={prizeEntries}
              emptyMessage={t("noLeaderboardEntries")}
              prizePoolAmount={prizePool?.totalAmount ?? 0}
              variant="prize"
            />
          )}
        </section>
      </div>
    </section>
  );
}
