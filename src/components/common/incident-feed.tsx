"use client";

import { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, AlertTriangle, XCircle, Clock, Zap } from "lucide-react";
import type {
  ComponentIncidents,
  ComponentState,
  IncidentRun,
  StatusIncidents,
} from "@/hooks/common/use-status";

/**
 * Past-incidents feed — Atlassian-style. One collapsible section per service,
 * newest incidents first. Services with active issues expand by default.
 *
 * Restyled to match the Qz marketing surface: rounded-[28px] landing card,
 * play-card hover chrome, polished summary sidebar.
 */

const STATE_BADGE: Record<
  Exclude<ComponentState, "operational">,
  {
    Icon: typeof AlertTriangle;
    text: string;
    palette: string;
    ring: string;
    bg: string;
  }
> = {
  degraded: {
    Icon: AlertTriangle,
    text: "Slow",
    palette: "text-amber-700",
    ring: "border-amber-200",
    bg: "bg-amber-50",
  },
  down: {
    Icon: XCircle,
    text: "Down",
    palette: "text-rose-700",
    ring: "border-rose-200",
    bg: "bg-rose-50",
  },
};

export function IncidentFeed({ incidents }: { incidents: StatusIncidents }) {
  const defaultOpen = useMemo(
    () =>
      incidents.components
        .filter((c) => c.hasActiveIncident)
        .map((c) => c.id),
    [incidents.components],
  );

  const hasAnyIncidents = incidents.components.some(
    (c) => c.incidents.length > 0,
  );

  return (
    <div
      className="play-card overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 sm:p-8"
      style={{ borderRadius: "28px" }}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.22em] text-slate-500">
            Past incidents
          </p>
          <h3 className="display mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
            What happened, hour by hour.
          </h3>
        </div>
        <p className="hidden text-[11px] font-semibold text-slate-400 sm:block">
          Last {incidents.hours}h · {incidents.components.length} services
        </p>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div>
          {hasAnyIncidents ? (
            <Accordion
              type="multiple"
              defaultValue={defaultOpen}
              className="divide-y divide-slate-200"
            >
              {incidents.components.map((c) => (
                <ServiceSection key={c.id} component={c} />
              ))}
            </Accordion>
          ) : (
            <AllClearPanel />
          )}
        </div>

        <SummarySidebar incidents={incidents} />
      </div>
    </div>
  );
}

