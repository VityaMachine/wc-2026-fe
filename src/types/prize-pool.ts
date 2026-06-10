export type PrizePoolPayment = {
  username?: string;
  email?: string;
  amount?: number;
  paidAt?: string;
};

export type PrizePool = {
  tournamentId?: string;
  totalAmount?: number;
  paidUsersCount?: number;
  payments?: PrizePoolPayment[];
};
