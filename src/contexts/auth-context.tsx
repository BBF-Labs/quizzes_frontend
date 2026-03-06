"use client";
import React, { createContext, useContext, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getStorage } from "@/lib/api";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOKEN_KEY = "admin_token";
const REFRESH_TOKEN_KEY = "admin_refresh_token";
const REMEMBER_ME_KEY = "admin_remember_me";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdminUser {
  id: string;
  username: string;
  isSuperAdmin: boolean;
}

interface AuthContextValue {
  user: AdminUser | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  login: (username: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// JWT helpers
// ---------------------------------------------------------------------------

function parseJwt(token: string): any {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function getStoredUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  
  // Storage might be in localStorage OR sessionStorage
  const storage = getStorage();
  if (!storage) return null;

  const token = storage.getItem(TOKEN_KEY);
  if (!token) return null;

  const decoded = parseJwt(token);
  // Note: We don't strictly check expiry here because the API interceptor 
  // will handle 401/refresh automatically. We only remove if it's clearly garbage.
  if (!decoded) {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
    return null;
  }

  return {
    id: decoded.id,
    username: decoded.username ?? decoded.email ?? "",
    isSuperAdmin: decoded.isSuperAdmin ?? false,
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();

  const { data: user, isLoading } = useQuery<AdminUser | null>({
    queryKey: ["admin-session"],
    queryFn: getStoredUser,
    staleTime: 60_000,
    initialData: () => getStoredUser(),
  });

  const loginMutation = useMutation({
    mutationFn: async ({ username, password, rememberMe }: { username: string; password: string; rememberMe: boolean }) => {
      const res = await api.post("/auth/login", { username, password, rememberMe });
      
      const resData = res.data?.data ?? res.data;
      const accessToken: string = resData?.accessToken;
      const refreshToken: string = resData?.refreshToken;

      if (!accessToken) throw new Error("No access token returned from login");

      // Set preference first so getStorage() knows which one to return
      if (typeof window !== "undefined") {
        localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? "true" : "false");
        const storage = rememberMe ? localStorage : sessionStorage;
        
        storage.setItem(TOKEN_KEY, accessToken);
        if (refreshToken) {
          storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
      }

      const decoded = parseJwt(accessToken);
      return {
        id: decoded.id,
        username: decoded.username ?? decoded.email ?? username,
        isSuperAdmin: decoded.isSuperAdmin ?? false,
      } as AdminUser;
    },
    onSuccess: (adminUser) => {
      qc.setQueryData(["admin-session"], adminUser);
    },
  });

  const login = useCallback(
    (username: string, password: string, rememberMe: boolean) =>
      loginMutation.mutateAsync({ username: username.trim().toLowerCase(), password, rememberMe }).then(() => undefined),
    [loginMutation]
  );

  const logout = useCallback(() => {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(REFRESH_TOKEN_KEY);
    }
    // Also clear the preference
    if (typeof window !== "undefined") {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }

    qc.setQueryData(["admin-session"], null);
    qc.invalidateQueries({ queryKey: ["admin-session"] });
  }, [qc]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isSuperAdmin: user?.isSuperAdmin ?? false,
        login,
        logout,
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
