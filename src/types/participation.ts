export type ParticipantType = "FREE" | "PAID";

export type ParticipationStatus = {
  isJoined?: boolean;
  participationType?: ParticipantType | null;
  type?: ParticipantType | null;
  paymentStatus?: string | null;
  prizeEligible?: boolean;
  joinedAt?: string | null;
  message?: string;
};

export type JoinTournamentPayload = {
  participationType: ParticipantType;
};
