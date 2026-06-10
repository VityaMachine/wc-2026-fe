export type LeaderboardEntry = {
  userId?: string;
  username?: string;
  displayName?: string | null;
  email?: string;
  points?: number;
  totalPoints?: number;
  predictionsCount?: number;
  exactScoreCount?: number;
  drawGuessedCount?: number;
  goalDifferenceGuessedCount?: number;
  winnerGuessedCount?: number;
  totalGoalsGuessedCount?: number;
  correctScores?: number;
  correctResults?: number;
  participantType?: "FREE" | "PAID";
  type?: "FREE" | "PAID";
  paymentStatus?: string | null;
  prizeEligible?: boolean;
  rank?: number;
};

export type LeaderboardResponse = {
  items?: LeaderboardEntry[];
  entries?: LeaderboardEntry[];
  leaderboard?: LeaderboardEntry[];
};
