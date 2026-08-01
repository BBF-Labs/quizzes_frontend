"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Zap, GraduationCap, ChevronRight } from "lucide-react";
import {
  usePackages,
  useCreditBundles,
  useBillingStatus,
  useStudentVerifyStatus,
  type PlanDuration,
  type BillingPackage,
} from "@/hooks";
import { ReferralCard } from "@/components/common";
import { cn } from "@/lib/utils";

const PLAN_TIER_META: Record<
  string,
  { label: string; tagline: string; tone: "amber" | "blue" | "ink" }
> = {
  cooked: { label: "Cooked", tagline: "All-nighter mode. One shot.", tone: "amber" },
  cruising: { label: "Cruising", tagline: "Steady grind. Mid-semester flow.", tone: "blue" },
  locked_in: { label: "Locked In", tagline: "Unlimited. Zero excuses.", tone: "ink" },
};

const DURATION_LABEL: Record<PlanDuration, string> = {
  daily: "Daily",
  weekly: "Weekly",
  semester: "Semester",
};

const DURATION_SUFFIX: Record<PlanDuration, string> = {
  daily: "/ day",
  weekly: "/ week",
  semester: "/ semester",
};

const TIER_ORDER: Record<string, number> = { cooked: 0, cruising: 1, locked_in: 2 };

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({
  pkg,
  isPopular,
  isCurrent,
  onSelect,
  loading,
}: {
  pkg: BillingPackage;
  isPopular: boolean;
  isCurrent: boolean;
  onSelect: (pkg: BillingPackage) => void;
  loading: boolean;
}) {
  const meta = PLAN_TIER_META[pkg.tier] ?? {
    label: pkg.tier,
    tagline: "",
    tone: "ink" as const,
  };

  const features = useMemo(() => buildFeatures(pkg), [pkg]);
  const missing = useMemo(() => buildMissing(pkg), [pkg]);

  return (
    <article
      className={cn(
        "play-card relative flex flex-col rounded-[28px] p-7 transition",
        meta.tone === "blue"
          ? "bg-[#0C60FC] text-white shadow-2xl shadow-blue-200"
          : "border border-slate-200 bg-white text-slate-900",
      )}
      style={{ borderRadius: "28px" }}
    >
      {isPopular && (
        <span className="absolute -top-3 left-7 rounded-full bg-[#DFFF61] px-3 py-1 text-[10px] font-extrabold text-slate-900">
          Most popular
        </span>
      )}
      {isCurrent && (
        <span className="absolute -top-3 left-7 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-extrabold text-emerald-700 ring-1 ring-emerald-200">
          Current plan
        </span>
      )}

      <h2 className={cn("display text-xl font-bold", meta.tone === "blue" ? "text-white" : "text-slate-950")}>
        {meta.label}
      </h2>
      <p className={cn("mt-1 text-sm", meta.tone === "blue" ? "text-blue-100" : "text-slate-500")}>
        {meta.tagline}
      </p>

      <p className="mt-6 flex items-end gap-1">
        <span className={cn("text-xs font-bold", meta.tone === "blue" ? "text-blue-200" : "text-slate-400")}>
          GHS
        </span>
        <span className={cn("display text-4xl font-bold", meta.tone === "blue" ? "text-white" : "text-slate-950")}>
          {pkg.priceGHS.toFixed(2)}
        </span>
        <span className={cn("mb-1 text-xs font-bold", meta.tone === "blue" ? "text-blue-200" : "text-slate-400")}>
          {DURATION_SUFFIX[pkg.durationType]}
        </span>
      </p>

      <ul className="mt-6 space-y-2.5 text-sm">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <b className={meta.tone === "blue" ? "text-[#DFFF61]" : "text-emerald-500"}>✓</b>
            <span className={meta.tone === "blue" ? "text-blue-50" : "text-slate-700"}>{f}</span>
          </li>
        ))}
        {missing.map((f) => (
          <li
            key={f}
            className={cn("flex gap-2", meta.tone === "blue" ? "text-blue-200/70" : "text-slate-300")}
          >
            <b>—</b>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <button
          type="button"
          onClick={() => onSelect(pkg)}
          disabled={isCurrent || loading}
          className={cn(
            "w-full rounded-2xl py-3.5 text-center text-sm font-extrabold transition flex items-center justify-center gap-2",
            isCurrent
              ? "border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
              : meta.tone === "blue"
                ? "squishy bg-white text-blue-700 hover:-translate-y-0.5"
                : meta.tone === "ink"
                  ? "bg-slate-950 text-white hover:bg-[#0C60FC]"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
          )}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isCurrent ? (
            "Active plan"
          ) : (
            <>Upgrade to {meta.label}</>
          )}
        </button>
      </div>
    </article>
  );
}

