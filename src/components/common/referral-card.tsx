"use client";

import { useReferralStatus } from "@/hooks/common/use-billing";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Gift, Users, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
      <div className="p-6 border border-border/50 bg-card rounded-(--radius) animate-pulse h-[200px]" />
    );
  }

  if (!status) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden p-6 border border-border/10 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl rounded-(--radius) shadow-2xl group"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 size-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
      <div className="absolute bottom-0 left-0 -ml-12 -mb-12 size-32 bg-primary/5 rounded-full blur-2xl" />

      <div className="relative flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="space-y-2 max-w-sm">
          <div className="flex items-center gap-2 text-primary">
            <Gift className="size-4" />
            <span className="text-xs font-mono uppercase tracking-widest font-bold">
              Refer & Save
            </span>
          </div>
          <h3 className="text-xl font-black tracking-tighter">
            Share the knowledge, <br /> get 15% off.
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Invite your friends to Qz. When they complete their first subscription, you&apos;ll get a 15% discount on your next renewal.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 w-full md:w-auto">
          <div className="flex flex-col gap-2 w-full md:w-48">
            <button
              onClick={handleCopyCode}
              className="relative w-full h-12 bg-background border border-border/40 hover:border-primary/50 flex items-center justify-between px-4 transition-all duration-300 group/btn rounded-(--radius)"
            >
              <span className="text-sm font-mono font-bold tracking-widest text-primary">
                {status.code}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-muted-foreground/60">
                  {copiedCode ? "Copied" : "Code"}
                </span>
                {copiedCode ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3 text-muted-foreground group-hover/btn:text-primary transition-colors" />
                )}
              </div>
            </button>

            <button
              onClick={handleCopyLink}
              className="relative w-full h-10 bg-primary/5 border border-primary/20 hover:bg-primary/10 flex items-center justify-center gap-2 transition-all duration-300 rounded-(--radius)"
            >
              <Sparkles className="size-3 text-primary animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                {copiedLink ? "Link Copied" : "Copy Invite Link"}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="size-3 text-muted-foreground" />
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold leading-none">
                  {status.referredCount}
                </span>
                <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-tighter">
                  Friends Referred
                </span>
              </div>
            </div>

            {status.hasPendingDiscount && (
              <div className="flex items-center gap-2 py-1 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <Sparkles className="size-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase font-mono">
                  Reward Pending
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
