export type AuthUser = {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};
