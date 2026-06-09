import { StandingsContent } from "@/components/standings/StandingsContent";
import { getTournamentStandings } from "@/services/standings.service";
import { getTournamentBySlug } from "@/services/tournaments.service";
import type { StandingsResponse } from "@/types/standings";

export const dynamic = "force-dynamic";

const TOURNAMENT_SLUG = "world-cup-2026";

export default async function StandingsPage() {
  let standings: StandingsResponse | undefined;
  let error: string | undefined;

  try {
    const tournament = await getTournamentBySlug(TOURNAMENT_SLUG);

    if (!tournament.id) {
      throw new Error("Tournament id was not returned by the backend.");
    }

    standings = await getTournamentStandings(String(tournament.id));
  } catch (caughtError) {
    error = caughtError instanceof Error ? caughtError.message : "Could not load standings.";
  }

  return <StandingsContent standings={standings} error={error} />;
}
