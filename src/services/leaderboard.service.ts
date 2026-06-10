import { apiGetAuth } from "@/lib/api";
import type { LeaderboardEntry, LeaderboardResponse } from "@/types/leaderboard";

type FlexibleLeaderboardResponse = LeaderboardEntry[] | LeaderboardResponse;

export function extractLeaderboardItems(response: FlexibleLeaderboardResponse): LeaderboardEntry[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  if (Array.isArray(response.entries)) {
    return response.entries;
  }

  if (Array.isArray(response.leaderboard)) {
    return response.leaderboard;
  }

  return [];
}

export async function getLeaderboard(token: string) {
  return apiGetAuth<FlexibleLeaderboardResponse>("/leaderboard", token);
}

export async function getPrizeLeaderboard(token: string) {
  return apiGetAuth<FlexibleLeaderboardResponse>("/leaderboard/prize", token);
}
