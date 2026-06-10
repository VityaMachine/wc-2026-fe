import { apiGet, apiGetAuth, apiPost } from "@/lib/api";
import type {
  AuthResponse,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from "@/types/auth";

type AuthResponseBody = AuthResponse & {
  token?: string;
};

type MeResponseBody =
  | AuthUser
  | {
      user: AuthUser;
    };

function mapAuthResponse(response: AuthResponseBody): AuthResponse {
  return {
    accessToken: response.accessToken ?? response.token ?? "",
    user: response.user,
  };
}

function mapMeResponse(response: MeResponseBody): AuthUser {
  if ("user" in response) {
    return response.user;
  }

  return response;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await apiPost<AuthResponseBody, RegisterPayload>("/auth/register", payload);
  return mapAuthResponse(response);
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiPost<AuthResponseBody, LoginPayload>("/auth/login", payload);
  return mapAuthResponse(response);
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<{ message?: string }> {
  return apiPost<{ message?: string }, ForgotPasswordPayload>("/auth/forgot-password", payload);
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<{ message?: string }> {
  return apiPost<{ message?: string }, ResetPasswordPayload>("/auth/reset-password", payload);
}

export async function getMe(token: string): Promise<AuthUser> {
  const response = await apiGetAuth<MeResponseBody>("/auth/me", token);
  return mapMeResponse(response);
}

export async function verifyEmail(token: string): Promise<{ message?: string }> {
  return apiGet<{ message?: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`);
}