function ServiceSection({ component }: { component: ComponentIncidents }) {
  const hasIncidents = component.incidents.length > 0;

  return (
    <AccordionItem value={component.id} className="border-0">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex flex-1 items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ServiceStateDot
              state={
                component.hasActiveIncident
                  ? "active"
                  : hasIncidents
                    ? "past"
                    : "clear"
              }
            />
            <span className="text-sm font-extrabold uppercase tracking-widest text-slate-700">
              {component.label}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            {hasIncidents
              ? `${component.incidents.length} ${component.incidents.length === 1 ? "incident" : "incidents"} in last ${component.windowHours}h`
              : `No incidents in last ${component.windowHours}h`}
          </span>
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-4">
        {hasIncidents ? (
          <ul className="ml-2 flex flex-col gap-2 border-l border-slate-200 pl-4 sm:ml-4 sm:pl-6">
            {component.incidents.map((run, i) => (
              <li key={`${run.startedAt}-${i}`}>
                <IncidentRow run={run} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="ml-2 text-sm text-slate-500 sm:ml-4">
            {component.label} has been responding normally — no degraded or
            down probes in the last {component.windowHours} hours.
          </p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function IncidentRow({ run }: { run: IncidentRun }) {
  const badge = STATE_BADGE[run.state];
  const Icon = badge.Icon;

  const duration = formatDuration(run);
  const window = formatWindow(run.startedAt, run.endedAt);

  return (
    <div
      className={`relative rounded-2xl border ${badge.ring} ${badge.bg} p-3 sm:p-4`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border ${badge.ring} bg-white px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest ${badge.palette}`}
        >
          <Icon className="h-3 w-3" />
          {badge.text}
        </span>
        {run.isOngoing ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-700">
            <Zap className="h-3 w-3" />
            Ongoing
          </span>
        ) : null}
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
          <Clock className="h-3 w-3" />
          {duration}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-800">{window}</p>
      <p className="mt-1 text-[11px] font-semibold text-slate-500">
        Worst hour uptime:{" "}
        <b className="text-slate-700">{run.uptimePercent}%</b> ·{" "}
        <b className="text-slate-700">{run.hourCount}</b> hour
        {run.hourCount === 1 ? "" : "s"} affected
      </p>
    </div>
  );
}

function SummarySidebar({ incidents }: { incidents: StatusIncidents }) {
  const totals = useMemo(() => {
    let degraded = 0;
    let down = 0;
    let ongoing = 0;
    let totalHours = 0;
    for (const c of incidents.components) {
      for (const i of c.incidents) {
        if (i.state === "degraded") degraded++;
        if (i.state === "down") down++;
        if (i.isOngoing) ongoing++;
        totalHours += i.hourCount;
      }
    }
    return { degraded, down, ongoing, totalHours };
  }, [incidents.components]);

  return (
    <aside className="flex flex-col gap-3">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-slate-500">
          Window
        </p>
        <p className="display mt-1 text-3xl font-bold text-slate-950">
          {incidents.hours}h
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          UTC · {fmtClock(incidents.startedAt)} → {fmtClock(incidents.endedAt)}
        </p>
      </div>

      <StatPill label="Degraded runs" value={totals.degraded} tone="amber" />
      <StatPill label="Outage runs" value={totals.down} tone="rose" />
      <StatPill
        label="Ongoing right now"
        value={totals.ongoing}
        tone={totals.ongoing > 0 ? "rose" : "emerald"}
      />
      <StatPill
        label="Total degraded hours"
        value={totals.totalHours}
        tone="slate"
      />
    </aside>
  );
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "amber" | "rose" | "emerald" | "slate";
}) {
  const toneClass = {
    amber: "text-amber-700",
    rose: "text-rose-700",
    emerald: "text-emerald-700",
    slate: "text-slate-700",
  }[tone];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-slate-500">
        {label}
      </p>
      <p className={`display mt-1 text-2xl font-bold tabular-nums ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}

function AllClearPanel() {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
          <CheckCircle2 className="h-5 w-5 text-emerald-700" />
        </span>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
            Quiet 24 hours
          </p>
          <p className="mt-1 text-base font-bold text-slate-950">
            Nothing to see here.
          </p>
          <p className="mt-1 text-sm text-slate-600">
            All four services have been responding normally — no degraded
            probes or outages in the last 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}

function ServiceStateDot({
  state,
}: {
  state: "active" | "past" | "clear";
}) {
  const config = {
    active: { ring: "ring-rose-200", dot: "bg-rose-400", animate: true },
    past: { ring: "ring-amber-200", dot: "bg-amber-400", animate: false },
    clear: { ring: "ring-emerald-200", dot: "bg-emerald-400", animate: false },
  }[state];
  return (
    <span
      className={`flex h-7 w-7 items-center justify-center rounded-full ring-2 ${config.ring}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${config.dot} ${config.animate ? "animate-pulse" : ""}`}
      />
    </span>
  );
}

// ─── Formatting ───────────────────────────────────────────────────────────────

function formatDuration(run: IncidentRun): string {
  const hours = run.hourCount;
  if (hours < 1) return "< 1 hour";
  if (hours === 1) return "1 hour";
  if (hours < 24) return `${hours} hours`;
  const days = Math.floor(hours / 24);
  const rem = hours % 24;
  return rem === 0 ? `${days}d` : `${days}d ${rem}h`;
}

function formatWindow(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const sameDay =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth() &&
    start.getUTCDate() === end.getUTCDate();
  const startStr = `${fmtClock(startIso)} UTC, ${monthDay(start)}`;
  const endStr = sameDay
    ? fmtClock(endIso)
    : `${fmtClock(endIso)} UTC, ${monthDay(end)}`;
  return `${startStr} → ${endStr}`;
}

function fmtClock(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

function monthDay(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}