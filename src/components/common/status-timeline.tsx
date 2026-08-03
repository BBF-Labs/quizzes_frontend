import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type {
  ComponentHistory,
  ComponentState,
  StatusHistory,
} from "@/hooks/common/use-status";

/**
 * 24h timeline strip — one row per component, one bar per hour. Mirrors the
 * pattern used by real status pages (Atlassian / BetterUptime / Instatus).
 *
 * Server-renderable, no `"use client"`.
 *
 * Restyled to match the Qz marketing surface: rounded-[28px] landing card,
 * spacious lime hero summary with the overall uptime headline + per-state
 * hour counts, legend pulled up next to the heading.
 *
 * Color mapping:
 *   operational -> emerald-400
 *   degraded    -> amber-400
 *   down        -> rose-400
 *   no data     -> slate-200
 */

const SLOT_BAR: Record<ComponentState | "none", string> = {
  operational: "bg-emerald-400",
  degraded: "bg-amber-400",
  down: "bg-rose-400",
  none: "bg-slate-200",
};

const DOWNTONE_TEXT: Record<ComponentState, string> = {
  operational: "text-emerald-700",
  degraded: "text-amber-700",
  down: "text-rose-700",
};

interface StatusTimelineProps {
  history: StatusHistory;
}

export function StatusTimeline({ history }: StatusTimelineProps) {
  const { components, startedAt, endedAt } = history;

  const overall = computeOverallUptime(components);
  const hourBuckets = computeHourBuckets(components);
  const tone =
    overall >= 99.5
      ? { text: "text-emerald-700", label: "Excellent" }
      : overall >= 95
        ? { text: "text-amber-700", label: "Mostly up" }
        : { text: "text-rose-700", label: "Degraded" };

  return (
    <div
      className="play-card overflow-hidden rounded-[28px] border border-slate-200 bg-white"
      style={{ borderRadius: "28px" }}
    >
      {/* Lime hero summary — spacious stats layout */}
      <div className="bg-[#E9FFD3] px-5 py-8 sm:px-10 sm:py-12">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="max-w-md">
            <p className="text-[10px] font-extrabold uppercase tracking-[.22em] text-emerald-900">
              Last 24 hours
            </p>
            <h3 className="display mt-3 text-5xl font-bold leading-none tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              {overall.toFixed(2)}
              <span className="text-2xl font-bold text-slate-700 sm:text-3xl">
                %
              </span>
            </h3>
            <p
              className={`hand mt-3 text-xl ${tone.text}`}
            >
              {tone.label.toLowerCase()} all round ✦
            </p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-slate-700">
              <TimeLabel iso={startedAt} /> &ndash;{" "}
              <TimeLabel iso={endedAt} /> UTC
            </p>
          </div>

          <HourBreakdown buckets={hourBuckets} />
        </div>
      </div>

      {/* Tick strip + rows */}
      <div className="px-5 py-7 sm:px-10 sm:py-9">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
            Hour-by-hour, every service
          </p>
          <Legend />
        </div>

        <TickStrip count={components[0]?.hours.length ?? 24} />

        <div className="mt-4 flex flex-col gap-5 sm:gap-4">
          {components.map((c) => (
            <ComponentRow key={c.id} component={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

function computeOverallUptime(components: ComponentHistory[]): number {
  if (components.length === 0) return 100;
  let totalHours = 0;
  let totalUp = 0;
  for (const c of components) {
    for (const h of c.hours) {
      totalHours += 1;
      totalUp += h.uptimePercent / 100;
    }
  }
  return totalHours === 0 ? 100 : (totalUp / totalHours) * 100;
}

interface HourBuckets {
  green: number;
  amber: number;
  rose: number;
}

function computeHourBuckets(components: ComponentHistory[]): HourBuckets {
  let green = 0;
  let amber = 0;
  let rose = 0;
  for (const c of components) {
    for (const h of c.hours) {
      if (h.state === "operational") green++;
      else if (h.state === "degraded") amber++;
      else if (h.state === "down") rose++;
    }
  }
  return { green, amber, rose };
}

function HourBreakdown({ buckets }: { buckets: HourBuckets }) {
  const items: Array<{
    label: string;
    value: number;
    bar: string;
    ink: string;
    ring: string;
  }> = [
    {
      label: "Healthy hours",
      value: buckets.green,
      bar: "bg-emerald-400",
      ink: "text-emerald-700",
      ring: "border-emerald-200",
    },
    {
      label: "Slow hours",
      value: buckets.amber,
      bar: "bg-amber-400",
      ink: "text-amber-700",
      ring: "border-amber-200",
    },
    {
      label: "Down hours",
      value: buckets.rose,
      bar: "bg-rose-400",
      ink: "text-rose-700",
      ring: "border-rose-200",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
      {items.map((it) => (
        <div
          key={it.label}
          className={`min-w-0 rounded-2xl border border-white/60 bg-white/70 px-3 py-3.5 sm:px-5 sm:py-4`}
        >
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-600 sm:text-[10px]">
            {it.label}
          </p>
          <p className={`mt-2 flex items-baseline gap-1 ${it.ink}`}>
            <span className="display text-2xl font-bold tabular-nums sm:text-3xl">
              {it.value}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              hr
            </span>
          </p>
          <span
            className={`mt-2.5 block h-1 w-full overflow-hidden rounded-full bg-slate-200/70 sm:mt-3`}
          >
            <span
              className={`block h-full ${it.bar}`}
              style={{
                width: `${
                  Math.max(
                    0,
                    Math.min(
                      1,
                      it.value /
                        Math.max(
                          1,
                          buckets.green + buckets.amber + buckets.rose,
                        ),
                    ),
                  ) * 100
                }%`,
              }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

function ComponentRow({ component }: { component: ComponentHistory }) {
  const { id, label, hours, uptimePercent24h } = component;

  let recentWorst: ComponentState | null = null;
  for (let i = hours.length - 1; i >= 0; i--) {
    if (hours[i].state !== "operational") {
      recentWorst = hours[i].state;
      break;
    }
  }
  const isAllGreen =
    hours.every((h) => h.state === "operational") && hours.length > 0;

  const verdictClass =
    isAllGreen || !recentWorst
      ? "text-emerald-700"
      : DOWNTONE_TEXT[recentWorst];

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[10rem_1fr_5rem] sm:items-center sm:gap-3 lg:grid-cols-[12rem_1fr_6rem]">
      <div className="flex items-center justify-between gap-2 sm:justify-start">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
          {label}
        </span>
        <p
          className={`text-[11px] font-extrabold tabular-nums sm:hidden ${verdictClass}`}
        >
          {uptimePercent24h}%
        </p>
      </div>

      <div className="flex h-10 gap-[3px] overflow-hidden rounded-lg sm:h-12">
        {hours.map((h, i) => (
          <span
            key={`${id}-${i}`}
            className={`flex-1 ${SLOT_BAR[h.state]} ${h.state === "operational" ? "" : "opacity-95"}`}
            title={`${formatHour(h.hourStart)} — ${h.state} (${h.uptimePercent}% up)`}
            aria-label={`${label} at ${formatHour(h.hourStart)}: ${h.state}`}
          />
        ))}
      </div>

      <p
        className={`hidden text-right text-[11px] font-extrabold tabular-nums sm:block ${verdictClass}`}
      >
        {uptimePercent24h}%
      </p>
    </div>
  );
}

function TickStrip({ count }: { count: number }) {
  const ticks = [
    { idx: count - 1, label: "now" },
    { idx: Math.max(0, count - 1 - 6), label: "6h" },
    { idx: Math.max(0, count - 1 - 12), label: "12h" },
    { idx: Math.max(0, count - 1 - 18), label: "18h" },
    { idx: 0, label: "24h" },
  ];

  const mobileTicks = [ticks[0], ticks[ticks.length - 1]];

  return (
    <>
      {/* Mobile: just "24h ago" + "now" */}
      <div className="relative mt-3 h-6 sm:hidden">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-100" />
        {mobileTicks.map((t) => (
          <span
            key={`m-${t.idx}`}
            className="absolute -translate-x-1/2 text-[10px] font-semibold uppercase tracking-wider text-slate-400"
            style={{ left: `${(t.idx / Math.max(1, count - 1)) * 100}%` }}
          >
            {t.label}
          </span>
        ))}
      </div>

      {/* sm+: full 5-tick strip */}
      <div className="relative mt-3 hidden h-6 sm:block">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-100" />
        {ticks.map((t) => (
          <span
            key={`d-${t.idx}`}
            className="absolute -translate-x-1/2 text-[10px] font-semibold uppercase tracking-wider text-slate-400"
            style={{ left: `${(t.idx / Math.max(1, count - 1)) * 100}%` }}
          >
            {t.label}
          </span>
        ))}
      </div>
    </>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 sm:gap-4">
      <span className="flex items-center gap-1.5">
        <CheckCircle2
          className={`h-3.5 w-3.5 text-emerald-500`}
          strokeWidth={2.5}
        />
        Healthy
      </span>
      <span className="flex items-center gap-1.5">
        <AlertTriangle
          className={`h-3.5 w-3.5 text-amber-500`}
          strokeWidth={2.5}
        />
        Slow
      </span>
      <span className="flex items-center gap-1.5">
        <XCircle className={`h-3.5 w-3.5 text-rose-500`} strokeWidth={2.5} />
        Down
      </span>
    </div>
  );
}

function formatHour(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCHours().toString().padStart(2, "0")}:00`;
}

function TimeLabel({ iso }: { iso: string }) {
  return <span>{formatHour(iso)}</span>;
}