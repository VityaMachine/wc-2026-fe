import { apiGet } from "@/lib/api";
import type { Tournament } from "@/types/tournament";

export async function getTournaments() {
  return apiGet<Tournament[]>("/tournaments");
}

export async function getTournamentBySlug(slug: string) {
  return apiGet<Tournament>(`/tournaments/${slug}`);
}
