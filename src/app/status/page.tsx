import { AlertTriangle, Activity, ArrowUpRight } from "lucide-react";
import { LandingHeader, LandingFooter, MobileNav } from "@/components/landing";
import { StatusBanner } from "@/components/common/status-banner";
import { ComponentStatusCard } from "@/components/common/component-status-card";
import type { GlobalStatus } from "@/hooks/common/use-status";

// ISR — revalidate every 30s in the background. The fetch below also
// uses `next: { revalidate: 30 }` for belt-and-suspenders.
export const revalidate = 30;

async function fetchStatus(): Promise<GlobalStatus | null> {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  const url = `${base.replace(/\/api\/v1\/?$/, "")}/api/v1/status`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 30, tags: ["status"] },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export default async function StatusPage() {
  const status = await fetchStatus();
  const statusJsonUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "")}/status.json`;

  return (
    <div className="overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <LandingHeader />

      <main>
        <section className="soft-grid relative overflow-hidden px-5 pb-16 pt-32 lg:pt-40">
          <div className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-[#0C60FC]/10 blur-3xl" />

          <div className="relative mx-auto max-w-5xl">
            <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#0C60FC]">
              Live · Qz Status
            </p>
            <h1 className="display mt-4 text-balance text-4xl font-bold leading-[1.07] tracking-[-.04em] sm:text-6xl">
              How Qz is
              <br />
              <span className="scribble">running right now.</span>
            </h1>
            <p className="hand mt-3 text-2xl text-[#0C60FC]">
              if something&apos;s off, you&apos;ll see it here ✦
            </p>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              We poke the bits of Qz that keep your study sessions alive, every
              30 seconds, from our own backend. If any of them stop replying,
              we&apos;ll be the first to know — and so will you.
            </p>

            {status ? (
              <>
                <StatusBanner
                  state={status.state}
                  label={status.label}
                  generatedAt={status.generatedAt}
                />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {status.components.map((c) => (
                    <ComponentStatusCard key={c.id} component={c} />
                  ))}
                </div>
              </>
            ) : (
              <StatusUnavailable />
            )}

            <HowWeCheck />

            <div className="mt-8 flex items-center justify-between gap-4 text-[11px] text-slate-500">
              <a
                href={statusJsonUrl}
                className="inline-flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-[#0C60FC]"
              >
                <Activity className="h-3.5 w-3.5" />
                /status.json
                <ArrowUpRight className="h-3 w-3" />
              </a>
              <span>Public machine-readable feed · Atlassian schema</span>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
      <MobileNav />
    </div>
  );
}

function HowWeCheck() {
  return (
    <div className="mt-12 rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
        How we check
      </p>
      <h3 className="display mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
        We poke it, we measure it, we tell you.
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        Four times a minute, our backend quietly asks each piece of Qz
        &ldquo;are you still there?&rdquo;. A fast, friendly reply is
        <b className="text-emerald-700"> green</b>. A slow reply is{" "}
        <b className="text-amber-700">amber</b>. No reply at all is
        <b className="text-rose-700"> red</b> — and that&apos;s when we drop
        everything.
      </p>
    </div>
  );
}

function StatusUnavailable() {
  return (
    <div className="mt-8 rounded-2xl border border-amber-200 bg-[#FFF4D6] p-6">
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
