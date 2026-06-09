import { apiGet } from "@/lib/api";
import type { Match } from "@/types/match";
import type { PaginatedResponse } from "@/types/pagination";

export type GetMatchesParams = {
  status?: string;
  stage?: string;
  groupName?: string;
  page?: number;
  limit?: number;
};

function normalizeMatch(match: Match): Match {
  return {
    ...match,
    startTime: match.startTime ?? match.startsAt ?? match.kickoffAt,
  };
}

export async function getMatches(params?: GetMatchesParams) {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, String(value));
      }
    });
  }

  const queryString = searchParams.toString();
  const response = await apiGet<Match[] | PaginatedResponse<Match>>(`/matches${queryString ? `?${queryString}` : ""}`);

  if (Array.isArray(response)) {
    const items = response.map(normalizeMatch);

    return {
      items,
      meta: {
        page: params?.page ?? 1,
        limit: params?.limit ?? items.length,
        total: items.length,
        totalPages: 1,
      },
    };
  }

  return {
    ...response,
    items: response.items.map(normalizeMatch),
  };
}
