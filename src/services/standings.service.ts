import { apiGet } from "@/lib/api";
import type { StandingsResponse } from "@/types/standings";

export async function getTournamentStandings(tournamentId: string) {
  return apiGet<StandingsResponse>(`/tournaments/${tournamentId}/standings`);
}
