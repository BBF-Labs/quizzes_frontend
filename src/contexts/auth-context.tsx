"use client";
import React, { createContext, useContext, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  ensurePushSubscription,
  getCurrentPushEndpoint,
} from "@/lib/push-notifications";
import {
  clearAdminSession,
  getAdminAccessToken,
  setAdminSession,
} from "@/lib/admin-session";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdminUser {
  id: string;
  username: string;
  email: string;
  isSuperAdmin: boolean;
  profilePicture?: string;
}

// ---------------------------------------------------------------------------
// AuthContext
// ---------------------------------------------------------------------------

interface AuthContextValue {
  user: AdminUser | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  login: (
    username: string,
    password: string,
    rememberMe: boolean,
  ) => Promise<void>;
  logout: () => void;
  updateSession: (accessToken: string, refreshToken?: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// JWT helpers
// ---------------------------------------------------------------------------

type JwtPayload = {
  id?: string;
  username?: string;
  email?: string;
  isSuperAdmin?: boolean;
  profilePicture?: string;
};

function parseJwt(token: string): JwtPayload | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

function getStoredUser(): AdminUser | null {
  const token = getAdminAccessToken();
  if (!token) return null;

  const decoded = parseJwt(token);
  if (!decoded) {
    clearAdminSession();
    return null;
  }

  return {
    id: decoded.id ?? "unknown-admin",
    username: decoded.username ?? decoded.email?.split("@")[0] ?? "Admin",
    email: decoded.email ?? "",
    isSuperAdmin: decoded.isSuperAdmin ?? false,
    profilePicture: decoded.profilePicture,
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();

  const { data: user, isLoading } = useQuery<AdminUser | null>({
    queryKey: ["admin-session"],
    queryFn: async () => getStoredUser(),
    staleTime: 60_000,
  });

  const loginMutation = useMutation({
    mutationFn: async ({
      username,
      password,
      rememberMe,
    }: {
      username: string;
      password: string;
      rememberMe: boolean;
    }) => {
      const pushEndpoint = await getCurrentPushEndpoint();

      const res = await api.post("/auth/login", {
        username,
        password,
        rememberMe,
        endpoint: pushEndpoint ?? undefined,
      });

      const resData = res.data?.data ?? res.data;
      const accessToken: string = resData?.accessToken;
      const refreshToken: string = resData?.refreshToken;

      if (!accessToken) throw new Error("No access token returned from login");

      setAdminSession(
        {
          accessToken,
          refreshToken: refreshToken ?? null,
        },
        { persist: rememberMe },
      );

      const decoded = parseJwt(accessToken);
      if (!decoded) {
        throw new Error("Invalid access token returned from login");
      }

      return {
        id: decoded.id ?? username,
        username: decoded.username ?? decoded.email?.split("@")[0] ?? username,
        email: decoded.email ?? "",
        isSuperAdmin: decoded.isSuperAdmin ?? false,
        profilePicture: decoded.profilePicture,
      } as AdminUser;
    },
    onSuccess: async (adminUser) => {
      qc.setQueryData(["admin-session"], adminUser);
      // Post-login, prompt once for permission so authenticated sessions can receive pushes.
      await ensurePushSubscription({ promptForPermission: true });
    },
  });

  const login = useCallback(
    (username: string, password: string, rememberMe: boolean) =>
      loginMutation
        .mutateAsync({
          username: username.trim().toLowerCase(),
          password,
          rememberMe,
        })
        .then(() => undefined),
    [loginMutation],
  );

  const logout = useCallback(() => {
    clearAdminSession();

    qc.setQueryData(["admin-session"], null);
    qc.invalidateQueries({ queryKey: ["admin-session"] });
  }, [qc]);

  const updateSession = useCallback(
    (accessToken: string, refreshToken?: string) => {
      // Re-persist tokens
      setAdminSession({
        accessToken,
        refreshToken: refreshToken ?? null,
      });

      // Update local state by re-parsing the new token
      const decoded = parseJwt(accessToken);
      if (decoded) {
        const adminUser: AdminUser = {
          id: decoded.id ?? "unknown-admin",
          username: decoded.username ?? decoded.email?.split("@")[0] ?? "Admin",
          email: decoded.email ?? "",
          isSuperAdmin: decoded.isSuperAdmin ?? false,
          profilePicture: decoded.profilePicture,
        };
        qc.setQueryData(["admin-session"], adminUser);
      }
    },
    [qc],
  );

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isSuperAdmin: user?.isSuperAdmin ?? false,
        login,
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