function buildFeatures(pkg: BillingPackage): string[] {
  const f: string[] = [];
  f.push(
    pkg.limits.tutorSessionsPerDay === null
      ? "Unlimited Z sessions"
      : `${pkg.limits.tutorSessionsPerDay} Z session${pkg.limits.tutorSessionsPerDay !== 1 ? "s" : ""} / day`,
  );
  f.push(
    pkg.limits.quizGenerationsPerDay === null
      ? "Unlimited quizzes"
      : `${pkg.limits.quizGenerationsPerDay} quiz generation${pkg.limits.quizGenerationsPerDay !== 1 ? "s" : ""} / day`,
  );
  f.push(
    pkg.limits.flashcardSetsPerDay === null
      ? "Unlimited flashcard sets"
      : `${pkg.limits.flashcardSetsPerDay} flashcard set${pkg.limits.flashcardSetsPerDay !== 1 ? "s" : ""} / day`,
  );
  f.push(
    pkg.limits.mindMapsPerDay === null
      ? "Unlimited mind maps"
      : `${pkg.limits.mindMapsPerDay} mind map${pkg.limits.mindMapsPerDay !== 1 ? "s" : ""} / day`,
  );
  f.push(
    pkg.limits.materialUploadsPerDay === null
      ? "Unlimited uploads"
      : `${pkg.limits.materialUploadsPerDay} upload${pkg.limits.materialUploadsPerDay !== 1 ? "s" : ""} / day`,
  );
  f.push(pkg.tier === "cooked" ? "Basic analytics" : "Full analytics");
  if (pkg.limits.pdfExport) f.push("PDF export");
  if (pkg.tier === "locked_in") f.push("Priority processing", "Early feature access");
  if (pkg.limits.bonusCreditsOnSignup > 0)
    f.push(`${pkg.limits.bonusCreditsOnSignup} bonus credits`);
  return f;
}

function buildMissing(pkg: BillingPackage): string[] {
  const m: string[] = [];
  if (!pkg.limits.pdfExport) m.push("PDF export");
  if (pkg.tier !== "locked_in") m.push("Priority processing");
  return m;
}

// ─── Credit bundle card ────────────────────────────────────────────────────────

