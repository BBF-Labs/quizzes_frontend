"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useDonationLedger } from "@/hooks/common/use-donations";

const HIDE_KEY = "qz_donation_banner_hide_until";
const REMEMBER_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function isHidden(): boolean {
  if (typeof window === "undefined") return false;
  const val = localStorage.getItem(HIDE_KEY);
  if (!val) return false;
  return Date.now() < Number(val);
}

function hide(forever = false) {
  localStorage.setItem(HIDE_KEY, String(Date.now() + (forever ? REMEMBER_MS : 24 * 60 * 60 * 1000)));
}

export function DonationBanner() {
  const { data: ledger } = useDonationLedger();
  const [hidden, setHidden] = useState(true); // start hidden until hydrated
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hydrate after mount so SSR/CSR match
  useEffect(() => {
    setHidden(isHidden());
  }, []);

  const donations = ledger?.donations ?? [];

  // Auto-advance carousel
  useEffect(() => {
    if (donations.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % donations.length);
    }, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [donations.length]);

  if (hidden || donations.length === 0) return null;

  const current = donations[idx];
  const donorLabel = current.isAnonymous ? "Someone" : (current.donorName || "Someone");
  const total = ledger?.totalRaisedGHS ?? 0;

  const prev = () => setIdx((i) => (i - 1 + donations.length) % donations.length);
  const next = () => setIdx((i) => (i + 1) % donations.length);

  const dismiss = (remember: boolean) => {
    hide(remember);
    setHidden(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -48 }}
        animate={{ y: 0 }}
        exit={{ y: -48 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 w-full z-[60] h-12 bg-primary/10 border-b border-primary/20 backdrop-blur-md flex items-center"
      >
        <div className="container mx-auto px-4 max-w-6xl flex items-center justify-between gap-4 h-full">

          {/* Left: icon + message */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Heart className="size-3.5 text-primary shrink-0 animate-pulse" />

            <AnimatePresence mode="wait">
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-[11px] font-mono text-foreground truncate"
              >
                <span className="font-bold">{donorLabel}</span>
                {" donated "}
                <span className="text-primary font-bold">GHS {current.amount}</span>
                {current.message && (
                  <span className="text-muted-foreground"> · &ldquo;{current.message}&rdquo;</span>
                )}
                {donations.length === 1 && total > 0 && (
                  <span className="text-muted-foreground/60 ml-2">· GHS {total.toFixed(2)} raised total</span>
                )}
              </motion.p>
            </AnimatePresence>

            {/* Carousel controls — only when multiple */}
            {donations.length > 1 && (
              <div className="flex items-center gap-1 shrink-0 ml-1">
                <button onClick={prev} className="p-0.5 text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronLeft className="size-3" />
                </button>
                <span className="text-[9px] font-mono text-muted-foreground/50 tabular-nums">
                  {idx + 1}/{donations.length}
                </span>
                <button onClick={next} className="p-0.5 text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronRight className="size-3" />
                </button>
              </div>
            )}
          </div>

          {/* Right: total + actions */}
          {donations.length > 1 && (
            <span className="text-[10px] font-mono text-muted-foreground/60 shrink-0 hidden sm:block">
              GHS {total.toFixed(2)} raised
            </span>
          )}

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => dismiss(true)}
              className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 hover:text-muted-foreground transition-colors hidden sm:block"
            >
              Don&apos;t show again
            </button>
            <button
              onClick={() => dismiss(false)}
              aria-label="Dismiss"
              className="p-1 border border-primary/20 hover:border-primary/50 text-primary/70 hover:text-primary transition-colors"
            >
              <X className="size-3" />
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
