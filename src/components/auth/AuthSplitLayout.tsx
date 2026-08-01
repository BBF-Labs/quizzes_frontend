"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthSplitLayoutProps {
  /** Marketing / brand panel rendered on the left at >= md widths. */
  left: ReactNode;
  /** Form panel rendered on the right; fills the viewport on mobile. */
  right: ReactNode;
  className?: string;
}

/**
 * Two-pane split for the auth screens (`/login`, `/signup`).
 *
 * - ≥ md: full-height left marketing pane (gradient + grid) + right form pane
 *   (dot-grid + radial blur) hosting a centered card.
 * - < md: left is hidden; right fills the viewport with a card on the form.
 *
 * Visual language mirrors the rest of the app: dark slate background, oklch
 * primary accent, no horizontal overflow on any breakpoint.
 */
export function AuthSplitLayout({
  left,
  right,
  className,
}: AuthSplitLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background flex relative overflow-hidden",
        className,
      )}
    >
      {/* Left pane — hidden on mobile */}
      <aside className="hidden md:flex md:w-1/2 relative overflow-hidden bg-card/40">
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-150 h-100 bg-primary/25 blur-[160px]" />
          <div className="absolute -bottom-40 -right-24 w-150 h-100 bg-primary/15 blur-[160px]" />
        </div>
        <div className="relative z-10 flex w-full">{left}</div>
      </aside>

      {/* Right pane — form card */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 relative overflow-hidden">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-[0.10] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-125 h-75 bg-primary/5 blur-[120px]" />
        </div>

        <div className="relative z-10 w-full max-w-md py-10">{right}</div>
      </main>
    </div>
  );
}
