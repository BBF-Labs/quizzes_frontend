"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { SquareLoader } from "@/components/ui/square-loader";

interface PushOptInStepProps {
  onComplete: (data: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>;
}

export default function PushOptInStep({ onComplete }: PushOptInStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestPermission = async () => {
    setIsSubmitting(true);
    try {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        onComplete({ pushPermission: permission });
      } else {
        onComplete({ pushPermission: "unsupported" });
      }
    } catch {
      onComplete({ pushPermission: "denied" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onComplete({ pushPermission: "skipped" });
  };

  return (
    <div className="flex flex-col items-center text-center space-y-12 py-8">
      {/* Animated Icon Container */}
      <div className="relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [1, 1.1, 1], opacity: 1 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="size-32 bg-primary/5 flex items-center justify-center border border-primary/10"
        >
          <Bell className="size-12 text-primary animate-pulse" />
        </motion.div>
        {/* Decorative orbit dots */}
        <div className="absolute inset-0 flex items-center justify-center animate-[spin_8s_linear_infinite]">
          <div className="size-1.5 bg-primary absolute -top-1" />
        </div>
      </div>

      <div className="space-y-4 max-w-85">
        <h1 className="text-3xl font-black tracking-[-0.04em] uppercase">
          Don&apos;t MISS A BEAT.
        </h1>
        <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest leading-relaxed">
          Don&apos;t miss out on important updates.
        </p>
      </div>

      <div className="w-full space-y-12">
        {/* Verification trust badges */}
        <div className="flex items-center justify-center gap-6 opacity-40">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3" />
            <span className="text-[9px] font-mono uppercase tracking-widest">
              Minimal Noise
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3" />
            <span className="text-[9px] font-mono uppercase tracking-widest">
              Opt-out anytime
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={requestPermission}
            disabled={isSubmitting}
            className="w-full rounded-(--radius) font-mono text-xs tracking-[0.2em] uppercase h-14 bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(var(--primary),0.15)] group"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <SquareLoader
                  size={20}
                  strokeWidth={2}
                  className="text-primary-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]"
                />
              </div>
            ) : (
              "Enable Notifications"
            )}
          </Button>
          <button
            onClick={handleSkip}
            className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors py-4 px-8 block mx-auto"
          >
            [ Maybe later ]
          </button>
        </div>
      </div>
    </div>
  );
}
