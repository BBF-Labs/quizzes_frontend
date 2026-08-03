"use client";

import { useReferralStatus } from "@/hooks/common/use-billing";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Gift, Users, Check, Sparkles, Link2 } from "lucide-react";
import { motion } from "framer-motion";
import { QUBI_PEEK_SRC } from "@/lib/constants";

export function ReferralCard() {
  const { data: status, isLoading } = useReferralStatus();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    if (!status?.code) return;
    navigator.clipboard.writeText(status.code);
    setCopiedCode(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!status?.code) return;
    const link = `${window.location.origin}/signup?ref=${status.code}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (isLoading) {
    return (
      <div
        className="h-50 w-full animate-pulse rounded-[28px] border border-slate-200 bg-[#E9FFD3] p-7"
        style={{ borderRadius: "28px" }}
      />
    );
  }

  if (!status) return null;

  return (
    <section
      className="play-card relative overflow-visible rounded-[28px] border border-slate-200 bg-[#E9FFD3] p-7 shadow-sm"
      style={{ borderRadius: "28px" }}
    >
      {/* soft glow blob */}
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-lime-200/60 blur-3xl" />

      {/* Qubi resting on the top-right corner */}
      <div className="qubi-sticker absolute -right-2 -top-14 z-10 block">
        <span className="hand absolute -left-28 top-3 hidden w-28 -rotate-6 text-xl leading-5 text-[#0C60FC] sm:block">
          sharing pays off ↘
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={QUBI_PEEK_SRC}
          alt="Qubi celebrating a referral"
          className="h-20 w-20 object-contain sm:h-24 sm:w-24"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative grid items-center gap-8 lg:grid-cols-[1fr_.9fr]"
      >
        <div className="space-y-3">
          <p className="hand text-2xl text-[#0C60FC]">
            good vibes, great discounts ✦
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Share the knowledge, <br /> get 15% off.
          </h2>
          <p className="max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Invite your friends to Qz. When they complete their first
            subscription, you&apos;ll get a 15% discount on your next renewal.
          </p>

          <div className="mt-4">
            {status.referredCount > 0 ? (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-sm font-bold leading-none text-slate-950">
                    {status.referredCount}
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                    Friends Referred
                  </span>
                </div>

                {status.hasPendingDiscount && (
                  <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
                    <Sparkles className="h-3 w-3 text-emerald-600" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                      Reward Pending
                    </span>
                  </div>
                )}
              </div>
            ) : (
              // Empty state — four greyscale placeholder tiles + a "+1 others"
              // chip, mirroring the donor ledger's avatar stack. Qubi peeks
              // in to soften the "no one yet" moment.
              <div className="relative">
                <span className="hand absolute -right-1 -top-9 hidden rotate-[6deg] text-sm leading-4 text-[#0C60FC] sm:block">
                  uh oh, no one&apos;s here ↘
                </span>
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#E9FFD3] bg-slate-100 text-slate-300 grayscale"
                        aria-hidden="true"
                      >
                        <Users className="h-4 w-4" />
                      </span>
                    ))}
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#E9FFD3] bg-white text-[10px] font-extrabold text-slate-400">
                      +1
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-5 text-slate-600">
                  Your crew&apos;s not here yet — share the link to fill these spots ✦
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleCopyCode}
            className="group/btn flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 transition hover:border-[#0C60FC]/40 hover:bg-blue-50/50"
          >
            <div className="flex items-center gap-2">
              <Gift className="h-3.5 w-3.5 text-[#0C60FC]" />
              <span className="text-sm font-bold tracking-widest text-[#0C60FC]">
                {status.code}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                {copiedCode ? "Copied" : "Code"}
              </span>
              {copiedCode ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3 text-slate-400 transition-colors group-hover/btn:text-[#0C60FC]" />
              )}
            </div>
          </button>

          <button
            onClick={handleCopyLink}
            className="squishy flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0C60FC]"
          >
            <Link2 className="h-4 w-4" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest">
              {copiedLink ? "Link Copied" : "Copy Invite Link"}
            </span>
          </button>
        </div>
      </motion.div>
    </section>
  );
}
