export type TournamentStatus = string;

export type Tournament = {
  id?: string | number;
  name?: string;
  slug?: string;
  year?: number;
  status?: TournamentStatus;
  createdAt?: string;
  updatedAt?: string;
};
