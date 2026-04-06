"use client";
import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { api } from "@/lib/api";
import {
  ensurePushSubscription,
  getCurrentPushEndpoint,
} from "@/lib/push-notifications";
import {
  clearSession,
  setSession,
  signalSessionActive,
  getRefreshToken,
} from "@/lib/session";
import { queryKeys } from "@/lib/query-keys";
import { hydrateSessionUserFromToken, SessionUser } from "@/hooks";
import { isInvalidSessionError, useSessionValidation } from "@/hooks";
import { useSessionSync } from "@/hooks";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type User = SessionUser;

// ---------------------------------------------------------------------------
// AuthContext
// ---------------------------------------------------------------------------

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isHydrating: boolean;
  isValidating: boolean;
  isAuthenticated: boolean;
  isSuperAdminRole: boolean;
  hasAdminAccess: boolean;
  login: (
    identifier: string,
    password: string,
    rememberMe: boolean,
  ) => Promise<void>;
  signup: (
    name: string,
    email: string,
    username: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();

  const { data: user, isLoading: isHydrating } = useQuery<User | null>({
    queryKey: queryKeys.authSession,
    queryFn: async () => {
      // Fast path: tokens already in localStorage from a previous login.
      const cached = hydrateSessionUserFromToken();
      if (cached) return cached;

      // Slow path: try a silent refresh using the stored refresh token.
      const refreshToken = getRefreshToken();
      if (!refreshToken) return null;

      try {
        const res = await axios.post<{
          user: User;
          accessToken: string;
          refreshToken: string;
        }>(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken },
        );
        const { user, accessToken, refreshToken: newRefreshToken } = res.data;
        setSession(user, accessToken, newRefreshToken);
        return user;
      } catch {
        clearSession();
        return null;
      }
    },
    staleTime: 60_000,
  });

  const validationQuery = useSessionValidation(Boolean(user));

  useEffect(() => {
    if (validationQuery.error && isInvalidSessionError(validationQuery.error)) {
      clearSession();
      qc.setQueryData(queryKeys.authSession, null);
      qc.removeQueries({ queryKey: queryKeys.onboardingStatus });
    }
  }, [validationQuery.error, qc]);

  useSessionSync(
    useCallback(() => {
      const sessionUser = hydrateSessionUserFromToken();
      qc.setQueryData(queryKeys.authSession, sessionUser);
      qc.invalidateQueries({
        queryKey: [...queryKeys.authSession, "validation"],
      });
      if (!sessionUser) {
        qc.removeQueries({ queryKey: queryKeys.onboardingStatus });
      }
    }, [qc]),
  );

  // Only block on the initial validation (no cache). Background refetches
  // should not show the auth spinner — the user is already confirmed via JWT.
  const isValidating = Boolean(user) && validationQuery.isLoading;
  const isAuthenticated = Boolean(user);
  const isLoading = isHydrating || isValidating;
  const isSuperAdminRole = user?.role === "super_admin";
  const hasAdminAccess = user?.role === "super_admin";

  const loginMutation = useMutation({
    mutationFn: async ({
      identifier,
      password,
      rememberMe,
    }: {
      identifier: string;
      password: string;
      rememberMe: boolean;
    }) => {
      const pushEndpoint = await getCurrentPushEndpoint();

      const res = await api.post<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>("/auth/login", {
        identifier,
        password,
        rememberMe,
        endpoint: pushEndpoint ?? undefined,
      });

      const { user, accessToken, refreshToken } = res.data;
      setSession(user, accessToken, refreshToken);
      signalSessionActive();
      return user;
    },
    onSuccess: async (user) => {
      qc.setQueryData(queryKeys.authSession, user);
      await qc.invalidateQueries({
        queryKey: [...queryKeys.authSession, "validation"],
      });
      await ensurePushSubscription({ promptForPermission: true });
    },
  });

  const login = useCallback(
    (identifier: string, password: string, rememberMe: boolean) =>
      loginMutation
        .mutateAsync({
          identifier: identifier.trim().toLowerCase(),
          password,
          rememberMe,
        })
        .then(() => undefined),
    [loginMutation],
  );

  const signupMutation = useMutation({
    mutationFn: async ({
      name,
      email,
      username,
      password,
    }: {
      name: string;
      email: string;
      username: string;
      password: string;
    }) => {
      const res = await api.post<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>("/auth/signup", {
        name,
        email,
        username,
        password,
      });

      const { user, accessToken, refreshToken } = res.data;
      setSession(user, accessToken, refreshToken);
      signalSessionActive();
      return {
        ...user,
        name: user.name || name,
        username: user.username || username,
        email: user.email || email,
      } as User;
    },
    onSuccess: (user) => {
      qc.setQueryData(queryKeys.authSession, user);
      qc.invalidateQueries({
        queryKey: [...queryKeys.authSession, "validation"],
      });
    },
  });

  const signup = useCallback(
    (name: string, email: string, username: string, password: string) =>
      signupMutation
        .mutateAsync({
          name,
          email: email.trim().toLowerCase(),
          username: username.trim().toLowerCase(),
          password,
        })
        .then(() => undefined),
    [signupMutation],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Proceed even if the request fails
    }
    clearSession();
    qc.setQueryData(queryKeys.authSession, null);
    qc.removeQueries({ queryKey: queryKeys.onboardingStatus });
    qc.invalidateQueries({ queryKey: queryKeys.authSession });
  }, [qc]);

  const updateSession = useCallback(() => {
    const sessionUser = hydrateSessionUserFromToken();
    if (sessionUser) {
      qc.setQueryData(queryKeys.authSession, sessionUser);
    }
    qc.invalidateQueries({
      queryKey: [...queryKeys.authSession, "validation"],
    });
  }, [qc]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isHydrating,
        isValidating,
        isAuthenticated,
        isSuperAdminRole,
        hasAdminAccess,
        login,
        signup,
        logout,
        updateSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
