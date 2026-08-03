"use client";

import { AlertTriangle } from "lucide-react";
import { LandingHeader, LandingFooter, MobileNav } from "@/components/landing";
import { StatusBanner } from "@/components/common/status-banner";
import { ComponentStatusCard } from "@/components/common/component-status-card";
import { StatusTimeline } from "@/components/common/status-timeline";
import { IncidentFeed } from "@/components/common/incident-feed";
import { IncidentReportForm } from "@/components/common/incident-report-form";
import { CommunityReportsPanel } from "@/components/common/community-reports-panel";
import { HowWeCheckCard } from "@/components/common/how-we-check-card";
import {
  useGlobalStatus,
  useStatusHistory,
  useStatusIncidents,
} from "@/hooks/common/use-status";

// Client-driven page — TanStack Query polls every 30s (live) and 60s (history
// + incidents). No ISR needed: the page itself is the polling loop, and SSR
// would just double-fetch on mount.
export default function StatusPage() {
  const status = useGlobalStatus();
  const history = useStatusHistory(24);
  const incidents = useStatusIncidents(24);

  return (
    <div className="overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <LandingHeader />

      <main>
        {/* ─── Live status (banner + components) ──────────────────────── */}
        <section className="soft-grid relative overflow-hidden px-5 pb-20 pt-12 sm:pt-14 lg:pb-24 lg:pt-20">
          <div className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-violet-100/70 blur-3xl" />

          <div className="relative mx-auto max-w-7xl">
            {status.isPending ? (
              <StatusLoading />
            ) : status.data ? (
              <>
                <StatusBanner
                  state={status.data.state}
                  label={status.data.label}
                  generatedAt={status.data.generatedAt}
                />
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {status.data.components.map((c) => (
                    <ComponentStatusCard key={c.id} component={c} />
                  ))}
                </div>
              </>
            ) : (
              <StatusUnavailable />
            )}
          </div>
        </section>

        {/* ─── Status history ──────────────────────────────────────────── */}
        <section className="bg-[#F7F9FC] px-5 py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl px-2 text-center sm:px-0">
              <p className="hand hand-wiggle text-2xl text-[#0C60FC] sm:text-3xl">
                hour by hour, no smoke ✦
              </p>
              <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-5xl">
                Past 24 hours,{" "}
                <span className="scribble">spelled out.</span>
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-sm leading-7 text-slate-600 sm:text-base">
                Each bar is one hour. Green is healthy, amber is slow, rose is
                unresponsive. Tap any bar for the exact reading.
              </p>
            </div>
            <div className="mt-8 sm:mt-12">
              {history.isPending ? (
                <div className="h-40 animate-pulse rounded-[28px] border border-slate-200 bg-white" />
              ) : history.data ? (
                <StatusTimeline history={history.data} />
              ) : null}
            </div>
          </div>
        </section>

        {/* ─── Past incidents ──────────────────────────────────────────── */}
        <section className="bg-white px-5 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="hand hand-wiggle text-3xl text-[#0C60FC]">
                the messy stuff, laid out ↘
              </p>
              <h2 className="mt-2 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                What happened,{" "}
                <span className="scribble">service by service.</span>
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-base leading-7 text-slate-600">
                Each collapsible row is one of the four services. Expand for
                the runs we detected and how long they lasted.
              </p>
            </div>
            <div className="mt-12">
              {incidents.isPending ? (
                <div className="h-72 animate-pulse rounded-[28px] border border-slate-200 bg-white" />
              ) : incidents.data ? (
                <IncidentFeed incidents={incidents.data} />
              ) : null}
            </div>
          </div>
        </section>

        {/* ─── Community + Report form ─────────────────────────────────── */}
        <section className="bg-[#F7F9FC] px-5 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="hand hand-wiggle text-3xl text-[#0C60FC]">
                your voice, our dashboard ✦
              </p>
              <h2 className="mt-2 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                Tell us what{" "}
                <span className="scribble">we missed.</span>
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-base leading-7 text-slate-600">
                See what other users are flagging, or drop a quick anonymous
                report. We correlate it with our own probes to triage faster.
              </p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <CommunityReportsPanel />
              <IncidentReportForm />
            </div>
          </div>
        </section>

        {/* ─── How we check ────────────────────────────────────────────── */}
        <section className="bg-white px-5 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <HowWeCheckCard />
          </div>
        </section>
      </main>

      <LandingFooter />
      <MobileNav />
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusLoading() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-[26px] border border-slate-200 bg-slate-50"
        />
      ))}
    </div>
  );
}

function StatusUnavailable() {
  return (
    <div className="mt-6 rounded-[28px] border border-amber-200 bg-[#FFF4D6] p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </span>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-amber-700">
            Status unavailable
          </p>
          <p className="mt-1 text-base font-bold text-slate-950">
            We can&apos;t reach the status right now.
          </p>
          <p className="mt-1 text-sm text-slate-600">
            This page refreshes every 30 seconds. If the banner comes back
            green, we&apos;re good again.
          </p>
        </div>
      </div>
    </div>
  );
}