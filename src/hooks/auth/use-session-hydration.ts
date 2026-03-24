import {
  clearSession,
  getAccessToken,
} from "@/lib/session";

export type SessionUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  role?: "student" | "creator" | "moderator" | "super_admin";
  isSubscribed?: boolean;
  profilePicture?: string;
  onboarding?: {
    completed: boolean;
    currentStep: number;
    steps: Record<string, boolean>;
  };
};

type JwtPayload = {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  exp?: number;
  role?: "student" | "creator" | "moderator" | "super_admin";
  isSubscribed?: boolean;
  profilePicture?: string;
  onboarding?: {
    completed: boolean;
    currentStep: number;
    steps: Record<string, boolean>;
  };
};

function parseJwt(token: string): JwtPayload | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(exp?: number): boolean {
  if (!exp) return false;
  return exp * 1000 <= Date.now();
}

export function hydrateSessionUserFromToken(): SessionUser | null {
  const token = getAccessToken();
  if (!token) return null;

  const decoded = parseJwt(token);
  if (!decoded || isTokenExpired(decoded.exp)) {
    clearSession();
    return null;
  }

  return {
    id: decoded.id ?? "unknown-user",
    name: decoded.name ?? "User",
    username: decoded.username ?? decoded.email?.split("@")[0] ?? "User",
    email: decoded.email ?? "",
    role: decoded.role ?? "student",
    isSubscribed: decoded.isSubscribed ?? false,
    profilePicture: decoded.profilePicture,
    onboarding: decoded.onboarding,
  };
}
