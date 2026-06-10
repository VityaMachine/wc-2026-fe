export type ParticipantPrediction = {
  id: string;
  matchId: string;
  userId: string;
  username: string;
  displayName?: string | null;
  homeScore: number;
  awayScore: number;
  points: number | null;
  isExactScore: boolean;
  isDrawGuessed: boolean;
  isGoalDifferenceGuessed: boolean;
  isWinnerGuessed: boolean;
  isTotalGoalsGuessed: boolean;
  calculatedAt: string | null;
  createdAt: string;
};

export type ParticipantsPredictionsResponse = {
  canViewPredictions: boolean;
  hasOwnPrediction: boolean;
  predictions: ParticipantPrediction[];
};
