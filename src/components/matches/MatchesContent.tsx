"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/common/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/providers/AuthProvider";
import { useLocale } from "@/providers/LocaleProvider";
import { getMyPredictions } from "@/services/predictions.service";
import type { Match } from "@/types/match";
import type { PaginationMeta } from "@/types/pagination";
import type { Prediction } from "@/types/prediction";
import { MatchCard } from "./MatchCard";
import styles from "./MatchesContent.module.css";

export type MatchFilters = {
  status: string;
  stage: string;
  groupName: string;
  page: number;
  limit: number;
};

type MatchesContentProps = {
  matches: Match[];
  meta: PaginationMeta;
  filters: MatchFilters;
  error?: string;
};

const STATUS_OPTIONS = ["SCHEDULED", "LIVE", "FINISHED"];
const STAGE_OPTIONS = ["GROUP", "ROUND_OF_32", "ROUND_OF_16", "QUARTER_FINAL", "SEMI_FINAL", "THIRD_PLACE", "FINAL"];
const GROUP_OPTIONS = Array.from({ length: 12 }, (_, index) => `Group ${String.fromCharCode(65 + index)}`);

function formatStageLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function buildMatchesHref(filters: MatchFilters, overrides: Partial<MatchFilters>) {
  const nextFilters = {
    ...filters,
    ...overrides,
  };
  const searchParams = new URLSearchParams();

  if (nextFilters.status) {
    searchParams.set("status", nextFilters.status);
  }

  if (nextFilters.stage) {
    searchParams.set("stage", nextFilters.stage);
  }

  if (nextFilters.groupName) {
    searchParams.set("groupName", nextFilters.groupName);
  }

  searchParams.set("page", String(nextFilters.page));
  searchParams.set("limit", String(nextFilters.limit));

  return `/matches?${searchParams.toString()}`;
}

export function MatchesContent({ matches, meta, filters, error }: MatchesContentProps) {
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [arePredictionsLoading, setArePredictionsLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const { t } = useLocale();
  const activeFiltersCount = [filters.status, filters.stage, filters.groupName].filter(Boolean).length;
  const filterToggleLabel = activeFiltersCount > 0 ? `${t("filters")} · ${activeFiltersCount}` : t("filters");
  const predictionsByMatchId = useMemo(
    () => {
      const visiblePredictions = isAuthenticated && token ? predictions : [];

      return new Map(visiblePredictions.map((prediction) => [String(prediction.matchId), prediction]));
    },
    [isAuthenticated, predictions, token],
  );

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    let isMounted = true;
    const authToken = token;

    async function loadPredictions() {
      setArePredictionsLoading(true);

      try {
        const myPredictions = await getMyPredictions(authToken);

        if (isMounted) {
          setPredictions(myPredictions);
        }
      } catch {
        if (isMounted) {
          setPredictions([]);
        }
      } finally {
        if (isMounted) {
          setArePredictionsLoading(false);
        }
      }
    }

    loadPredictions();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, token]);

  function updateFilter(key: "status" | "stage" | "groupName", value: string) {
    router.push(
      buildMatchesHref(filters, {
        [key]: value,
        page: 1,
      }),
    );
  }

  function handlePredictionCreated(prediction: Prediction) {
    setPredictions((currentPredictions) => {
      const nextPredictions = currentPredictions.filter(
        (currentPrediction) => String(currentPrediction.matchId) !== String(prediction.matchId),
      );

      return [...nextPredictions, prediction];
    });
  }

  return (
    <section className={styles.matches}>
      <div className={styles.header}>
        <div>
          <h1>{t("matchesTitle")}</h1>
          <p>{t("matchesSubtitle")}</p>
        </div>
        <div className={styles.count}>
          <span>{t("matchesCount")}</span>
          <strong>{meta.total}</strong>
        </div>
      </div>

      {error ? (
        <div className={styles.errorBox} role="alert">
          <h2>{t("unableToLoadMatches")}</h2>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <button
            className={styles.mobileFilterToggle}
            type="button"
            aria-expanded={areFiltersOpen}
            aria-controls="matches-filters-panel"
            onClick={() => setAreFiltersOpen((current) => !current)}
          >
            <span>{filterToggleLabel}</span>
            <span aria-hidden="true">{areFiltersOpen ? "↑" : "↓"}</span>
          </button>

          <section
            className={`${styles.filters} ${areFiltersOpen ? styles.filtersOpen : ""}`}
            id="matches-filters-panel"
            aria-label={t("filters")}
          >
            <h2>{t("filters")}</h2>
            <label>
              <span>{t("statusFilter")}</span>
              <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
                <option value="">{t("all")}</option>
                {STATUS_OPTIONS.map((status) => (
                  <option value={status} key={status}>
                    {status === "SCHEDULED" ? t("scheduled") : status === "LIVE" ? t("live") : t("finished")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t("stageFilter")}</span>
              <select value={filters.stage} onChange={(event) => updateFilter("stage", event.target.value)}>
                <option value="">{t("all")}</option>
                {STAGE_OPTIONS.map((stage) => (
                  <option value={stage} key={stage}>
                    {formatStageLabel(stage)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t("groupFilter")}</span>
              <select value={filters.groupName} onChange={(event) => updateFilter("groupName", event.target.value)}>
                <option value="">{t("all")}</option>
                {GROUP_OPTIONS.map((groupName) => (
                  <option value={groupName} key={groupName}>
                    {groupName}
                  </option>
                ))}
              </select>
            </label>
          </section>

          {isAuthenticated && token && arePredictionsLoading ? (
            <div className={styles.predictionsLoading} aria-live="polite">
              <Skeleton className={styles.predictionsLoadingSkeleton} />
              <span>{t("loadingPredictions")}</span>
            </div>
          ) : null}

          <div className={styles.list}>
            {matches.map((match, index) => (
              <MatchCard
                match={match}
                existingPrediction={match.id != null ? predictionsByMatchId.get(String(match.id)) : undefined}
                isAuthenticated={Boolean(isAuthenticated && token)}
                onPredictionCreated={handlePredictionCreated}
                key={match.id ?? index}
              />
            ))}
          </div>

          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            buildHref={(page) => buildMatchesHref(filters, { page })}
            labels={{
              previous: t("previous"),
              next: t("next"),
              page: t("page"),
              of: t("of"),
            }}
          />
        </>
      )}
    </section>
  );
}