function CreditBundleCard({
  bundle,
  onSelect,
}: {
  bundle: { _id: string; name: string; priceGHS: number; credits: number };
  onSelect: (id: string) => void;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm flex flex-col justify-between">
      <div>
        <span className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-blue-50 text-blue-700 text-lg font-bold">
          ⚡
        </span>
        <h3 className="mt-3 text-base font-extrabold text-slate-950">{bundle.name}</h3>
        <p className="mt-2 text-2xl font-extrabold text-slate-950">GHS {bundle.priceGHS}</p>
        <p className="mt-1 text-xs text-slate-500">{bundle.credits} extra generation credits</p>
      </div>
      <button
        type="button"
        onClick={() => onSelect(bundle._id)}
        className="mt-5 w-full rounded-xl bg-slate-950 py-2.5 text-xs font-extrabold text-white hover:bg-[#0C60FC] transition"
      >
        Buy {bundle.credits} credits
      </button>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const router = useRouter();
  const [duration, setDuration] = useState<PlanDuration>("weekly");
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const { data: allPackages = [], isLoading: pkgsLoading } = usePackages();
  const { data: creditBundles = [], isLoading: bundlesLoading } = useCreditBundles();
  const { data: billingStatus } = useBillingStatus();
  const { data: studentStatus } = useStudentVerifyStatus();

  const filtered = allPackages.filter((p) => p.durationType === duration && p.isActive);
  const sorted = [...filtered].sort((a, b) => (TIER_ORDER[a.tier] ?? 0) - (TIER_ORDER[b.tier] ?? 0));

  function handleSelectPlan(pkg: BillingPackage) {
    if (loadingTier) return;
    setLoadingTier(pkg.tier);
    // Match the public pricing flow: route to checkout. The page
    // pre-resolves the package id (matches `useInitiatePlanPayment`).
    router.push(`/app/billing/checkout?packageId=${pkg._id}`);
  }

  function handleSelectBundle(bundleId: string) {
    router.push(`/app/billing/checkout?bundleId=${bundleId}`);
  }

  const isVerifiedStudent = studentStatus?.status === "verified";

  return (
    <div className="qz-app min-h-full bg-[#F7F9FC] text-slate-900 antialiased">
      {/* Header / Hero — same vocabulary as /app/library + landing pricing */}
      <header className="border-b border-slate-200 bg-white px-6 pt-8 pb-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#0C60FC]">
              Plans &amp; Billing
            </p>
            <h1 className="display mt-2 text-3xl font-bold leading-tight sm:text-4xl">
              Level up your grind.
            </h1>
            <p className="hand mt-1 text-xl text-[#0C60FC]">
              pick a plan, beat your best ✦
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            {billingStatus?.planTier ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                On {PLAN_TIER_META[billingStatus.planTier]?.label ?? billingStatus.planTier}
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-3 py-1.5">Free tier</span>
            )}
            {billingStatus?.credits?.balance !== undefined && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 ring-1 ring-amber-200">
                <Zap className="h-3.5 w-3.5" />
                {billingStatus.credits.balance} credits
              </span>
            )}
          </div>
        </div>

        {/* Cycle selector — same chip pill style as /app/courses */}
        <div className="mx-auto mt-6 flex max-w-7xl flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 w-20 shrink-0">
            Cycle
          </span>
          {(["daily", "weekly", "semester"] as PlanDuration[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-bold transition inline-flex items-center gap-1.5",
                duration === d
                  ? "bg-slate-950 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
              )}
            >
              {DURATION_LABEL[d]}
              {d === "semester" && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[9px] font-extrabold",
                    duration === d ? "bg-[#DFFF61] text-slate-900" : "bg-[#DFFF61] text-slate-900",
                  )}
                >
                  Best value
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Plan cards */}
      <section className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {pkgsLoading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#0C60FC]" />
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                Loading plans…
              </p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20">
              <p className="text-sm font-bold text-slate-700">No plans available</p>
              <p className="mt-1 max-w-sm text-center text-xs font-semibold text-slate-500">
                We couldn&apos;t find any plans for this cycle. Try a different cycle or check back later.
              </p>
            </div>
          ) : (
            <motion.div
              className="grid gap-5 lg:grid-cols-3"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06 } },
              }}
              initial="hidden"
              animate="visible"
            >
              {sorted.map((pkg) => (
                <PlanCard
                  key={pkg._id}
                  pkg={pkg}
                  isPopular={pkg.tier === "cruising"}
                  isCurrent={
                    billingStatus?.planTier === pkg.tier &&
                    billingStatus?.planDuration === pkg.durationType
                  }
                  loading={loadingTier === pkg.tier}
                  onSelect={handleSelectPlan}
                />
              ))}
            </motion.div>
          )}

          {/* Free-tier note */}
          <p className="mx-auto mt-6 max-w-3xl rounded-2xl bg-[#F7F9FC] px-5 py-4 text-center text-xs font-semibold text-slate-500">
            Free tier — always available. 1 Z session / day, 2 quizzes / day, 2 flashcard sets / day, 1 mind map / day. No card required.
          </p>
        </div>
      </section>

      {/* Credit bundles */}
      {creditBundles.length > 0 && (
        <section className="bg-[#F7F9FC] px-6 py-12 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="hand text-2xl text-[#0C60FC]">need extra generations? ✦</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
                Pay-as-you-go Credits
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Credits never expire. Top up anytime for extra quizzes and flashcards.
              </p>
            </div>

            {bundlesLoading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 mt-8">
                <Loader2 className="mb-3 h-6 w-6 animate-spin text-[#0C60FC]" />
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  Loading bundles…
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {creditBundles.map((bundle) => (
                  <CreditBundleCard
                    key={bundle._id}
                    bundle={bundle}
                    onSelect={handleSelectBundle}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Discounts & rewards — dark band, same as landing pricing */}
      <section className="relative overflow-hidden bg-slate-950 px-6 py-16 text-white lg:px-8">
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-[#DFFF61]/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <p className="hand text-3xl text-[#DFFF61]">consistency literally pays ✦</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Discounts &amp; rewards
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Stack discounts up to 30% off. Stay consistent and Qz rewards you.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-3xl font-extrabold text-[#DFFF61]">10% off</p>
              <p className="mt-3 text-sm font-bold text-white">Student</p>
              <p className="mt-1 text-xs text-slate-400">Verify your university email</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-3xl font-extrabold text-[#DFFF61]">15% off</p>
              <p className="mt-3 text-sm font-bold text-white">Referral</p>
              <p className="mt-1 text-xs text-slate-400">Earn when a friend subscribes</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-3xl font-extrabold text-[#DFFF61]">10% off</p>
              <p className="mt-3 text-sm font-bold text-white">7-day streak</p>
              <p className="mt-1 text-xs text-slate-400">Keep your streak going</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-3xl font-extrabold text-[#DFFF61]">20% off</p>
              <p className="mt-3 text-sm font-bold text-white">30-day streak</p>
              <p className="mt-1 text-xs text-slate-400">On your next renewal</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-3xl font-extrabold text-[#DFFF61]">30% off</p>
              <p className="mt-3 text-sm font-bold text-white">60-day streak</p>
              <p className="mt-1 text-xs text-slate-400">Or a free week — loyalty milestone</p>
            </article>
            <article className="rounded-2xl bg-[#0C60FC] p-6 shadow-2xl shadow-blue-500/30">
              <p className="text-3xl font-extrabold text-white">15% forever</p>
              <p className="mt-3 text-sm font-bold text-white">90-day streak</p>
              <p className="mt-1 text-xs text-blue-100">Lifetime loyalty discount</p>
            </article>
          </div>

          {isVerifiedStudent ? (
            <p className="mx-auto mt-10 max-w-3xl text-center text-xs font-semibold text-emerald-300">
              ✦ Student discount active — your 10% discount is applied automatically at checkout.
            </p>
          ) : (
            <p className="mx-auto mt-10 max-w-3xl text-center text-xs font-semibold text-slate-400">
              Student discount — verify your university email in settings after signing up.
            </p>
          )}
        </div>
      </section>

      {/* Referral */}
      <section className="px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ReferralCard />
        </div>
      </section>

      {/* Student verification nudge — only when unverified */}
      {!isVerifiedStudent && (
        <section className="px-6 pb-10 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <button
              type="button"
              onClick={() => router.push("/app/settings?tab=verification")}
              className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-left transition hover:border-amber-300 hover:bg-amber-100"
            >
              <span className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-600 ring-1 ring-amber-200">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-extrabold text-slate-900">
                    Verify your university email
                  </span>
                  <span className="block text-xs font-semibold text-slate-600">
                    Get 10% off every plan, automatically applied at checkout.
                  </span>
                </span>
              </span>
              <ChevronRight className="h-5 w-5 text-amber-600 transition group-hover:translate-x-0.5" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}