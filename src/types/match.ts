import type { Team } from "./team";

export type Match = {
  id?: string | number;
  tournamentId?: string | number;
  stage?: string | null;
  status?: string;
  elapsed?: number | null;
  groupName?: string | null;
  startTime?: string;
  startsAt?: string;
  kickoffAt?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam?: Team | null;
  awayTeam?: Team | null;
};
