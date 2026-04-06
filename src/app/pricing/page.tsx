"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Minus, Zap, ArrowRight, Flame, GraduationCap } from "lucide-react";
import { Navbar } from "@/components/common";
import { Footer } from "@/components/landing";
import { Donations } from "@/components/landing";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

// ─── Static data ──────────────────────────────────────────────────────────────

type Duration = "daily" | "weekly" | "semester";

const PRICES: Record<string, Record<Duration, string>> = {
  cooked:    { daily: "2.99",  weekly: "4.99",  semester: "14.99" },
  cruising:  { daily: "3.99",  weekly: "6.99",  semester: "19.99" },
  locked_in: { daily: "4.99",  weekly: "9.99",  semester: "29.99" },
};

const DURATION_LABELS: Record<Duration, string> = {
  daily: "Daily",
  weekly: "Weekly",
  semester: "Semester",
};

const TIERS = [
  {
    id: "cooked",
    name: "Cooked",
    tagline: "All-nighter mode. One shot.",
    color: "text-amber-400",
    borderHover: "hover:border-amber-400/30",
    popular: false,
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
    popular: false,
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

// Comparison table rows: [label, cooked, cruising, locked_in]
type FeatureRow = { label: string; cooked: string | boolean; cruising: string | boolean; locked_in: string | boolean };
type SectionDef = { heading: string; rows: FeatureRow[] };

const COMPARISON: SectionDef[] = [
  {
    heading: "Daily Limits",
    rows: [
      { label: "Z Tutor sessions",    cooked: "1 / day",       cruising: "3 / day",       locked_in: "Unlimited" },
      { label: "Quiz generations",    cooked: "2 / day",       cruising: "5 / day",       locked_in: "Unlimited" },
      { label: "Flashcard sets",      cooked: "2 / day",       cruising: "5 / day",       locked_in: "Unlimited" },
      { label: "Mind maps",           cooked: "1 / day",       cruising: "3 / day",       locked_in: "Unlimited" },
      { label: "Material uploads",    cooked: "1 / day",       cruising: "3 / day",       locked_in: "Unlimited" },
    ],
  },
  {
    heading: "Features",
    rows: [
      { label: "PDF export",          cooked: false,           cruising: true,            locked_in: true        },
      { label: "Analytics",           cooked: "Basic",         cruising: "Full",          locked_in: "Full"      },
      { label: "Priority processing", cooked: false,           cruising: false,           locked_in: true        },
      { label: "Early feature access",cooked: false,           cruising: false,           locked_in: true        },
    ],
  },
  {
    heading: "Bonuses",
    rows: [
      { label: "Bonus credits on signup", cooked: "—",         cruising: "+10 credits",   locked_in: "+25 credits" },
      { label: "Streak freeze slots",     cooked: "0",         cruising: "1",             locked_in: "2"         },
    ],
  },
];

const CREDIT_BUNDLES = [
  { name: "Starter",  price: "3",  credits: 30,  perCredit: "0.10" },
  { name: "Standard", price: "9",  credits: 100, perCredit: "0.09" },
  { name: "Max",      price: "25", credits: 250, perCredit: "0.10", tag: "Best value" },
];

const CREDIT_COSTS = [
  { feature: "Z Tutor session",  credits: 25 },
  { feature: "Quiz generation",  credits: 10 },
  { feature: "Flashcard set",    credits: 10 },
  { feature: "Mind map",         credits: 5  },
];

const DISCOUNTS = [
  { type: "Student", value: "10% off", note: "Verify your university email" },
  { type: "Referral", value: "15% off", note: "Earn when a friend subscribes" },
  { type: "7-day streak", value: "10% off", note: "Keep your streak going" },
  { type: "30-day streak", value: "20% off", note: "On your next renewal" },
  { type: "60-day streak", value: "30% off or free week", note: "Loyalty milestone" },
  { type: "90-day streak", value: "15% permanent", note: "Lifetime loyalty discount" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CellValue({ val, tierId }: { val: string | boolean; tierId: string }) {
  const color =
    tierId === "locked_in" ? "text-primary" :
    tierId === "cruising"  ? "text-sky-400"  :
    "text-amber-400";

  if (val === true)  return <Check className={cn("size-4 mx-auto", color)} />;
  if (val === false) return <Minus className="size-4 mx-auto text-muted-foreground/20" />;
  if (val === "Unlimited") return <span className={cn("text-sm font-semibold font-mono", color)}>∞</span>;
  return <span className="text-xs font-mono text-foreground/80">{val}</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [duration, setDuration] = useState<Duration>("weekly");
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const ctaHref = user ? "/app/billing" : "/login";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24">

        {/* ── Hero ── */}
        <section className="py-16 md:py-24 border-b border-border/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ease: "easeOut", duration: 0.5 }}
            >
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary mb-4">
                Pricing
              </p>
              <h1 className="text-4xl md:text-5xl font-black tracking-[-0.04em] uppercase leading-[1.05] mb-4">
                Simple, honest pricing.
                <br />
                <span className="text-primary">No surprises.</span>
              </h1>
              <p className="text-base text-muted-foreground font-mono max-w-lg leading-relaxed">
                Start free. Upgrade to unlock more daily actions. Pay-as-you-go credits if you just need a top-up.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Plan cards ── */}
        <section className="py-16 md:py-20 border-b border-border/50">
          <div className="container mx-auto px-4 max-w-5xl">

            {/* Duration toggle */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {TIERS.map((tier, i) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  className={cn(
                    "relative flex flex-col border bg-card/30 p-6 transition-colors duration-300 rounded-(--radius)",
                    tier.popular ? "border-sky-400/30 bg-sky-400/[0.03]" : "border-border/50",
                    tier.borderHover,
                  )}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-6">
                      <div className="border border-sky-400/50 bg-background px-2 py-0.5">
                        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-sky-400">Most popular</span>
                      </div>
                    </div>
                  )}

                  <p className={cn("text-[10px] font-mono uppercase tracking-[0.2em] mb-1", tier.color)}>
                    {tier.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mb-4">{tier.tagline}</p>

                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-4xl font-black tracking-tighter">{PRICES[tier.id][duration]}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">GHS</span>
                      <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">/ {DURATION_LABELS[duration].toLowerCase()}</span>
                    </div>
                  </div>

                  <div className="h-px w-full bg-border/40 mb-5" />

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
                    <div className="w-full py-2.5 text-[10px] font-mono uppercase tracking-[0.15em] border border-border/40 text-muted-foreground text-center rounded-(--radius) opacity-50 cursor-default">
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
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="border border-border/30 bg-card/20 px-4 py-3"
            >
              <p className="text-xs font-mono text-muted-foreground">
                <span className="text-foreground font-semibold">Free tier</span> — always available. 1 Z session / day, 2 quizzes / day, 2 flashcard sets / day, 1 mind map / day. No card required.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Full comparison table ── */}
        <section className="py-16 md:py-20 border-b border-border/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="text-2xl font-black tracking-[-0.04em] uppercase mb-2">Full comparison</h2>
              <p className="text-xs font-mono text-muted-foreground">Everything that comes with each plan.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1, transition: { delay: 0.1 } }}
              viewport={{ once: true }}
              className="border border-border/50 overflow-hidden"
            >
              {/* Table header */}
              <div className="grid grid-cols-4 border-b border-border/50 bg-card/30">
                <div className="px-4 py-3 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">Feature</div>
                {TIERS.map((t) => (
                  <div key={t.id} className="px-4 py-3 text-center">
                    <span className={cn("text-[10px] font-mono uppercase tracking-[0.15em] font-semibold", t.color)}>
                      {t.name}
                    </span>
                  </div>
                ))}
              </div>

              {COMPARISON.map((section) => (
                <div key={section.heading}>
                  <div className="grid grid-cols-4 bg-card/20 border-b border-border/30">
                    <div className="px-4 py-2 col-span-4">
                      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/40">
                        {section.heading}
                      </span>
                    </div>
                  </div>
                  {section.rows.map((row, ri) => (
                    <div
                      key={row.label}
                      className={cn(
                        "grid grid-cols-4 border-b border-border/20 last:border-b-0",
                        ri % 2 === 0 ? "bg-transparent" : "bg-card/10",
                      )}
                    >
                      <div className="px-4 py-3 text-xs font-mono text-muted-foreground">{row.label}</div>
                      <div className="px-4 py-3 text-center"><CellValue val={row.cooked}    tierId="cooked"    /></div>
                      <div className="px-4 py-3 text-center"><CellValue val={row.cruising}  tierId="cruising"  /></div>
                      <div className="px-4 py-3 text-center"><CellValue val={row.locked_in} tierId="locked_in" /></div>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Credits ── */}
        <section id="credits" className="py-16 md:py-20 border-b border-border/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <Zap className="size-4 text-amber-400" />
                <h2 className="text-2xl font-black tracking-[-0.04em] uppercase">Pay-as-you-go credits</h2>
              </div>
              <p className="text-xs font-mono text-muted-foreground max-w-md">
                No subscription? Top up credits and use features on demand. Credits never expire.
                Always cheaper per feature to subscribe — credits are a convenience top-up.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Bundles */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                viewport={{ once: true }}
              >
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Credit bundles</p>
                <div className="flex flex-col gap-3">
                  {CREDIT_BUNDLES.map((b) => (
                    <div key={b.name} className="flex items-center justify-between border border-border/50 bg-card/30 px-4 py-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold">{b.name}</span>
                          {b.tag && (
                            <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400 border border-amber-400/30 px-1.5 py-0.5">
                              {b.tag}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">{b.credits} credits</span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black tracking-tighter">GHS {b.price}</p>
                        <p className="text-[10px] font-mono text-muted-foreground/50">{b.perCredit} / credit</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Credit costs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}
                viewport={{ once: true }}
              >
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Feature costs</p>
                <div className="border border-border/50 overflow-hidden">
                  {CREDIT_COSTS.map((c, i) => (
                    <div
                      key={c.feature}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 border-b border-border/30 last:border-b-0",
                        i % 2 === 0 ? "bg-transparent" : "bg-card/10",
                      )}
                    >
                      <span className="text-xs font-mono text-muted-foreground">{c.feature}</span>
                      <div className="flex items-center gap-1.5">
                        <Zap className="size-3 text-amber-400" />
                        <span className="text-xs font-mono font-semibold text-amber-400">{c.credits}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[10px] font-mono text-muted-foreground/50">
                  Credits are deducted only when your daily plan limit is reached. Material uploads cannot be unlocked with credits.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Discounts ── */}
        <section className="py-16 md:py-20 border-b border-border/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <Flame className="size-4 text-amber-400" />
                <h2 className="text-2xl font-black tracking-[-0.04em] uppercase">Discounts & rewards</h2>
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                Stack discounts up to 30% off. Stay consistent and Qz rewards you.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {DISCOUNTS.map((d, i) => (
                <motion.div
                  key={d.type}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                  viewport={{ once: true }}
                  className="border border-border/40 bg-card/20 px-4 py-4"
                >
                  <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">{d.type}</p>
                  <p className="text-base font-black tracking-tight text-primary mb-1">{d.value}</p>
                  <p className="text-xs font-mono text-muted-foreground/70">{d.note}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1, transition: { delay: 0.3 } }}
              viewport={{ once: true }}
              className="mt-6 flex items-start gap-2 border border-border/20 bg-card/10 px-4 py-3"
            >
              <GraduationCap className="size-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
              <p className="text-xs font-mono text-muted-foreground">
                <span className="text-foreground font-semibold">Student discount</span> — verify your university email in settings after signing up. Works with any recognized Ghanaian university domain (ug.edu.gh, knust.edu.gh, ucc.edu.gh, and more).
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Donation ── */}
        <Donations />

        {/* ── FAQ / CTA ── */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-black tracking-[-0.04em] uppercase mb-4">
                Start free. Upgrade when ready.
              </h2>
              <p className="text-sm text-muted-foreground font-mono max-w-md mx-auto mb-8">
                No credit card required to get started. Free tier limits reset daily.
              </p>
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 border border-primary bg-primary text-primary-foreground px-8 py-3 text-xs font-mono uppercase tracking-[0.2em] hover:bg-primary/90 transition-colors"
              >
                Get started free <ArrowRight className="size-3" />
              </Link>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
