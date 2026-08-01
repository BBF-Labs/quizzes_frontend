"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// useGoogleAuth
//
// Renders the Google Identity Services prompt lazily and exposes a hook-side
// helper that resolves when the user completes the consent flow.
//
// The backend auto-links by email (no magic-link round trip). On success the
// user is logged in and the hook redirects to `redirectOnLogin`.
//
// Returns:
//   - loginWithGoogle(): renders the GIS prompt; resolves once the user lands
//     on the post-login redirect target.
//   - isGoogleLoading: true while the GIS prompt or the backend roundtrip is in
//     flight.
//   - googleError: last error surfaced by the flow (cleared on next invocation).
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (resp: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number;
              locale?: string;
            },
          ) => void;
          prompt: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

const GIS_SRC = "https://accounts.google.com/gsi/client";

let gisLoadPromise: Promise<void> | null = null;

function loadGisScript(clientId: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gisLoadPromise) return gisLoadPromise;

  gisLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${GIS_SRC}"]`,
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Identity Services")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Failed to load Google Identity Services")),
      { once: true },
    );
    document.head.appendChild(script);
  });

  // Initialise once the script has loaded (or was already loaded).
  return gisLoadPromise.then(
    () =>
      new Promise<void>((resolve, reject) => {
        const tryInit = (attempt = 0) => {
          if (window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: () => {
                // No-op callback — loginWithGoogle() overrides per-invocation.
              },
              cancel_on_tap_outside: true,
              use_fedcm_for_prompt: true,
            });
            resolve();
            return;
          }
          if (attempt > 20) {
            reject(new Error("Google Identity Services API not available"));
            return;
          }
          setTimeout(() => tryInit(attempt + 1), 100);
        };
        tryInit();
      }),
  );
}

export interface UseGoogleAuthOptions {
  /** Where to redirect on successful login. Defaults to `/app`. */
  redirectOnLogin?: string;
  /** Optional referral code forwarded to the backend. */
  referralCode?: string;
}

export function useGoogleAuth(options: UseGoogleAuthOptions = {}) {
  const { redirectOnLogin = "/app", referralCode } = options;
  const { oauthLogin } = useAuth();
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Pre-load the script so the first click is instant. Silent: errors surface only
  // when the user actually clicks the button.
  useEffect(() => {
    if (!clientId) return;
    loadGisScript(clientId).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("[useGoogleAuth] GIS preload failed:", err);
    });
  }, [clientId]);

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    if (!clientId) {
      const msg = "Google sign-in is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID.";
      setGoogleError(msg);
      toast.error(msg);
      return false;
    }

    setGoogleError(null);
    setIsGoogleLoading(true);

    try {
      await loadGisScript(clientId);

      const idToken: string = await new Promise((resolve, reject) => {
        if (!window.google?.accounts?.id) {
          reject(new Error("Google Identity Services is unavailable"));
          return;
        }
        // Re-initialise with a one-shot callback so we capture *this* attempt's token.
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (resp) => {
            if (resp?.credential) resolve(resp.credential);
            else reject(new Error("Google did not return a credential"));
          },
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
        });
        try {
          window.google.accounts.id.prompt();
        } catch (err) {
          reject(err);
        }
      });

      await oauthLogin("google", { idToken, referralCode });
      router.replace(redirectOnLogin);
      return true;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Google sign-in failed. Please try again.";
      setGoogleError(message);
      toast.error(message);
      return false;
    } finally {
      setIsGoogleLoading(false);
    }
    // router/redirectOnLogin/referralCode are intentionally excluded from deps:
    // they're caller-provided constants and re-running the callback ref would
    // just trigger another login attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, oauthLogin]);

  return { loginWithGoogle, isGoogleLoading, googleError };
}