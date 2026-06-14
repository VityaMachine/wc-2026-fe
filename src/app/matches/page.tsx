import { MatchesContent, type MatchFilters } from "@/components/matches/MatchesContent";
import { getMatches } from "@/services/matches.service";
import type { Match } from "@/types/match";
import type { PaginationMeta } from "@/types/pagination";

export const dynamic = "force-dynamic";

type MatchesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const DEFAULT_STATUS_FILTER = "not_finished";
const ALL_STATUS_FILTER = "all";
const NOT_FINISHED_STATUSES = ["LIVE", "SCHEDULED"];
const FETCH_ALL_LIMIT = 100;

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getPositiveNumber(value: string | string[] | undefined, fallback: number) {
  const parsed = Number(getSingleParam(value));

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getMatchTime(match: Match) {
  const timestamp = Date.parse(match.startTime ?? match.startsAt ?? match.kickoffAt ?? "");

  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

function sortNotFinishedMatches(matches: Match[]) {
  return [...matches].sort((first, second) => {
    const firstStatus = first.status?.toUpperCase();
    const secondStatus = second.status?.toUpperCase();

    if (firstStatus !== secondStatus) {
      if (firstStatus === "LIVE") {
        return -1;
      }

      if (secondStatus === "LIVE") {
        return 1;
      }
    }

    return getMatchTime(first) - getMatchTime(second);
  });
}

function paginateMatches(matches: Match[], page: number, limit: number) {
  const total = matches.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const normalizedPage = Math.min(page, totalPages);
  const startIndex = (normalizedPage - 1) * limit;

  return {
    items: matches.slice(startIndex, startIndex + limit),
    meta: {
      page: normalizedPage,
      limit,
      total,
      totalPages,
    },
  };
}

async function getAllMatchesForStatus(status: string, filters: MatchFilters) {
  const matches: Match[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await getMatches({
      status,
      stage: filters.stage,
      groupName: filters.groupName,
      page,
      limit: FETCH_ALL_LIMIT,
    });

    matches.push(...response.items);
    totalPages = response.meta.totalPages;
    page += 1;
  } while (page <= totalPages);

  return matches;
}

async function getNotFinishedMatches(filters: MatchFilters) {
  const matchesById = new Map<string, Match>();
  const matchesWithoutId: Match[] = [];
  const responses = await Promise.all(NOT_FINISHED_STATUSES.map((status) => getAllMatchesForStatus(status, filters)));

  responses.flat().forEach((match) => {
    if (match.id == null) {
      matchesWithoutId.push(match);
      return;
    }

    matchesById.set(String(match.id), match);
  });

  return sortNotFinishedMatches([...matchesById.values(), ...matchesWithoutId]);
}

export default async function MatchesPage({ searchParams }: MatchesPageProps) {
  const params = await searchParams;
  const page = getPositiveNumber(params.page, DEFAULT_PAGE);
  const limit = getPositiveNumber(params.limit, DEFAULT_LIMIT);
  const statusFilter = getSingleParam(params.status) || DEFAULT_STATUS_FILTER;
  const filters: MatchFilters = {
    status: statusFilter,
    stage: getSingleParam(params.stage) || "",
    groupName: getSingleParam(params.groupName) || "",
    page,
    limit,
  };
  let matches: Match[] = [];
  let meta: PaginationMeta = {
    page,
    limit,
    total: 0,
    totalPages: 1,
  };
  let error: string | undefined;

  try {
    const response =
      filters.status === DEFAULT_STATUS_FILTER
        ? paginateMatches(await getNotFinishedMatches(filters), page, limit)
        : await getMatches({
            status: filters.status === ALL_STATUS_FILTER ? "" : filters.status,
            stage: filters.stage,
            groupName: filters.groupName,
            page,
            limit,
          });

    matches = response.items;
    meta = response.meta;
  } catch (caughtError) {
    error = caughtError instanceof Error ? caughtError.message : "Could not load matches.";
  }

  return <MatchesContent matches={matches} meta={meta} filters={filters} error={error} />;
}
