import type { ComponentStatus } from "@/hooks/common/use-status";
import { StatusDot } from "./status-dot";

interface ComponentStatusCardProps {
  component: ComponentStatus;
}

/**
 * Card representing one monitored component (Database, Cache & Queue, etc).
 * Pure server-renderable markup — no interactivity, no `"use client"`.
 */
export function ComponentStatusCard({ component }: ComponentStatusCardProps) {
  const { state, label, latencyMs, message } = component;

  const palette = {
    operational: {
      ring: "border-emerald-200",
      label: "text-emerald-700",
      latency: "text-emerald-600",
      bg: "bg-emerald-50/40",
    },
    degraded: {
      ring: "border-amber-200",
      label: "text-amber-700",
      latency: "text-amber-700",
      bg: "bg-amber-50/40",
    },
    down: {
      ring: "border-rose-200",
      label: "text-rose-700",
      latency: "text-rose-700",
      bg: "bg-rose-50/40",
    },
  }[state];

  const latencyText =
    state === "down"
      ? "no response"
      : latencyMs === null
        ? "—"
        : latencyMs >= 1000
          ? `${(latencyMs / 1000).toFixed(1)} s · ${state === "degraded" ? "slow" : "OK"}`
          : `${latencyMs} ms · ${state === "degraded" ? "slow" : "OK"}`;

  const stateLabel =
    state === "operational"
      ? "Operational"
      : state === "degraded"
        ? "Degraded"
        : "Down";

  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-2xl border ${palette.ring} ${palette.bg} p-5`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-1.5">
          <StatusDot state={state} />
        </span>
        <div>
          <p className="text-sm font-bold text-slate-950">{label}</p>
          {message && (
            <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{message}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={`text-xs font-extrabold uppercase tracking-widest ${palette.label}`}>
          {stateLabel}
        </p>
        <p className={`mt-1 text-[11px] font-semibold ${palette.latency}`}>
          {latencyText}
        </p>
      </div>
    </div>
  );
}
