"use client";

import { useState } from "react";
import { useDonationLedger, useInitiateDonation } from "@/hooks/common/use-donations";
import { useAuth } from "@/contexts/auth-context";
import { LandingHeader, LandingFooter, MobileNav } from "@/components/landing";
import { Loader2, Heart, ShieldCheck, Sparkles, CheckCircle2, Activity } from "lucide-react";
import { QUBI_PEEK_SRC } from "@/lib/constants";

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000];

export default function DonatePage() {
  const { user } = useAuth();
  const { data: ledger, isLoading: isLedgerLoading } = useDonationLedger();
  const initiateMutation = useInitiateDonation();

  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(user?.email || "");
  const [donorName, setDonorName] = useState<string>(user?.name || "");
  const [message, setMessage] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const finalAmount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }
    if (finalAmount < 1) {
      setError("Minimum donation amount is GHS 1.");
      return;
    }

    initiateMutation.mutate({
      email: email.trim(),
      amountGHS: finalAmount,
      donorName: isAnonymous ? undefined : donorName.trim() || undefined,
      message: message.trim() || undefined,
      isAnonymous,
    });
  };

  return (
    <div className="overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <LandingHeader />

      <main>
        <section className="soft-grid relative overflow-hidden px-5 pb-16 pt-32 lg:pt-40">
          <div className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-[#DFFF61]/50 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-[1fr_.9fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#0C60FC]">
                Keep Qz free
              </p>
              <h1 className="display mt-4 text-balance text-4xl font-bold leading-[1.07] tracking-[-.04em] sm:text-6xl">
                Support our mission to<br />
                <span className="scribble">better education.</span>
              </h1>
              <p className="hand mt-3 text-2xl text-[#0C60FC]">
                a few cedis keeps someone studying ✦
              </p>
              <p className="mt-4 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                Every AI session costs real money. Donations cover those costs so students who can’t afford a subscription still get the full Qz experience — no ads, no data selling, no catch.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="text-xl">⚙️</span>
                  <p className="mt-3 text-xs font-extrabold uppercase tracking-wider">
                    Cover API costs
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    Every quiz, mind map and Z session runs on paid AI infrastructure.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="text-xl">🎓</span>
                  <p className="mt-3 text-xs font-extrabold uppercase tracking-wider">
                    Fund student access
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    Sponsored accounts for students who can’t pay a weekly plan.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="text-xl">🧠</span>
                  <p className="mt-3 text-xs font-extrabold uppercase tracking-wider">
                    Build better models
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    Better curriculum understanding for every course we support.
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-[24px] border border-slate-200 bg-[#F7F9FC] p-6">
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  What your gift does
                </p>
                <ul className="mt-4 space-y-3 text-sm font-semibold text-slate-700">
                  <li className="flex items-center gap-3">
                    <span className="w-16 shrink-0 rounded-lg bg-white px-2 py-1.5 text-center text-[11px] font-extrabold shadow-sm">
                      GHS 50
                    </span>{" "}
                    ≈ 1 student studying free for a week
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-16 shrink-0 rounded-lg bg-white px-2 py-1.5 text-center text-[11px] font-extrabold shadow-sm">
                      GHS 200
                    </span>{" "}
                    ≈ a full month of sponsored access
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-16 shrink-0 rounded-lg bg-white px-2 py-1.5 text-center text-[11px] font-extrabold shadow-sm">
                      GHS 1000
                    </span>{" "}
                    ≈ a whole study group through exam season
                  </li>
                </ul>
                <p className="mt-4 text-[11px] leading-5 text-slate-500">
                  Estimates based on current average AI usage per active student.
                </p>
              </div>

              {/* Live Ledger Summary */}
              <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Community Contributions</span>
                  <span className="flex items-center gap-1.5 text-[#0C60FC]">
                    <Activity className="h-3.5 w-3.5" /> Live Ledger
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xs font-bold text-slate-400">GHS</span>
                  <span className="display text-4xl font-bold text-slate-900">
                    {isLedgerLoading ? "…" : ledger?.totalRaisedGHS?.toLocaleString() ?? "0"}
                  </span>
                </div>
                {ledger?.donations && ledger.donations.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                    {ledger.donations.slice(0, 5).map((d) => (
                      <span
                        key={d._id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
                      >
                        {d.isAnonymous ? "Anonymous" : d.donorName || "Supporter"}
                        <b className="text-[#0C60FC]">GHS {d.amount}</b>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Donation Form Card */}
            <div className="card-shadow rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 lg:sticky lg:top-28" style={{ borderRadius: "28px" }}>
              <h2 className="display text-2xl font-bold">Support Qz</h2>
              <p className="mt-1 text-sm text-slate-500">
                Give once, any amount. Anonymous if you prefer.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <p className="text-xs font-extrabold text-slate-700">Amount (GHS)</p>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_AMOUNTS.map((amt) => {
                    const isSel = !isCustom && selectedAmount === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setIsCustom(false);
                          setSelectedAmount(amt);
                        }}
                        className={`rounded-xl border py-3 text-sm font-extrabold transition ${
                          isSel
                            ? "border-[#0C60FC] bg-[#0C60FC] text-white"
                            : "border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {amt}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setIsCustom(!isCustom)}
                    className={`rounded-xl border py-3 text-sm font-extrabold transition ${
                      isCustom
                        ? "border-[#0C60FC] bg-[#0C60FC] text-white"
                        : "border-dashed border-slate-300 text-slate-500 hover:border-slate-400"
                    }`}
                  >
                    Other
                  </button>
                </div>

                {isCustom && (
                  <label className="block pt-1">
                    <span className="mb-1.5 block text-xs font-extrabold">Your amount (GHS)</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="e.g. 75"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                    />
                  </label>
                )}

                <label className="block">
                  <span className="mb-1.5 block text-xs font-extrabold">
                    Email <span className="font-medium text-slate-400">· for your receipt</span>
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-extrabold">
                    Name <span className="font-medium text-slate-400">· optional</span>
                  </span>
                  <input
                    type="text"
                    disabled={isAnonymous}
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Ama Mensah"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-extrabold">
                    Message <span className="font-medium text-slate-400">· optional</span>
                  </span>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Anything you'd like the team to know"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="flex cursor-pointer items-center gap-2.5 text-[11px] font-semibold text-slate-600 select-none">
                  <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="h-5 w-5 rounded-md border-2 border-slate-300 bg-white transition-colors peer-checked:border-[#0C60FC] peer-checked:bg-[#0C60FC]" />
                    <svg className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  </span>
                  Donate anonymously
                </label>

                {error && (
                  <p className="text-xs font-bold text-rose-600" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={initiateMutation.isPending}
                  className="squishy w-full rounded-2xl bg-[#0C60FC] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-70"
                >
                  {initiateMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Redirecting to Paystack…
                    </span>
                  ) : (
                    `Donate GHS ${finalAmount || 0} →`
                  )}
                </button>
                <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                  Qz is built by BetaForge Labs. Donations are not tax-deductible and don’t buy features or influence.
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
      <MobileNav />
    </div>
  );
}
