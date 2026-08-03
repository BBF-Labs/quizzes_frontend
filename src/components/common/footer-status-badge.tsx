"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { GlobalState } from "@/hooks/common/use-status";

/**
 * Compact live status pill for the footer. Polls /api/v1/status every 60s
 * so we don't hammer the backend. Renders as an inline element next to
 * other footer copy.
 */
const COPY: Record<GlobalState, { dot: string; text: string; aria: string }> = {
  operational: {
    dot: "bg-emerald-400",
    text: "All systems operational",
    aria: "All systems operational",
  },
  partial_outage: {
    dot: "bg-amber-400",
    text: "Partial outage",
    aria: "Partial outage in progress",
  },
  major_outage: {
    dot: "bg-rose-400",
    text: "Major outage",
    aria: "Major outage in progress",
  },
};

const POLL_MS = 60_000;

export function FooterStatusBadge() {
  const [state, setState] = useState<GlobalState | "loading" | "unknown">(
    "loading",
  );

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || "";
        const url = `${base.replace(/\/api\/v1\/?$/, "")}/api/v1/status`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("status fetch failed");
        const json = await res.json();
        const next: GlobalState | undefined = json?.data?.state;
        if (!cancelled) setState(next ?? "unknown");
      } catch {
        if (!cancelled) setState("unknown");
      }
    };

    fetchStatus();
    const id = setInterval(fetchStatus, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (state === "loading") {
    return (
      <span className="flex items-center gap-1.5 text-slate-500">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Checking status…</span>
      </span>
    );
  }

  if (state === "unknown") {
    // Backend unreachable — be honest, don't pretend it's fine.
    return (
      <a href="/status" className="flex items-center gap-1.5 text-slate-500 hover:text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
        <span>Status unknown</span>
      </a>
    );
  }

  const copy = COPY[state];
  return (
    <a
      href="/status"
      aria-label={copy.aria}
      className="group inline-flex items-center gap-1.5 text-slate-500 transition hover:text-white"
    >
      <span className={`h-1.5 w-1.5 rounded-full ${copy.dot} ${state === "operational" ? "" : "animate-pulse"}`} />
      <span>{copy.text}</span>
    </a>
  );
}