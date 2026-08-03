"use client";

import { Loader2 } from "lucide-react";
import { useGlobalStatus } from "@/hooks/common/use-status";
import type { GlobalState } from "@/hooks/common/use-status";

/**
 * Compact live status pill for the footer. Backed by the shared
 * `useGlobalStatus` query so the footer, the status page, and any future
 * widget all observe one in-memory cache (single 30s poll tick).
 */
const COPY: Record<GlobalState, { dot: string; text: string; aria: string }> = {
  operational: {
    dot: "bg-emerald-400",
    text: "All good",
    aria: "All systems operational",
  },
  partial_outage: {
    dot: "bg-amber-400",
    text: "A few hiccups",
    aria: "Partial outage in progress",
  },
  major_outage: {
    dot: "bg-rose-400",
    text: "Working on it",
    aria: "Major outage in progress",
  },
};

export function FooterStatusBadge() {
  const { data, isPending, isError } = useGlobalStatus();

  if (isPending) {
    return (
      <span className="flex items-center gap-1.5 text-slate-500">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Checking status…</span>
      </span>
    );
  }

  if (isError || !data) {
    // Backend unreachable — be honest, don't pretend it's fine.
    return (
      <a href="/status" className="flex items-center gap-1.5 text-slate-500 hover:text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
        <span>Status unknown</span>
      </a>
    );
  }

  const copy = COPY[data.state];
  return (
    <a
      href="/status"
      aria-label={copy.aria}
      className="group inline-flex items-center gap-1.5 text-slate-500 transition hover:text-white"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${copy.dot} ${
          data.state === "operational" ? "" : "animate-pulse"
        }`}
      />
      <span>{copy.text}</span>
    </a>
  );
}
