import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolve the avatar URL for a user, with this precedence:
 *   1. `profilePicture` — custom upload (Qz storage). Always wins.
 *   2. `oauthPicture`   — foreign URL from the OAuth provider (Google/GitHub).
 *   3. `undefined`       — caller renders initials / fallback.
 */
export function resolveAvatarUrl(
  user:
    | {
        profilePicture?: string;
        oauthPicture?: string;
      }
    | null
    | undefined,
): string | undefined {
  if (!user) return undefined;
  if (user.profilePicture) return user.profilePicture;
  if (user.oauthPicture) return user.oauthPicture;
  return undefined;
}
