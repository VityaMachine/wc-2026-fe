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

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getPositiveNumber(value: string | string[] | undefined, fallback: number) {
  const parsed = Number(getSingleParam(value));

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export default async function MatchesPage({ searchParams }: MatchesPageProps) {
  const params = await searchParams;
  const page = getPositiveNumber(params.page, DEFAULT_PAGE);
  const limit = getPositiveNumber(params.limit, DEFAULT_LIMIT);
  const filters: MatchFilters = {
    status: getSingleParam(params.status) || "",
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
    const response = await getMatches({
      status: filters.status,
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
