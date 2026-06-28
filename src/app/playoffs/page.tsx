import { PlayoffsContent } from "@/components/playoffs/PlayoffsContent";
import { getPlayoffStage } from "@/lib/match-stage";
import { getMatches } from "@/services/matches.service";
import type { Match } from "@/types/match";

export const dynamic = "force-dynamic";

const FETCH_ALL_LIMIT = 100;

function getMatchTime(match: Match) {
  const timestamp = Date.parse(match.startTime ?? match.startsAt ?? match.kickoffAt ?? "");

  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

async function getAllMatches() {
  const matches: Match[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await getMatches({
      page,
      limit: FETCH_ALL_LIMIT,
    });

    matches.push(...response.items);
    totalPages = response.meta.totalPages;
    page += 1;
  } while (page <= totalPages);

  return matches;
}

export default async function PlayoffsPage() {
  let matches: Match[] = [];
  let error: string | undefined;

  try {
    matches = (await getAllMatches())
      .filter((match) => getPlayoffStage(match.stage))
      .sort((first, second) => getMatchTime(first) - getMatchTime(second));
  } catch (caughtError) {
    error = caughtError instanceof Error ? caughtError.message : "Could not load playoff matches.";
  }

  return <PlayoffsContent matches={matches} error={error} />;
}
