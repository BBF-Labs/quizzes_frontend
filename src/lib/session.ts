/**
 * Cookie-based session module.
 *
 * auth_access  — httpOnly, set by server. Holds the JWT access token.
 *                Not readable from JS; sent automatically with every credentialed request.
 * auth_refresh — httpOnly, set by server. Holds the refresh token.
 *                Not readable from JS.
 * auth_user    — NOT httpOnly, set by server. Holds a JSON snapshot of safe user info
 *                (id, name, role, etc.) so the client can hydrate without a server call.
 *
 * This module manages the auth_user readable cookie and a localStorage signal key
 * used for cross-tab session sync.
 */

const AUTH_USER_COOKIE = "auth_user";
export const AUTH_STATE_KEY = "auth_state"; // localStorage signal for cross-tab sync

function canUseDOM(): boolean {
  return typeof document !== "undefined";
}

function getCookie(name: string): string | null {
  if (!canUseDOM()) return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  if (!canUseDOM()) return;
  const isProduction = process.env.NODE_ENV === "production";
  const sameSite = isProduction ? "None" : "Lax";
  const secure = isProduction ? "; Secure" : "";
  document.cookie = `${name}=; Max-Age=0; Path=/${secure}; SameSite=${sameSite}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

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

/** Read the auth_user cookie set by the server. Returns null if not present or malformed. */
export function getSessionUser(): SessionUser | null {
  const raw = getCookie(AUTH_USER_COOKIE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Clear client-visible session state (auth_user cookie + cross-tab signal).
 * httpOnly cookies (auth_access, auth_refresh) can only be cleared server-side
 * via POST /auth/logout — the auth context logout handler calls that endpoint.
 */
export function clearSession() {
  deleteCookie(AUTH_USER_COOKIE);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(AUTH_STATE_KEY, "inactive");
  }
}

/** Signal other tabs that a new session is active. */
export function signalSessionActive() {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(AUTH_STATE_KEY, "active");
  }
}

// ---------------------------------------------------------------------------
// Legacy stubs — kept so existing imports don't break during transition.
// With httpOnly cookies the frontend never holds the raw tokens.
// ---------------------------------------------------------------------------
export function setSession() {}
export function getAccessToken(): string | null { return null; }
export function getRefreshToken(): string | null { return null; }
