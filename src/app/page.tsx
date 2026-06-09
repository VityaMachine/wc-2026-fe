import { getTournaments } from "@/services/tournaments.service";
import { HomeContent } from "@/components/home/HomeContent";
import type { Tournament } from "@/types/tournament";

export const dynamic = "force-dynamic";

export default async function Home() {
  let tournaments: Tournament[] = [];
  let error: string | undefined;

  try {
    tournaments = await getTournaments();
  } catch (caughtError) {
    error = caughtError instanceof Error ? caughtError.message : "Could not load tournaments.";
  }

  return <HomeContent tournaments={tournaments} error={error} />;
}
