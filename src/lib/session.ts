/**
 * Bearer-token session module.
 *
 * Tokens are stored in localStorage under a single key so they survive
 * page refreshes and are accessible cross-origin (unlike httpOnly cookies).
 *
 * accessToken  — JWT sent as Authorization: Bearer in every request.
 * refreshToken — Sent in POST /auth/refresh body to obtain a new access token.
 * user         — Safe user snapshot (id, name, role, etc.) for client hydration.
 */

const STORAGE_KEY = "qz_session";
export const AUTH_STATE_KEY = "auth_state"; // localStorage signal for cross-tab sync

export type SessionUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role?: "student" | "creator" | "moderator" | "super_admin";
  isSubscribed?: boolean;
  profilePicture?: string;
  studentId?: string;
  bio?: string;
  notificationSettings?: any;
  onboarding?: {
    completed: boolean;
    currentStep: number;
    steps: Record<string, boolean>;
  };
};

type StoredSession = {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
};

function canUseStorage(): boolean {
  return typeof localStorage !== "undefined";
}

function readStorage(): StoredSession | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Persist tokens and user after login / signup / refresh. */
export function setSession(
  user: SessionUser,
  accessToken: string,
  refreshToken: string,
): void {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, accessToken, refreshToken }));
}

/** Read the stored user snapshot. Returns null if not logged in. */
export function getSessionUser(): SessionUser | null {
  return readStorage()?.user ?? null;
}

/** Return the stored JWT access token for Authorization headers. */
export function getAccessToken(): string | null {
  return readStorage()?.accessToken ?? null;
}

/** Return the stored refresh token for silent refresh requests. */
export function getRefreshToken(): string | null {
  return readStorage()?.refreshToken ?? null;
}

/** Clear all local session state and signal other tabs. */
export function clearSession(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(AUTH_STATE_KEY, "inactive");
}

/** Signal other tabs that a new session is active. */
export function signalSessionActive(): void {
  if (!canUseStorage()) return;
  localStorage.setItem(AUTH_STATE_KEY, "active");
}

