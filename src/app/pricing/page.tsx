"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LandingHeader, LandingFooter, MobileNav, DonationSection } from "@/components/landing";
import { Check, Minus, Zap, Flame, Plus, GraduationCap, Loader2, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  usePackages,
  useCreditBundles,
  useBillingStatus,
  useInitiatePlanPayment,
  useInitiateCreditPayment,
  type PlanTier,
  type PlanDuration,
} from "@/hooks/common/use-billing";
import { toast } from "sonner";
import { CreditBundleCard } from "@/components/common";

const PRICES: Record<string, Record<PlanDuration, string>> = {
  cooked: { daily: "2.99", weekly: "4.99", semester: "14.99" },
  cruising: { daily: "3.99", weekly: "6.99", semester: "22.99" },
  locked_in: { daily: "5.99", weekly: "9.99", semester: "34.99" },
};

const DURATION_LABELS: Record<PlanDuration, string> = {
  daily: "/ day",
  weekly: "/ weekly",
  semester: "/ semester",
};

const FAQ_ITEMS = [
  {
    q: "Can I use Qz for free?",
    a: "Yes. Our Free tier includes 1 Z session, 2 quizzes, 2 flashcard sets and 1 mind map per day. No credit card required.",
  },
  {
    q: "How do credit top-ups work?",
    a: "Credits let you run extra actions on any plan. 1 credit = 1 quiz, flashcard set or mind map generation. Credits never expire.",
  },
  {
    q: "What payment methods do you support?",
    a: "We accept Mobile Money (MTN, Telecel, AT), Debit & Credit cards, and Apple Pay powered by Paystack.",
  },
  {
    q: "Can I cancel my subscription any time?",
    a: "Yes, you can cancel or change your plan at any time from your account settings with zero cancellation fees.",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [cycle, setCycle] = useState<PlanDuration>("weekly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Billing Hooks
  const { data: apiPackages = [] } = usePackages();
  const { data: creditBundles = [] } = useCreditBundles();
  const { data: billingStatus } = useBillingStatus();
  const initiatePlan = useInitiatePlanPayment();
  const initiateCredit = useInitiateCreditPayment();

  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSelectPlan = async (tier: PlanTier) => {
    if (!user) {
      toast.info("Please log in to upgrade your plan.");
      router.push(`/login?redirect=${encodeURIComponent("/pricing")}`);
      return;
    }

    setLoadingTier(tier);
    try {
      const matchedPkg = apiPackages.find(
        (p) => p.tier === tier && p.durationType === cycle
      );
      const packageId = matchedPkg?._id || tier;

      const res = await initiatePlan.mutateAsync({
        packageId,
        email: user.email,
      });

      if (res?.authorizationUrl) {
        toast.success("Redirecting to Paystack checkout…");
        window.location.href = res.authorizationUrl;
      } else {
        toast.error("Could not obtain checkout URL.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to initiate payment checkout.");
    } finally {
      setLoadingTier(null);
    }
  };

  const handleBuyCreditBundle = async (bundleId: string) => {
    if (!user) {
      toast.info("Please log in to buy credit top-ups.");
      router.push(`/login?redirect=${encodeURIComponent("/pricing")}`);
      return;
    }

    try {
      const res = await initiateCredit.mutateAsync({
        bundleId,
        email: user.email,
      });
      if (res?.authorizationUrl) {
        toast.success("Redirecting to Paystack checkout…");
        window.location.href = res.authorizationUrl;
      } else {
        toast.error("Could not obtain checkout URL.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to initiate credit checkout.");
    }
  };

  return (
    <div className="overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white min-h-screen">
      <LandingHeader />

      <main>
        {/* Header Hero */}
        <section className="soft-grid relative overflow-hidden px-5 pb-10 pt-32 lg:pt-40">
          <div className="pointer-events-none absolute -right-32 top-24 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="relative mx-auto max-w-3xl text-center">
            {billingStatus?.isSubscribed ? (
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-extrabold text-emerald-700 shadow-sm">
                ✦ Current Active Plan: {billingStatus.planTier?.toUpperCase() ?? "ACTIVE"}
              </div>
            ) : (
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-2 text-xs font-bold text-blue-700 shadow-sm">
                ✦ Free tier always available
              </div>
            )}

            <h1 className="display text-balance text-4xl font-bold leading-[1.06] tracking-[-.04em] sm:text-6xl text-slate-950">
              Simple, honest pricing.<br />
              <span className="text-[#0C60FC]">No surprises.</span>
            </h1>
            <p className="hand mt-3 text-2xl text-[#0C60FC]">student prices, student honesty ↓</p>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Start free. Upgrade to unlock more daily actions. Pay-as-you-go credits if you just need a top-up.
            </p>

            {/* Cycle Selector */}
            <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
              {(["daily", "weekly", "semester"] as PlanDuration[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setCycle(d)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-extrabold capitalize transition ${
                    cycle === d
                      ? "bg-[#0C60FC] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {d}
                  {d === "semester" && (
                    <span className="ml-1 rounded-full bg-[#DFFF61] px-2 py-0.5 text-[9px] text-slate-900 font-extrabold">
                      Best value
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="px-5 pb-16">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
            {/* Cooked Plan */}
            <article className="play-card flex flex-col rounded-[28px] border border-slate-200 bg-white p-7" style={{ borderRadius: "28px" }}>
              <h2 className="display text-xl font-bold text-slate-950">Cooked</h2>
              <p className="mt-1 text-sm text-slate-500">All-nighter mode. One shot.</p>
              <p className="mt-6 flex items-end gap-1">
                <span className="text-xs font-bold text-slate-400">GHS</span>
                <span className="display text-4xl font-bold text-slate-950">{PRICES.cooked[cycle]}</span>
                <span className="mb-1 text-xs font-bold text-slate-400">{DURATION_LABELS[cycle]}</span>
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-slate-600">
                <li className="flex gap-2"><b className="text-emerald-500">✓</b> 1 Z session / day</li>
                <li className="flex gap-2"><b className="text-emerald-500">✓</b> 2 quiz generations / day</li>
                <li className="flex gap-2"><b className="text-emerald-500">✓</b> 2 flashcard sets / day</li>
                <li className="flex gap-2"><b className="text-emerald-500">✓</b> 1 mind map / day</li>
                <li className="flex gap-2"><b className="text-emerald-500">✓</b> 1 upload / day</li>
                <li className="flex gap-2"><b className="text-emerald-500">✓</b> Basic analytics</li>
                <li className="flex gap-2 text-slate-300"><b>—</b> PDF export</li>
                <li className="flex gap-2 text-slate-300"><b>—</b> Priority processing</li>
              </ul>
              <div className="mt-auto pt-7">
                <button
                  type="button"
                  onClick={() => handleSelectPlan("cooked")}
                  disabled={loadingTier === "cooked"}
                  className="w-full rounded-2xl border border-slate-200 py-3.5 text-center text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2"
                >
                  {loadingTier === "cooked" ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-700" />
                  ) : billingStatus?.planTier === "cooked" ? (
                    "Current Plan"
                  ) : user ? (
                    "Upgrade to Cooked"
                  ) : (
                    "Get started"
                  )}
                </button>
              </div>
            </article>

            {/* Cruising Plan */}
            <article className="play-card relative flex flex-col rounded-[28px] bg-[#0C60FC] p-7 text-white shadow-2xl shadow-blue-200" style={{ borderRadius: "28px" }}>
              <span className="absolute -top-3 left-7 rounded-full bg-[#DFFF61] px-3 py-1 text-[10px] font-extrabold text-slate-900">
                Most popular
              </span>
              <h2 className="display text-xl font-bold">Cruising</h2>
              <p className="mt-1 text-sm text-blue-100">Steady grind. Mid-semester flow.</p>
              <p className="mt-6 flex items-end gap-1">
                <span className="text-xs font-bold text-blue-200">GHS</span>
                <span className="display text-4xl font-bold">{PRICES.cruising[cycle]}</span>
                <span className="mb-1 text-xs font-bold text-blue-200">{DURATION_LABELS[cycle]}</span>
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-blue-50">
                <li className="flex gap-2"><b className="text-[#DFFF61]">✓</b> 3 Z sessions / day</li>
                <li className="flex gap-2"><b className="text-[#DFFF61]">✓</b> 5 quiz generations / day</li>
                <li className="flex gap-2"><b className="text-[#DFFF61]">✓</b> 5 flashcard sets / day</li>
                <li className="flex gap-2"><b className="text-[#DFFF61]">✓</b> 3 mind maps / day</li>
                <li className="flex gap-2"><b className="text-[#DFFF61]">✓</b> 3 uploads / day</li>
                <li className="flex gap-2"><b className="text-[#DFFF61]">✓</b> Full analytics</li>
                <li className="flex gap-2"><b className="text-[#DFFF61]">✓</b> PDF export</li>
                <li className="flex gap-2"><b className="text-[#DFFF61]">✓</b> 10 bonus credits</li>
                <li className="flex gap-2 text-blue-200/70"><b>—</b> Priority processing</li>
              </ul>
              <div className="mt-auto pt-7">
                <button
                  type="button"
                  onClick={() => handleSelectPlan("cruising")}
                  disabled={loadingTier === "cruising"}
                  className="squishy w-full rounded-2xl bg-white py-3.5 text-center text-sm font-extrabold text-blue-700 transition flex items-center justify-center gap-2"
                >
                  {loadingTier === "cruising" ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-700" />
                  ) : billingStatus?.planTier === "cruising" ? (
                    "Current Plan"
                  ) : user ? (
                    "Upgrade to Cruising"
                  ) : (
                    "Get started"
                  )}
                </button>
              </div>
            </article>

            {/* Locked In Plan */}
            <article className="play-card flex flex-col rounded-[28px] border border-slate-200 bg-white p-7" style={{ borderRadius: "28px" }}>
              <h2 className="display text-xl font-bold text-slate-950">Locked In</h2>
              <p className="mt-1 text-sm text-slate-500">Unlimited. Zero excuses.</p>
              <p className="mt-6 flex items-end gap-1">
                <span className="text-xs font-bold text-slate-400">GHS</span>
                <span className="display text-4xl font-bold text-slate-950">{PRICES.locked_in[cycle]}</span>
                <span className="mb-1 text-xs font-bold text-slate-400">{DURATION_LABELS[cycle]}</span>
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-slate-600">
                <li className="flex gap-2"><b className="text-emerald-500">✓</b> Unlimited Z sessions</li>
                <li className="flex gap-2"><b className="text-emerald-500">✓</b> Unlimited quizzes</li>
                <li className="flex gap-2"><b className="text-emerald-500">✓</b> Unlimited flashcard sets</li>
                <li className="flex gap-2"><b className="text-emerald-500">✓</b> Unlimited mind maps</li>
                <li className="flex gap-2"><b className="text-emerald-500">✓</b> Unlimited uploads</li>
                <li className="flex gap-2"><b className="text-emerald-500">✓</b> Full analytics + PDF export</li>
                <li className="flex gap-2"><b className="text-emerald-500">✓</b> Priority processing</li>
                <li className="flex gap-2"><b className="text-emerald-500">✓</b> Early feature access</li>
                <li className="flex gap-2"><b className="text-emerald-500">✓</b> 25 bonus credits</li>
              </ul>
              <div className="mt-auto pt-7">
                <button
                  type="button"
                  onClick={() => handleSelectPlan("locked_in")}
                  disabled={loadingTier === "locked_in"}
                  className="w-full rounded-2xl bg-slate-950 py-3.5 text-center text-sm font-extrabold text-white hover:bg-[#0C60FC] transition flex items-center justify-center gap-2"
                >
                  {loadingTier === "locked_in" ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : billingStatus?.planTier === "locked_in" ? (
                    "Current Plan"
                  ) : user ? (
                    "Upgrade to Locked In"
                  ) : (
                    "Get started"
                  )}
                </button>
              </div>
            </article>
          </div>

          <p className="mx-auto mt-6 max-w-3xl rounded-2xl bg-[#F7F9FC] px-5 py-4 text-center text-xs font-semibold text-slate-500">
            Free tier — always available. 1 Z session / day, 2 quizzes / day, 2 flashcard sets / day, 1 mind map / day. No card required.
          </p>
        </section>

        {/* Pay-as-you-go Credit Bundles */}
        {creditBundles.length > 0 && (
          <section className="bg-[#F7F9FC] px-5 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto max-w-3xl text-center">
                <p className="hand hand-wiggle text-3xl text-[#0C60FC]">
                  need extra generations? ✦
                </p>
                <h2 className="mt-2 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                  Pay-as-you-go{" "}
                  <span className="scribble">credits.</span>
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-base leading-7 text-slate-600">
                  Credits never expire. Top up anytime for extra quizzes,
                  flashcards or mind maps on top of any plan.
                </p>
              </div>

              <div className="mt-12 flex flex-wrap justify-center gap-5">
                {creditBundles.map((bundle, idx) => {
                  const priceGhs = Number(bundle.priceGHS);
                  const perCredit =
                    bundle.credits > 0 ? priceGhs / bundle.credits : 0;
                  const isStarter = idx === 0;
                  const isBest = idx === creditBundles.length - 1;

                  // Backend names come back lowercase ("starter pack"); title-case
                  // for display so the card reads like the rest of the page.
                  const displayName = bundle.name
                    .split(" ")
                    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
                    .join(" ");

                  return (
                    <CreditBundleCard key={idx} bundle={bundle} index={idx} totalCount={creditBundles.length} onSelect={handleBuyCreditBundle} />
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Discounts & Rewards */}
        <section className="relative overflow-hidden bg-slate-950 px-5 py-24 text-white">
          <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-[#DFFF61]/10 blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <div className="text-center">
              <p className="hand text-3xl text-[#DFFF61]">consistency literally pays ✦</p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                Discounts &amp; rewards
              </h2>
              <p className="mt-3 text-sm text-slate-400">
                Stack discounts up to 30% off. Stay consistent and Qz rewards you.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Student */}
              <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <p className="text-3xl font-extrabold text-[#DFFF61]">10% off</p>
                <p className="mt-3 text-sm font-bold text-white">Student</p>
                <p className="mt-1 text-xs text-slate-400">Verify your university email</p>
              </article>

              {/* Referral */}
              <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <p className="text-3xl font-extrabold text-[#DFFF61]">15% off</p>
                <p className="mt-3 text-sm font-bold text-white">Referral</p>
                <p className="mt-1 text-xs text-slate-400">Earn when a friend subscribes</p>
              </article>

              {/* 7-day streak */}
              <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <p className="text-3xl font-extrabold text-[#DFFF61]">10% off</p>
                <p className="mt-3 text-sm font-bold text-white">7-day streak</p>
                <p className="mt-1 text-xs text-slate-400">Keep your streak going</p>
              </article>

              {/* 30-day streak */}
              <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <p className="text-3xl font-extrabold text-[#DFFF61]">20% off</p>
                <p className="mt-3 text-sm font-bold text-white">30-day streak</p>
                <p className="mt-1 text-xs text-slate-400">On your next renewal</p>
              </article>

              {/* 60-day streak */}
              <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <p className="text-3xl font-extrabold text-[#DFFF61]">30% off</p>
                <p className="mt-3 text-sm font-bold text-white">60-day streak</p>
                <p className="mt-1 text-xs text-slate-400">Or a free week — loyalty milestone</p>
              </article>

              {/* 90-day streak — highlighted */}
              <article className="rounded-2xl bg-[#0C60FC] p-6 shadow-2xl shadow-blue-500/30">
                <p className="text-3xl font-extrabold text-white">15% forever</p>
                <p className="mt-3 text-sm font-bold text-white">90-day streak</p>
                <p className="mt-1 text-xs text-blue-100">Lifetime loyalty discount</p>
              </article>
            </div>

            <p className="mx-auto mt-10 max-w-3xl text-center text-xs font-semibold text-slate-400">
              Student discount — verify your university email in settings after signing up. Works with any recognised Ghanaian university domain (ug.edu.gh, knust.edu.gh, ucc.edu.gh, and more).
            </p>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="bg-[#F7F9FC] px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="hand text-3xl text-[#0C60FC]">no asterisks, promise ✦</p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl text-slate-950">Full comparison</h2>
              <p className="mt-3 text-sm text-slate-600">Everything that comes with each plan.</p>
            </div>
            <div className="mt-8 overflow-x-auto rounded-[24px] border border-slate-200 bg-white">
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead className="bg-white text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <tr className="border-b border-slate-100">
                    <th className="p-4">Feature</th>
                    <th className="p-4 text-center">Cooked</th>
                    <th className="p-4 text-center bg-blue-50/60 text-[#0C60FC]">Cruising</th>
                    <th className="p-4 text-center">Locked In</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  <tr><td className="p-4 font-bold">Z Sessions / day</td><td className="p-4 text-center">1</td><td className="p-4 text-center bg-blue-50/30">3</td><td className="p-4 text-center font-extrabold text-emerald-600">Unlimited</td></tr>
                  <tr><td className="p-4 font-bold">Quiz generations / day</td><td className="p-4 text-center">2</td><td className="p-4 text-center bg-blue-50/30">5</td><td className="p-4 text-center font-extrabold text-emerald-600">Unlimited</td></tr>
                  <tr><td className="p-4 font-bold">Flashcard sets / day</td><td className="p-4 text-center">2</td><td className="p-4 text-center bg-blue-50/30">5</td><td className="p-4 text-center font-extrabold text-emerald-600">Unlimited</td></tr>
                  <tr><td className="p-4 font-bold">Mind maps / day</td><td className="p-4 text-center">1</td><td className="p-4 text-center bg-blue-50/30">3</td><td className="p-4 text-center font-extrabold text-emerald-600">Unlimited</td></tr>
                  <tr><td className="p-4 font-bold">Analytics</td><td className="p-4 text-center">Basic</td><td className="p-4 text-center bg-blue-50/30">Full</td><td className="p-4 text-center">Full</td></tr>
                  <tr><td className="p-4 font-bold">PDF Export</td><td className="p-4 text-center text-slate-300">—</td><td className="p-4 text-center bg-blue-50/30 text-emerald-600">✓</td><td className="p-4 text-center text-emerald-600">✓</td></tr>
                  <tr><td className="p-4 font-bold">Priority AI Queue</td><td className="p-4 text-center text-slate-300">—</td><td className="p-4 text-center bg-blue-50/30 text-slate-300">—</td><td className="p-4 text-center text-emerald-600">✓</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="px-5 py-24">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <p className="hand text-3xl text-[#0C60FC]">got questions? ✦</p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl text-slate-950">
                Frequently asked questions
              </h2>
            </div>
            <div className="mt-10 space-y-4">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={item.q}
                    className="rounded-2xl border border-slate-200 bg-white p-5 transition"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between text-left text-base font-bold text-slate-900"
                    >
                      <span>{item.q}</span>
                      <Plus className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-45 text-[#0C60FC]" : ""}`} />
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-sm leading-6 text-slate-600 animate-in fade-in">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <DonationSection />
      </main>

      <LandingFooter />
      <MobileNav />
    </div>
  );
}
