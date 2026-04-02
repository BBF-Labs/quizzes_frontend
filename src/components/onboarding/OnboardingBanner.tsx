"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useAuthQuery } from "@/hooks";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  getEndOfTodayTimestamp,
  isOnboardingBannerTemporarilyHidden,
  setOnboardingBannerHideUntil,
} from "@/lib/onboarding-banner";

export default function OnboardingBanner() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [isTemporarilyHidden, setIsTemporarilyHidden] = useState(() =>
    isOnboardingBannerTemporarilyHidden(),
  );

  const {
    data: onboardingStatus,
    isLoading: onboardingStatusLoading,
    isFetched: onboardingStatusFetched,
  } = useAuthQuery({
    queryKey: queryKeys.onboardingStatus,
    queryFn: async () => {
      const res = await api.get("/users/onboarding/status");
      return res.data?.data;
    },
    enabled: !!user,
  });

  // Don't show on the actual onboarding page
  if (pathname?.startsWith("/onboarding")) return null;

  // Wait for backend onboarding status before deciding visibility.
  // Also guard on isFetched: when useAuthQuery is disabled (auth hydrating),
  // isLoading is false but data is undefined — isFetched distinguishes that state.
  if (user && (!onboardingStatusFetched || onboardingStatusLoading))
    return null;

  const onboardingCompleted =
    onboardingStatus?.completed ?? user?.onboarding?.completed ?? false;

  // Only show if onboarding is not completed
  if (!user || onboardingCompleted || isTemporarilyHidden) return null;

  const hideToday = () => {
    setOnboardingBannerHideUntil(getEndOfTodayTimestamp());
    setIsTemporarilyHidden(true);
    setShowDismissModal(false);
  };

  const remindInDays = (days: number) => {
    setOnboardingBannerHideUntil(Date.now() + days * 24 * 60 * 60 * 1000);
    setIsTemporarilyHidden(true);
    setShowDismissModal(false);
  };

  return (
    <AnimatePresence>
      <>
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-0 left-0 w-full bg-primary/10 border-b border-primary/20 backdrop-blur-md z-100 h-12.25"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-8  bg-primary/20 flex items-center justify-center animate-pulse">
                <Sparkles className="size-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-black uppercase tracking-[-0.02em] leading-tight">
                  Personalise your experience
                </p>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-tight">
                  Complete your profile to unlock tailored materials from Z.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/onboarding")}
                className="flex items-center gap-2 group whitespace-nowrap"
              >
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest border-b border-primary/40 group-hover:border-primary transition-colors pb-0.5">
                  Continue Onboarding
                </span>
                <ArrowRight className="size-3 text-primary group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                type="button"
                aria-label="Dismiss onboarding banner"
                onClick={() => setShowDismissModal(true)}
                className="p-1 border border-primary/20 hover:border-primary/50 text-primary/80 hover:text-primary transition-colors"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        </motion.div>

        <Dialog open={showDismissModal} onOpenChange={setShowDismissModal}>
          <DialogContent className="sm:max-w-sm rounded-none">
            <DialogHeader>
              <DialogTitle className="font-mono text-sm uppercase tracking-widest">
                Hide Onboarding Banner
              </DialogTitle>
              <DialogDescription className="font-mono text-xs uppercase tracking-wider">
                Choose when you want to see this reminder again.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:justify-start">
              <Button
                type="button"
                variant="outline"
                className="rounded-none text-[10px] font-mono uppercase tracking-widest"
                onClick={hideToday}
              >
                Hide Today
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-none text-[10px] font-mono uppercase tracking-widest"
                onClick={() => remindInDays(3)}
              >
                Remind In 3 Days
              </Button>
              <Button
                type="button"
                className="rounded-none text-[10px] font-mono uppercase tracking-widest"
                onClick={() => setShowDismissModal(false)}
              >
                Keep Showing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    </AnimatePresence>
  );
}
