"use client";

/**
 * Phase B stub — GitHub OAuth is out of scope for Phase A (Google only).
 *
 * When implemented, the flow will mirror `useGoogleAuth`:
 *   1. Redirect the user to `https://github.com/login/oauth/authorize?client_id=...&scope=user:email`
 *   2. GitHub calls back to Qz with a `code` query param on a server route.
 *   3. Backend exchanges the code for an access token at
 *      `https://github.com/login/oauth/access_token`.
 *   4. Backend fetches the user's primary email at `/user/emails` and the
 *      profile at `/user`, then routes through the same `oauthCreateUser` /
 *      auto-link-by-email helpers used for Google.
 *
 * The backend `linkedProviders` schema already accommodates `provider: 'github'`.
 */

export interface UseGithubAuthOptions {
  redirectOnLogin?: string;
  referralCode?: string;
}

export function useGithubAuth(_options: UseGithubAuthOptions = {}) {
  return {
    loginWithGithub: async () => {
      throw new Error(
        "GitHub sign-in is not yet available (Phase B). Please use Google or email/password.",
      );
    },
    isGithubLoading: false,
    githubError: null as string | null,
  };
}
