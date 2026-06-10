type PredictionMatchTeam = {
  id: string;
  name: string;
  code?: string | null;
  logoUrl?: string | null;
};

type PredictionMatch = {
  id: string;
  status: string;
  stage?: string | null;
  groupName?: string | null;
  startTime?: string | null;
  kickoffAt?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam?: PredictionMatchTeam | null;
  awayTeam?: PredictionMatchTeam | null;
};

export type Prediction = {
  id: string;
  matchId: string;
  userId?: string;
  tournamentId?: string;
  homeScore: number;
  awayScore: number;
  points?: number;
  calculatedAt?: string | null;
  createdAt?: string;
  isExactScore?: boolean;
  isDrawGuessed?: boolean;
  isGoalDifferenceGuessed?: boolean;
  isWinnerGuessed?: boolean;
  isTotalGoalsGuessed?: boolean;
  match?: PredictionMatch | null;
  [key: string]: unknown;
};

export type CreatePredictionPayload = {
  matchId: string;
  homeScore: number;
  awayScore: number;
};
