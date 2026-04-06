"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Variants } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";

// ─── Static plan data (canonical — mirrors plan-config.ts) ───────────────────

type Duration = "daily" | "weekly" | "semester";

const PRICES: Record<string, Record<Duration, string>> = {
  cooked:    { daily: "2.99",  weekly: "4.99",  semester: "14.99" },
  cruising:  { daily: "3.99",  weekly: "6.99",  semester: "19.99" },
  locked_in: { daily: "4.99",  weekly: "9.99",  semester: "29.99" },
};

const TIERS = [
  {
    id: "cooked",
    name: "Cooked",
    tagline: "All-nighter mode. One shot.",
    color: "text-amber-400",
    borderHover: "hover:border-amber-400/30",
    features: [
      "1 Z session / day",
      "2 quiz generations / day",
      "2 flashcard sets / day",
      "1 mind map / day",
      "1 upload / day",
      "Basic analytics",
    ],
    notIncluded: ["PDF export", "Priority processing"],
  },
  {
    id: "cruising",
    name: "Cruising",
    tagline: "Steady grind. Mid-semester flow.",
    color: "text-sky-400",
    borderHover: "hover:border-sky-400/40",
    popular: true,
    features: [
      "3 Z sessions / day",
      "5 quiz generations / day",
      "5 flashcard sets / day",
      "3 mind maps / day",
      "3 uploads / day",
      "Full analytics",
      "PDF export",
      "10 bonus credits",
    ],
    notIncluded: ["Priority processing"],
  },
  {
    id: "locked_in",
    name: "Locked In",
    tagline: "Unlimited. Zero excuses.",
    color: "text-primary",
    borderHover: "hover:border-primary/40",
    features: [
      "Unlimited Z sessions",
      "Unlimited quizzes",
      "Unlimited flashcard sets",
      "Unlimited mind maps",
      "Unlimited uploads",
      "Full analytics",
      "PDF export",
      "Priority processing",
      "Early feature access",
      "25 bonus credits",
    ],
    notIncluded: [],
  },
];

const DURATION_LABELS: Record<Duration, string> = {
  daily: "Daily",
  weekly: "Weekly",
  semester: "Semester",
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } },
};

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({
  tier,
  price,
  duration,
}: {
  tier: (typeof TIERS)[number];
  price: string;
  duration: Duration;
}) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const ctaHref = user ? "/app/billing" : "/login";

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "relative flex flex-col border bg-card/30 p-6 transition-colors duration-300 rounded-(--radius)",
        tier.popular
          ? "border-sky-400/30 bg-sky-400/[0.03]"
          : "border-border/50",
        tier.borderHover,
      )}
    >
      {tier.popular && (
        <div className="absolute -top-3 left-6">
          <div className="border border-sky-400/50 bg-background px-2 py-0.5">
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-sky-400">
              Most popular
            </span>
          </div>
        </div>
      )}

      {/* Tier label + tagline */}
      <div className="mb-4">
        <p className={cn("text-[10px] font-mono uppercase tracking-[0.2em] mb-1", tier.color)}>
          {tier.name}
        </p>
        <p className="text-xs text-muted-foreground font-mono leading-relaxed">
          {tier.tagline}
        </p>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-5">
        <span className="text-4xl font-black tracking-tighter">{price}</span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">GHS</span>
          <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">
            / {DURATION_LABELS[duration].toLowerCase()}
          </span>
        </div>
      </div>

      <div className="h-px w-full bg-border/40 mb-5" />

      {/* Features */}
      <ul className="flex flex-col gap-2 flex-1 mb-6">
        {tier.features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <Check className={cn("size-3 shrink-0", tier.color)} />
            <span className="text-xs font-mono text-foreground/80">{f}</span>
          </li>
        ))}
        {tier.notIncluded.map((f) => (
          <li key={f} className="flex items-center gap-2 opacity-30">
            <span className="size-3 shrink-0 flex items-center justify-center text-[10px] text-muted-foreground">—</span>
            <span className="text-xs font-mono text-muted-foreground line-through">{f}</span>
          </li>
        ))}
      </ul>

      {isSuperAdmin ? (
        <div className={cn(
          "w-full py-2.5 text-[10px] font-mono uppercase tracking-[0.15em] border text-center rounded-(--radius) opacity-50 cursor-default",
          "border-border/40 text-muted-foreground",
        )}>
          Admin Access
        </div>
      ) : (
        <Link
          href={ctaHref}
          className={cn(
            "w-full py-2.5 text-[10px] font-mono uppercase tracking-[0.15em] border transition-colors text-center block rounded-(--radius)",
            tier.id === "locked_in"
              ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
              : tier.id === "cruising"
              ? "border-sky-400/50 text-sky-400 hover:bg-sky-400/10"
              : "border-border/60 text-foreground hover:border-amber-400/50 hover:text-amber-400",
          )}
        >
          Get started
        </Link>
      )}
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function Pricing() {
  const [duration, setDuration] = useState<Duration>("weekly");

  return (
    <section id="pricing" className="py-24 md:py-32 bg-background border-b border-border/50">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } }}
          viewport={{ once: true, margin: "-80px" }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary mb-3">
                Pricing
              </p>
              <h2 className="text-3xl md:text-4xl font-black tracking-[-0.04em] text-foreground uppercase leading-[1.1]">
                Pick your grind level.
              </h2>
              <p className="mt-3 text-sm text-muted-foreground font-mono max-w-md">
                All plans include free tier fallback. Upgrade when you need more. Cancel anytime.
              </p>
            </div>
            <Link
              href="/pricing"
              className="flex items-center gap-2 text-xs font-mono text-primary uppercase tracking-[0.15em] hover:gap-3 transition-all"
            >
              See full comparison <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="h-px w-full bg-border/50" />
        </motion.div>

        {/* Duration toggle */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.4 } }}
          viewport={{ once: true }}
          className="mb-8 flex gap-0 border border-border/50 w-fit"
        >
          {(["daily", "weekly", "semester"] as Duration[]).map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={cn(
                "px-5 py-2 text-[10px] font-mono uppercase tracking-[0.15em] transition-colors border-r border-border/50 last:border-r-0",
                duration === d
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {DURATION_LABELS[d]}
              {d === "semester" && (
                <span className="ml-1.5 text-[8px] text-amber-400/80">Best value</span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
        >
          {TIERS.map((tier) => (
            <PlanCard
              key={tier.id}
              tier={tier}
              price={PRICES[tier.id][duration]}
              duration={duration}
            />
          ))}
        </motion.div>

        {/* Free tier + credits footnotes */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1, transition: { delay: 0.2 } }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between border-t border-border/30 pt-6"
        >
          <p className="text-xs font-mono text-muted-foreground">
            <span className="text-foreground font-semibold">Free tier included</span> — 1 Z session, 2 quizzes, 2 flashcard sets, 1 mind map per day. No card required.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <Zap className="size-3 text-amber-400" />
            <span className="text-xs font-mono text-muted-foreground">
              Need more? Top up with{" "}
              <Link href="/pricing#credits" className="text-amber-400 hover:underline underline-offset-2">
                pay-as-you-go credits
              </Link>
            </span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
