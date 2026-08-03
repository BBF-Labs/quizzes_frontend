import { AlertTriangle } from "lucide-react";
import { LandingHeader, LandingFooter, MobileNav } from "@/components/landing";
import { StatusBanner } from "@/components/common/status-banner";
import { ComponentStatusCard } from "@/components/common/component-status-card";
import { QUBI_PEEK_SRC, QUBI_STUDY_SRC, QUBI_RUN_SRC } from "@/lib/constants";
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

const STATE_MASCOTS = {
  operational: { src: QUBI_PEEK_SRC, caption: "everything's fine ↘" },
  partial_outage: { src: QUBI_STUDY_SRC, caption: "we're on it ↘" },
  major_outage: { src: QUBI_RUN_SRC, caption: "fixing now ↘" },
} as const;

export default async function StatusPage() {
  const status = await fetchStatus();

  return (
    <div className="overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <LandingHeader />

      <main>
        <section className="soft-grid relative overflow-hidden px-5 pb-16 pt-32 lg:pt-40">
          <div className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-[#0C60FC]/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl">
            <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#0C60FC]">
              Live · Qz Status
            </p>
            <h1 className="display mt-4 text-balance text-4xl font-bold leading-[1.07] tracking-[-.04em] sm:text-6xl">
              How Qz is
              <br />
              <span className="scribble">running right now.</span>
            </h1>
            <p className="hand mt-3 text-2xl text-[#0C60FC]">
              refreshed every 30s ✦
            </p>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Live probe of the four systems that keep Qz running. Latency is
              measured from our backend — what you see is what we see.
            </p>

            {/* Qubi sticker — position depends on current state */}
            {status && (
              <div className="qubi-sticker absolute -right-2 top-20 hidden md:block">
                <span className="hand absolute -left-28 top-2 hidden w-32 -rotate-6 text-xl leading-5 text-[#0C60FC] sm:block">
                  {STATE_MASCOTS[status.state].caption}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={STATE_MASCOTS[status.state].src}
                  alt="Qubi"
                  className="qubi-bob h-24 w-24 object-contain"
                />
              </div>
            )}

            {status ? (
              <>
                <StatusBanner
                  state={status.state}
                  label={status.label}
                  generatedAt={status.generatedAt}
                />
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {status.components.map((c) => (
                    <ComponentStatusCard key={c.id} component={c} />
                  ))}
                </div>
              </>
            ) : (
              <StatusUnavailable />
            )}

            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600">
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                About this page
              </p>
              <p className="mt-3">
                We probe the four critical systems above every 30 seconds from
                the Qz backend. Operational means the probe succeeded in under
                2 seconds. Degraded means it took longer than 2 seconds. Down
                means it timed out or errored.
              </p>
              <p className="mt-3">
                Powering your own monitoring? Read the public feed at{" "}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-bold text-slate-700">
                  {process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "")}/status.json
                </code>
                {" "}— Atlassian-compatible schema.
              </p>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
      <MobileNav />
    </div>
  );
}

function StatusUnavailable() {
  return (
    <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
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
