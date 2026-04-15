"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import {
  useDonationLedger,
  useInitiateDonation,
} from "@/hooks/common/use-donations";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const AMOUNT_PRESETS = [50, 100, 200, 500, 1000];

export function DonationWidget() {
  const { user } = useAuth();
  const { data: ledger } = useDonationLedger();
  const { mutate: initiate, isPending } = useInitiateDonation();

  const [amount, setAmount] = useState<number | "">(50);
  const [email, setEmail] = useState((user as any)?.email ?? "");
  const [donorName, setDonorName] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) < 1) {
      toast.error("Enter an amount of at least GHS 1");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Enter a valid email address");
      return;
    }
    initiate({
      email: email.trim().toLowerCase(),
      amountGHS: Number(amount),
      donorName: isAnonymous ? undefined : donorName || undefined,
      message: message || undefined,
      isAnonymous,
    });
  }

  return (
    <div className="border border-border/50 bg-card/30 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-start flex-col gap-3 mb-6">
        <div className="flex size-8 shrink-0 items-center justify-center border border-primary/30 bg-primary/10">
          <Heart className="size-4 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-black tracking-tighter">Support Qz</h3>
          <p className="text-sm text-muted-foreground font-mono mt-0.5">
            Help cover AI API costs and keep Qz free for students who can&apos;t
            afford a subscription.
          </p>
        </div>
      </div>

      {/* Ledger counter */}
      {ledger && ledger.totalRaisedGHS >= 1000 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-5 flex items-center gap-4 border border-border/30 bg-background/40 px-4 py-3"
        >
          <div className="text-center">
            <p className="text-lg font-black tracking-tighter text-primary">
              GHS{" "}
              {ledger.totalRaisedGHS.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">
              raised from {ledger.donations.length} supporter
              {ledger.donations.length !== 1 ? "s" : ""}
            </p>
          </div>
          {ledger.platformPledgeGHS > 0 && (
            <p className="text-[10px] font-mono text-muted-foreground/50 border-l border-border/30 pl-4">
              GHS {ledger.platformPledgeGHS.toFixed(2)} pledged to student
              access fund
            </p>
          )}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount presets */}
        <div>
          <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 block">
            Amount (GHS)
          </label>
          <div className="flex gap-2 mb-2">
            {AMOUNT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={cn(
                  "flex-1 py-1.5 text-[11px] font-mono border transition-colors",
                  amount === preset
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 text-muted-foreground hover:border-primary/40",
                )}
              >
                {preset}
              </button>
            ))}
          </div>
          <input
            type="number"
            min={1}
            step={1}
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="Custom amount"
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/30"
          />
        </div>

        {/* Email — pre-filled if logged in */}
        <div>
          <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 block">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/30"
          />
        </div>

        {/* Anonymous toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={isAnonymous}
            onClick={() => setIsAnonymous((v) => !v)}
            className={cn(
              "relative inline-flex items-center w-10 h-5 shrink-0 border transition-colors duration-200 rounded-full",
              isAnonymous
                ? "bg-primary border-primary"
                : "bg-muted/30 border-border/50",
            )}
          >
            <span
              className={cn(
                "inline-block w-4 h-4 bg-white shadow-sm transition-transform duration-200 rounded-full",
                isAnonymous ? "translate-x-5" : "translate-x-0.5",
              )}
            />
          </button>
          <span className="text-[11px] font-mono text-muted-foreground">
            Donate anonymously
          </span>
        </label>

        {!isAnonymous && (
          <input
            type="text"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder="Your name (optional)"
            maxLength={60}
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/30"
          />
        )}

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Leave a message (optional)"
          maxLength={200}
          rows={2}
          className="w-full border border-border/50 bg-background/40 px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/30 resize-none"
        />

        <button
          type="submit"
          disabled={isPending || !amount}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 text-[11px] font-mono uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="size-3 animate-spin" /> Processing…
            </>
          ) : (
            <>
              <Heart className="size-3" /> Donate GHS {amount || "—"}
            </>
          )}
        </button>
      </form>

      {/* Recent donors */}
      {ledger && ledger.totalRaisedGHS >= 1000 && ledger.donations.length > 0 && (
        <div className="mt-5 space-y-1">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/40 mb-2">
            Recent supporters
          </p>
          {ledger.donations.slice(0, 5).map((d) => (
            <div
              key={d._id}
              className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/50"
            >
              <span>
                {d.isAnonymous ? "Anonymous" : d.donorName || "Anonymous"}
              </span>
              <span className="text-muted-foreground">GHS {d.amount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
