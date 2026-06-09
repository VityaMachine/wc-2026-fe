"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { getMe, login, register } from "@/services/auth.service";
import type { AuthUser, LoginPayload, RegisterPayload } from "@/types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginUser: (payload: LoginPayload) => Promise<void>;
  registerUser: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreAuth() {
      const savedToken = window.localStorage.getItem(STORAGE_KEYS.authToken);

      if (!savedToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await getMe(savedToken);
        if (isMounted) {
          setToken(savedToken);
          setUser(currentUser);
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEYS.authToken);
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  async function loginUser(payload: LoginPayload) {
    const response = await login(payload);
    window.localStorage.setItem(STORAGE_KEYS.authToken, response.accessToken);
    setToken(response.accessToken);
    setUser(response.user);
  }

  async function registerUser(payload: RegisterPayload) {
    const response = await register(payload);
    if (response.accessToken) {
      window.localStorage.setItem(STORAGE_KEYS.authToken, response.accessToken);
      setToken(response.accessToken);
      setUser(response.user);
    }
  }

  function logout() {
    window.localStorage.removeItem(STORAGE_KEYS.authToken);
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      loginUser,
      registerUser,
      logout,
    }),
    [isLoading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
