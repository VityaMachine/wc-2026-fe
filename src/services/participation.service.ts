import { apiGetAuth, apiPostAuth } from "@/lib/api";
import type { JoinTournamentPayload, ParticipationStatus } from "@/types/participation";

type ParticipationResponse =
  | ParticipationStatus
  | {
      participation: ParticipationStatus;
    }
  | {
      data: ParticipationStatus;
    };

function mapParticipationResponse(response: ParticipationResponse): ParticipationStatus {
  if ("participation" in response) {
    return response.participation;
  }

  if ("data" in response) {
    return response.data;
  }

  return response;
}

export async function getTournamentParticipation(slug: string, token: string): Promise<ParticipationStatus> {
  const response = await apiGetAuth<ParticipationResponse>(`/tournaments/${slug}/participation`, token);
  return mapParticipationResponse(response);
}

export async function joinTournament(
  slug: string,
  payload: JoinTournamentPayload,
  token: string,
): Promise<ParticipationStatus> {
  const response = await apiPostAuth<ParticipationResponse, JoinTournamentPayload>(
    `/tournaments/${slug}/join`,
    payload,
    token,
  );
  return mapParticipationResponse(response);
}
