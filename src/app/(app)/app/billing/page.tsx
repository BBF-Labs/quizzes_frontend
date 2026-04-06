"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Zap, BookOpen, Brain, FileText, Upload, Flame, Star } from "lucide-react";
import { usePackages, useCreditBundles, useBillingStatus, type PlanDuration, type BillingPackage } from "@/hooks";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER_LABELS: Record<string, { label: string; tagline: string; color: string; borderHover: string }> = {
  cooked:    { label: "Cooked",    tagline: "All-nighter mode. One shot.",      color: "text-amber-400", borderHover: "hover:border-amber-400/30" },
  cruising:  { label: "Cruising",  tagline: "Steady grind. Mid-semester flow.", color: "text-sky-400",   borderHover: "hover:border-sky-400/40" },
  locked_in: { label: "Locked In", tagline: "Unlimited. Zero excuses.",         color: "text-primary",   borderHover: "hover:border-primary/40" },
};


const DURATION_LABELS: Record<PlanDuration, string> = {
  daily:    "Daily",
  weekly:   "Weekly",
  semester: "Semester",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFeaturesList(pkg: BillingPackage) {
  const f = [];
  f.push(pkg.limits.tutorSessionsPerDay === null ? "Unlimited Z sessions" : `${pkg.limits.tutorSessionsPerDay} Z session${pkg.limits.tutorSessionsPerDay !== 1 ? 's' : ''} / day`);
  f.push(pkg.limits.quizGenerationsPerDay === null ? "Unlimited quizzes" : `${pkg.limits.quizGenerationsPerDay} quiz generation${pkg.limits.quizGenerationsPerDay !== 1 ? 's' : ''} / day`);
  f.push(pkg.limits.flashcardSetsPerDay === null ? "Unlimited flashcard sets" : `${pkg.limits.flashcardSetsPerDay} flashcard set${pkg.limits.flashcardSetsPerDay !== 1 ? 's' : ''} / day`);
  f.push(pkg.limits.mindMapsPerDay === null ? "Unlimited mind maps" : `${pkg.limits.mindMapsPerDay} mind map${pkg.limits.mindMapsPerDay !== 1 ? 's' : ''} / day`);
  f.push(pkg.limits.materialUploadsPerDay === null ? "Unlimited uploads" : `${pkg.limits.materialUploadsPerDay} upload${pkg.limits.materialUploadsPerDay !== 1 ? 's' : ''} / day`);
  f.push(pkg.tier === 'cooked' ? "Basic analytics" : "Full analytics");
  if (pkg.limits.pdfExport) f.push("PDF export");
  if (pkg.tier === 'locked_in') f.push("Priority processing", "Early feature access");
  if (pkg.limits.bonusCreditsOnSignup > 0) f.push(`${pkg.limits.bonusCreditsOnSignup} bonus credits`);
  return f;
}

function getNotIncluded(pkg: BillingPackage) {
  const missing = [];
  if (!pkg.limits.pdfExport) missing.push("PDF export");
  if (pkg.tier !== 'locked_in') missing.push("Priority processing");
  return missing;
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({
  pkg,
  isPopular,
  isCurrent,
  delay,
  onSelect,
}: {
  pkg: BillingPackage;
  isPopular: boolean;
  isCurrent: boolean;
  delay: number;
  onSelect: (pkg: BillingPackage) => void;
}) {
  const meta = TIER_LABELS[pkg.tier] ?? { label: pkg.tier, tagline: "", color: "text-foreground" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        "relative flex flex-col border bg-card/30 p-6 transition-colors duration-300 rounded-(--radius)",
        isCurrent ? "border-primary/60 bg-primary/5" : "border-border/50",
        isPopular && !isCurrent && "border-sky-400/30 bg-sky-400/[0.03]",
        !isCurrent && meta.borderHover
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-5">
          <div className="border border-sky-400/60 bg-background px-2 py-0.5">
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-sky-400">
              Most popular
            </span>
          </div>
        </div>
      )}
      {isCurrent && (
        <div className="absolute -top-3 left-5">
          <div className="border border-primary/60 bg-background px-2 py-0.5">
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-primary">
              Current plan
            </span>
          </div>
        </div>
      )}

      <div>
        <p className={cn("text-[10px] font-mono uppercase tracking-[0.2em] mb-1", meta.color)}>
          {meta.label}
        </p>
        <p className="text-xs text-muted-foreground font-mono">{meta.tagline}</p>
      </div>

      <div className="flex items-baseline gap-1 mb-5">
        <span className="text-4xl font-black tracking-tighter">
          {pkg.priceGHS.toFixed(2)}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">GHS</span>
          <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">
            / {DURATION_LABELS[pkg.durationType].toLowerCase()}
          </span>
        </div>
      </div>

      <div className="h-px w-full bg-border/40 mb-5" />

      <ul className="flex flex-col gap-2 flex-1 mb-6">
        {getFeaturesList(pkg).map((f) => (
          <li key={f} className="flex items-center gap-2">
            <Check className={cn("size-3 shrink-0", meta.color)} />
            <span className="text-xs font-mono text-foreground/80">{f}</span>
          </li>
        ))}
        {getNotIncluded(pkg).map((f) => (
          <li key={f} className="flex items-center gap-2 opacity-30">
            <span className="size-3 shrink-0 flex items-center justify-center text-[10px] text-muted-foreground">—</span>
            <span className="text-xs font-mono text-muted-foreground line-through">{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(pkg)}
        disabled={isCurrent}
        className={cn(
          "w-full py-2.5 text-[10px] font-mono uppercase tracking-[0.15em] border transition-colors text-center block rounded-(--radius)",
          isCurrent
            ? "border-border/30 text-muted-foreground cursor-not-allowed"
            : pkg.tier === "locked_in"
            ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
            : pkg.tier === "cruising"
            ? "border-sky-400/50 text-sky-400 hover:bg-sky-400/10"
            : "border-border/60 text-foreground hover:border-amber-400/50 hover:text-amber-400",
        )}
      >
        {isCurrent ? "Active" : "Get started"}
      </button>
    </motion.div>
  );
}

// ─── Credit Bundle Cards ──────────────────────────────────────────────────────

function CreditBundleCard({
  bundle,
  onSelect,
  delay,
}: {
  bundle: { _id: string; name: string; priceGHS: number; credits: number };
  onSelect: (id: string) => void;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="border border-border/50 bg-card/40 p-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">
          {bundle.name}
        </span>
        <Zap className="size-3 text-amber-400" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black tracking-tighter">{bundle.credits}</span>
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">credits</span>
      </div>
      <div className="text-xs font-mono text-muted-foreground">
        GHS {bundle.priceGHS.toFixed(2)}
      </div>
      <button
        onClick={() => onSelect(bundle._id)}
        className="w-full py-2 text-[10px] font-mono uppercase tracking-[0.15em] border border-border hover:border-amber-400/60 hover:text-amber-400 transition-colors"
      >
        Buy credits
      </button>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [duration, setDuration] = useState<PlanDuration>("weekly");

  const { data: allPackages = [], isLoading: pkgsLoading } = usePackages();
  const { data: creditBundles = [], isLoading: bundlesLoading } = useCreditBundles();
  const { data: billingStatus } = useBillingStatus();

  const filtered = allPackages.filter((p) => p.durationType === duration && p.isActive);
  const tierOrder: Record<string, number> = { cooked: 0, cruising: 1, locked_in: 2 };
  const sorted = [...filtered].sort((a, b) => (tierOrder[a.tier] ?? 0) - (tierOrder[b.tier] ?? 0));

  function handleSelectPlan(pkg: BillingPackage) {
    router.push(`/app/billing/checkout?packageId=${pkg._id}`);
  }

  function handleSelectBundle(bundleId: string) {
    router.push(`/app/billing/checkout?bundleId=${bundleId}`);
  }

  return (
    <div className="min-h-full px-4 py-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="inline-block border border-primary/40 bg-primary/5 px-2 py-1 mb-4">
            <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-primary">
              Plans & Billing
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter">Level up your grind.</h1>
          <p className="mt-2 text-sm text-muted-foreground font-mono max-w-md">
            Pick a plan that matches your hustle. Cancel anytime.
          </p>
          <div className="mt-4 h-px w-10 bg-primary/40" />
        </motion.div>

        {/* Current plan badge */}
        {billingStatus?.planTier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex items-center gap-3 border border-primary/20 bg-primary/5 px-4 py-3"
          >
            <Flame className="size-4 text-primary" />
            <span className="text-xs font-mono text-foreground">
              You&apos;re on{" "}
              <span className="text-primary font-semibold">
                {TIER_LABELS[billingStatus.planTier]?.label ?? billingStatus.planTier}
              </span>{" "}
              ({DURATION_LABELS[billingStatus.planDuration!]})
              {billingStatus.subscriptionEndsAt && (
                <span className="text-muted-foreground">
                  {" "}· Renews {new Date(billingStatus.subscriptionEndsAt).toLocaleDateString()}
                </span>
              )}
            </span>
          </motion.div>
        )}

        {/* Duration toggle */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 flex gap-0 border border-border/50 w-fit"
        >
          {(["daily", "weekly", "semester"] as PlanDuration[]).map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={cn(
                "px-4 py-2 text-[10px] font-mono uppercase tracking-[0.15em] transition-colors border-r border-border/50 last:border-r-0",
                duration === d
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {DURATION_LABELS[d]}
              {d === "semester" && (
                <span className="ml-1.5 text-[8px] text-amber-400/80">Save more</span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Plan cards */}
        {pkgsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 animate-pulse bg-card/40 border border-border/30" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {sorted.map((pkg, i) => (
              <PlanCard
                key={pkg._id}
                pkg={pkg}
                isPopular={pkg.tier === "cruising"}
                isCurrent={
                  billingStatus?.planTier === pkg.tier &&
                  billingStatus?.planDuration === pkg.durationType
                }
                delay={0.2 + i * 0.05}
                onSelect={handleSelectPlan}
              />
            ))}
          </div>
        )}

        {/* Free tier note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mb-12 border border-border/30 bg-card/20 px-4 py-3"
        >
          <p className="text-xs font-mono text-muted-foreground">
            <span className="text-foreground font-semibold">Free tier</span> — 1 Z session / day, 2 quizzes / day, 2 flashcard sets / day, 1 mind map / day. No card required.
          </p>
        </motion.div>

        {/* Credits section */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-4"
        >
          <div className="flex items-center gap-3 mb-1">
            <Zap className="size-4 text-amber-400" />
            <span className="text-sm font-black tracking-tighter">Pay-as-you-go credits</span>
          </div>
          <p className="text-xs text-muted-foreground font-mono mb-5">
            Top up credits to use features beyond your daily plan limit. Credits never expire.
          </p>

          {billingStatus && (
            <div className="mb-4 text-xs font-mono text-muted-foreground">
              Balance:{" "}
              <span className="text-amber-400 font-semibold">{billingStatus.credits.balance}</span> credits
            </div>
          )}

          {bundlesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse bg-card/40 border border-border/30" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {creditBundles.map((b, i) => (
                <CreditBundleCard
                  key={b._id}
                  bundle={b}
                  onSelect={handleSelectBundle}
                  delay={0.45 + i * 0.05}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Student discount nudge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 border border-border/20 bg-card/20 px-4 py-3 flex items-start gap-3"
        >
          <span className="text-xs font-mono text-muted-foreground">
            <span className="text-foreground font-semibold">Student?</span> Verify your university email for 10% off.{" "}
            <button
              onClick={() => router.push("/app/settings?tab=verification")}
              className="text-primary underline underline-offset-2 hover:no-underline"
            >
              Verify now
            </button>
          </span>
        </motion.div>

      </div>
    </div>
  );
}
