import { getSessionUser } from "@/lib/session";

// Re-export SessionUser from session.ts so existing imports keep working
export type { SessionUser } from "@/lib/session";

/**
 * Reads the auth_user cookie (set server-side at login/refresh) to hydrate
 * the current user without a network call. Returns null if no session cookie exists.
 */
export function hydrateSessionUserFromToken() {
  return getSessionUser();
}
