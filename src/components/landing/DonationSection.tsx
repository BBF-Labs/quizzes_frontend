"use client";

import { useState } from "react";
import { useDonationLedger, useInitiateDonation } from "@/hooks/common/use-donations";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, Heart, ShieldCheck } from "lucide-react";
import { QUBI_PEEK_SRC } from "@/lib/constants";
import { DonorLedgerCard } from "@/components/common/donor-ledger-card";

const PRESET_AMOUNTS = [10, 20, 50, 100];

export function DonationSection() {
  const { user } = useAuth();
  const { data: ledger, isLoading: isLedgerLoading } = useDonationLedger();
  const initiateMutation = useInitiateDonation();

  const [selectedAmount, setSelectedAmount] = useState<number>(20);
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
    <section id="donate" className="px-5 py-24">
      <div
        className="relative mx-auto max-w-7xl overflow-visible rounded-[36px] border border-blue-100 bg-[#F7F9FC] p-6 sm:p-10 lg:p-14"
        style={{ borderRadius: "36px" }}
      >
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />

          {/* Qubi sticker */}
          <div className="qubi-sticker absolute -right-2 -top-14 hidden md:block">
            <span className="hand absolute -left-28 top-2 w-32 -rotate-6 text-xl leading-5 text-[#0C60FC]">
              keep the lights on! ↘
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={QUBI_PEEK_SRC}
              alt="Qubi peeking"
              className="qubi-bob h-24 w-24 object-contain"
            />
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            {/* Left Content Column */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-[#0C60FC]">
                <Heart className="h-3.5 w-3.5 fill-[#0C60FC] text-[#0C60FC]" />
                Student Supported Platform
              </div>

              <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                Help keep Qz <span className="text-[#0C60FC]">free for everyone.</span>
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-600">
                Donations directly cover AI costs and fund free tier accounts for students who can’t afford a subscription. No profit traps — just keeping knowledge accessible.
              </p>

              {/* Progress & Total Ledger Stats */}
              <div className="mt-8">
                <DonorLedgerCard
                  totalRaisedGHS={ledger?.totalRaisedGHS}
                  donations={ledger?.donations}
                  isLoading={isLedgerLoading}
                  label="Total Raised by Community"
                  badge="Community Fueled"
                />
              </div>

              <div className="mt-6 flex items-center gap-3 text-xs font-semibold text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Secured by Paystack · 100% directly allocated to AI servers</span>
              </div>
            </div>

            {/* Right Donation Card Form */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-blue-50/50 sm:p-8" style={{ borderRadius: "28px" }}>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    Choose donation amount (GHS)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_AMOUNTS.map((amt) => {
                      const isSel = !isCustom && selectedAmount === amt;
                      return (
                        <button
                          type="button"
                          key={amt}
                          onClick={() => {
                            setIsCustom(false);
                            setSelectedAmount(amt);
                          }}
                          className={`rounded-xl border py-3 text-center text-xs font-extrabold transition ${
                            isSel
                              ? "border-[#0C60FC] bg-blue-50 text-[#0C60FC]"
                              : "border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          GH₵ {amt}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setIsCustom(!isCustom)}
                      className="text-xs font-bold text-[#0C60FC] hover:underline"
                    >
                      {isCustom ? "← Select standard amount" : "+ Enter custom amount"}
                    </button>
                    {isCustom && (
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="Enter amount in GHS (e.g. 150)"
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-slate-700">Your email</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@university.edu"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-slate-700">Name (optional)</span>
                    <input
                      type="text"
                      disabled={isAnonymous}
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Ama Mensah"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                    />
                  </label>
                  <label className="flex cursor-pointer items-center gap-2.5 pt-6 text-xs font-bold text-slate-700 select-none">
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
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-700">Note / message (optional)</span>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Keep up the good work Qz!"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                  />
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
                    `Donate GH₵ ${finalAmount || 0} →`
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
    </section>
  );
}

export function Donations() {
  return <DonationSection />;
}

export function DonationBanner() {
  return <DonationSection />;
}
