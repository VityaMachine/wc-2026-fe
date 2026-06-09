export type StandingTeam = {
  id: string;
  externalId?: number | null;
  name: string;
  code?: string | null;
  logoUrl?: string | null;
};

export type StandingRow = {
  position: number;
  team: StandingTeam;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  isQualified?: boolean;
  qualificationStatus?: string | null;
};

export type StandingsGroup = {
  groupName: string;
  teams: StandingRow[];
};

export type StandingsResponse = {
  tournamentId: string;
  groups: StandingsGroup[];
};
