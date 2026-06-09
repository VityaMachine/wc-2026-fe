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
  [key: string]: unknown;
};

export type CreatePredictionPayload = {
  matchId: string;
  homeScore: number;
  awayScore: number;
};
