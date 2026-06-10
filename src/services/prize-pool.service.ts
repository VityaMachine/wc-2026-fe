import { apiGet } from "@/lib/api";
import type { PrizePool } from "@/types/prize-pool";

export async function getPrizePool(slug: string) {
  return apiGet<PrizePool>(`/tournaments/${slug}/prize-pool`);
}
