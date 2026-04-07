"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Flame } from "lucide-react";
import { usePackages, useCreditBundles, useBillingStatus, type PlanDuration, type BillingPackage } from "@/hooks";
import { cn } from "@/lib/utils";
import { PlanCard, PLAN_TIER_META, PLAN_DURATION_LABELS } from "@/components/common";

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
                {PLAN_TIER_META[billingStatus.planTier]?.label ?? billingStatus.planTier}
              </span>{" "}
              ({PLAN_DURATION_LABELS[billingStatus.planDuration!]})
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
              {PLAN_DURATION_LABELS[d]}
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
