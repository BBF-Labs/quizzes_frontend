import { getSessionUser } from "@/lib/session";

// Re-export SessionUser from session.ts so existing imports keep working
export type { SessionUser } from "@/lib/session";

/**
 * Reads the stored session from localStorage to hydrate the current user
 * without a network call. Returns null if no session exists.
 */
export function hydrateSessionUserFromToken() {
  return getSessionUser();
}
