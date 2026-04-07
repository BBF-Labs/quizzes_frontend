"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { type BillingPackage, type PlanDuration } from "@/hooks/common/use-billing";

// ─── Constants ────────────────────────────────────────────────────────────────

export const PLAN_TIER_META: Record<string, { label: string; tagline: string; color: string; borderHover: string }> = {
  cooked:    { label: "Cooked",    tagline: "All-nighter mode. One shot.",      color: "text-amber-400", borderHover: "hover:border-amber-400/30" },
  cruising:  { label: "Cruising",  tagline: "Steady grind. Mid-semester flow.", color: "text-sky-400",   borderHover: "hover:border-sky-400/40" },
  locked_in: { label: "Locked In", tagline: "Unlimited. Zero excuses.",         color: "text-primary",   borderHover: "hover:border-primary/40" },
};

export const PLAN_DURATION_LABELS: Record<PlanDuration, string> = {
  daily:    "Daily",
  weekly:   "Weekly",
  semester: "Semester",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getPlanFeaturesList(pkg: BillingPackage) {
  const f: string[] = [];
  f.push(pkg.limits.tutorSessionsPerDay === null ? "Unlimited Z sessions" : `${pkg.limits.tutorSessionsPerDay} Z session${pkg.limits.tutorSessionsPerDay !== 1 ? "s" : ""} / day`);
  f.push(pkg.limits.quizGenerationsPerDay === null ? "Unlimited quizzes" : `${pkg.limits.quizGenerationsPerDay} quiz generation${pkg.limits.quizGenerationsPerDay !== 1 ? "s" : ""} / day`);
  f.push(pkg.limits.flashcardSetsPerDay === null ? "Unlimited flashcard sets" : `${pkg.limits.flashcardSetsPerDay} flashcard set${pkg.limits.flashcardSetsPerDay !== 1 ? "s" : ""} / day`);
  f.push(pkg.limits.mindMapsPerDay === null ? "Unlimited mind maps" : `${pkg.limits.mindMapsPerDay} mind map${pkg.limits.mindMapsPerDay !== 1 ? "s" : ""} / day`);
  f.push(pkg.limits.materialUploadsPerDay === null ? "Unlimited uploads" : `${pkg.limits.materialUploadsPerDay} upload${pkg.limits.materialUploadsPerDay !== 1 ? "s" : ""} / day`);
  f.push(pkg.tier === "cooked" ? "Basic analytics" : "Full analytics");
  if (pkg.limits.pdfExport) f.push("PDF export");
  if (pkg.tier === "locked_in") f.push("Priority processing", "Early feature access");
  if (pkg.limits.bonusCreditsOnSignup > 0) f.push(`${pkg.limits.bonusCreditsOnSignup} bonus credits`);
  return f;
}

export function getPlanNotIncluded(pkg: BillingPackage) {
  const missing: string[] = [];
  if (!pkg.limits.pdfExport) missing.push("PDF export");
  if (pkg.tier !== "locked_in") missing.push("Priority processing");
  return missing;
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────

export function PlanCard({
  pkg,
  isPopular = false,
  isCurrent = false,
  delay = 0,
  onSelect,
}: {
  pkg: BillingPackage;
  isPopular?: boolean;
  isCurrent?: boolean;
  delay?: number;
  /** If omitted, no action button is rendered (e.g. admin view). */
  onSelect?: (pkg: BillingPackage) => void;
}) {
  const meta = PLAN_TIER_META[pkg.tier] ?? { label: pkg.tier, tagline: "", color: "text-foreground", borderHover: "" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        "relative flex flex-col border bg-card/30 p-6 transition-colors duration-300 rounded-(--radius)",
        isCurrent ? "border-primary/60 bg-primary/5" : "border-border/50",
        isPopular && !isCurrent && "border-sky-400/30 bg-sky-400/[0.03]",
        !isCurrent && onSelect && meta.borderHover,
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-5">
          <div className="border border-sky-400/60 bg-background px-2 py-0.5">
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-sky-400">Most popular</span>
          </div>
        </div>
      )}
      {isCurrent && (
        <div className="absolute -top-3 left-5">
          <div className="border border-primary/60 bg-background px-2 py-0.5">
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-primary">Current plan</span>
          </div>
        </div>
      )}

      <div className="mb-3">
        <p className={cn("text-[10px] font-mono uppercase tracking-[0.2em] mb-1", meta.color)}>
          {meta.label}
        </p>
        <p className="text-xs text-muted-foreground font-mono">{meta.tagline}</p>
      </div>

      <div className="flex items-baseline gap-1 mb-5">
        <span className="text-4xl font-black tracking-tighter">{pkg.priceGHS.toFixed(2)}</span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">GHS</span>
          <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">
            / {PLAN_DURATION_LABELS[pkg.durationType].toLowerCase()}
          </span>
        </div>
      </div>

      <div className="h-px w-full bg-border/40 mb-5" />

      <ul className="flex flex-col gap-2 flex-1 mb-6">
        {getPlanFeaturesList(pkg).map((f) => (
          <li key={f} className="flex items-center gap-2">
            <Check className={cn("size-3 shrink-0", meta.color)} />
            <span className="text-xs font-mono text-foreground/80">{f}</span>
          </li>
        ))}
        {getPlanNotIncluded(pkg).map((f) => (
          <li key={f} className="flex items-center gap-2 opacity-30">
            <span className="size-3 shrink-0 flex items-center justify-center text-[10px] text-muted-foreground">—</span>
            <span className="text-xs font-mono text-muted-foreground line-through">{f}</span>
          </li>
        ))}
      </ul>

      {onSelect && (
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
      )}
    </motion.div>
  );
}
