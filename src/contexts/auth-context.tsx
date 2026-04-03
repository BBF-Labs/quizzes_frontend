"use client";
import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  ensurePushSubscription,
  getCurrentPushEndpoint,
} from "@/lib/push-notifications";
import { clearSession, setSession, getRefreshToken } from "@/lib/session";
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
  logout: () => void;
  updateSession: (accessToken: string, refreshToken?: string) => void;
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
      const user = hydrateSessionUserFromToken();
      if (user) return user;

      // Access token expired but refresh token may still be valid — try silently.
      const refreshToken = getRefreshToken();
      if (!refreshToken) return null;

      try {
        const res = await api.post("/auth/refresh", { refreshToken });
        const resData = res.data?.data ?? res.data;
        const newToken = resData?.accessToken;
        if (newToken) {
          setSession({ accessToken: newToken });
          return hydrateSessionUserFromToken();
        }
      } catch {
        clearSession();
      }
      return null;
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

  const isValidating =
    Boolean(user) && (validationQuery.isLoading || validationQuery.isFetching);
  const isAuthenticated = Boolean(user);
  const isLoading = isHydrating || isValidating;
  const isSuperAdminRole = user?.role === "super_admin";
  const hasAdminAccess = user?.role === "super_admin"; //restrict to super admin for now
  // user?.role === "super_admin" ||
  // user?.role === "creator" ||
  // user?.role === "moderator";

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

      const res = await api.post("/auth/login", {
        identifier,
        password,
        rememberMe,
        endpoint: pushEndpoint ?? undefined,
      });

      const resData = res.data?.data ?? res.data;
      const accessToken: string = resData?.accessToken;
      const refreshToken: string = resData?.refreshToken;

      if (!accessToken) throw new Error("No access token returned from login");

      setSession(
        {
          accessToken,
          refreshToken: refreshToken ?? null,
        },
        { persist: rememberMe },
      );

      const sessionUser = hydrateSessionUserFromToken();
      if (!sessionUser) {
        throw new Error("Invalid access token returned from login");
      }

      return sessionUser;
    },
    onSuccess: async (user) => {
      qc.setQueryData(queryKeys.authSession, user);
      await qc.invalidateQueries({
        queryKey: [...queryKeys.authSession, "validation"],
      });
      // Post-login, prompt once for permission so authenticated sessions can receive pushes.
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
      const res = await api.post("/auth/signup", {
        name,
        email,
        username,
        password,
      });
      const resData = res.data;
      const accessToken: string = resData?.accessToken;
      const refreshToken: string = resData?.refreshToken;
      if (!accessToken) throw new Error("No access token returned from signup");
      setSession(
        { accessToken, refreshToken: refreshToken ?? null },
        { persist: false },
      );
      const sessionUser = hydrateSessionUserFromToken();
      if (!sessionUser) {
        throw new Error("Invalid access token returned from signup");
      }

      return {
        ...sessionUser,
        name: sessionUser.name || name,
        username: sessionUser.username || username,
        email: sessionUser.email || email,
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

  const logout = useCallback(() => {
    clearSession();

    qc.setQueryData(queryKeys.authSession, null);
    qc.removeQueries({ queryKey: queryKeys.onboardingStatus });
    qc.invalidateQueries({ queryKey: queryKeys.authSession });
  }, [qc]);

  const updateSession = useCallback(
    (accessToken: string, refreshToken?: string) => {
      // Re-persist tokens
      setSession({
        accessToken,
        refreshToken: refreshToken ?? null,
      });

      // Update local state by re-parsing the new token
      const sessionUser = hydrateSessionUserFromToken();
      if (sessionUser) {
        qc.setQueryData(queryKeys.authSession, sessionUser);
      }
      qc.invalidateQueries({
        queryKey: [...queryKeys.authSession, "validation"],
      });
    },
    [qc],
  );

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
