import { apiGetAuth } from "@/lib/api";
import type { ParticipantsPredictionsResponse } from "@/types/participants-predictions";

export async function getParticipantsPredictions(matchId: string, token: string) {
  return apiGetAuth<ParticipantsPredictionsResponse>(`/matches/${matchId}/predictions`, token);
}
