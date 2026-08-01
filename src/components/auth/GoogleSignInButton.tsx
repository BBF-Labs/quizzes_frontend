"use client";

import { Loader2 } from "lucide-react";
import { useGoogleAuth } from "@/hooks/auth/use-google-auth";
import { cn } from "@/lib/utils";

interface GoogleSignInButtonProps {
  /** Optional referral code forwarded to the OAuth backend on signup. */
  referralCode?: string;
  /** Where to redirect on successful login. Default `/app`. */
  redirectOnLogin?: string;
  /** Button label override (e.g. "Sign up with Google" vs "Continue with Google"). */
  label?: string;
  className?: string;
}

/**
 * Single-button Google OAuth trigger styled per the revamp visual language
 * (white bg, slate-200 border, full-width, rounded-2xl, multicolor "G" mark).
 *
 * Shared between /login and /signup so both surfaces render the same trigger.
 * Implementation reuses `useGoogleAuth` for the GIS prompt + backend roundtrip.
 */
export function GoogleSignInButton({
  referralCode,
  redirectOnLogin,
  label = "Continue with Google",
  className,
}: GoogleSignInButtonProps) {
  const { loginWithGoogle, isGoogleLoading } = useGoogleAuth({
    redirectOnLogin,
    referralCode,
  });

  return (
    <button
      type="button"
      onClick={() => {
        void loginWithGoogle();
      }}
      disabled={isGoogleLoading}
      className={cn(
        "flex w-full items-center justify-center gap-3 rounded-2xl border bg-white px-4 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition",
        "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {isGoogleLoading ? (
        <Loader2 className="size-4 animate-spin text-slate-400" />
      ) : (
        <GoogleMark className="size-4" />
      )}
      <span>{isGoogleLoading ? "Opening Google…" : label}</span>
    </button>
  );
}

// Inline Google "G" mark — keeps us independent of external SVG CDNs.
// Colors match Google's brand book.
function GoogleMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.35 11.1H12v3.2h5.35c-.23 1.45-1.66 4.25-5.35 4.25-3.22 0-5.85-2.67-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.93 4.07 14.7 3.1 12 3.1 6.85 3.1 2.65 7.3 2.65 12.45S6.85 21.8 12 21.8c6.93 0 9.6-4.86 9.6-9.35 0-.63-.07-1.1-.25-1.35z"
        fill="#4285F4"
      />
      <path
        d="M3.65 7.65l2.8 2.05C7.16 7.99 9.4 6.6 12 6.6c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.93 4.07 14.7 3.1 12 3.1 8.4 3.1 5.27 5.05 3.65 7.65z"
        fill="#EA4335"
      />
      <path
        d="M12 21.8c2.65 0 4.87-.87 6.5-2.37l-2.83-2.4c-.78.55-1.85.95-3.67.95-3.69 0-5.12-2.8-5.35-4.25l-2.83 2.18C5.18 19.55 8.32 21.8 12 21.8z"
        fill="#34A853"
      />
      <path
        d="M21.35 11.1H12v3.2h5.35c-.15.8-.55 1.65-1.18 2.33l2.83 2.4c-.15.15 3-2.2 3-7.08 0-.63-.07-1.1-.25-1.35-.45-.65-1.4-1.5-2.4-1.5z"
        fill="#FBBC05"
      />
    </svg>
  );
}
