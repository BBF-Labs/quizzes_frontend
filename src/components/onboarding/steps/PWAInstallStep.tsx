"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Layout } from "lucide-react";
import { motion } from "framer-motion";

interface PWAInstallStepProps {
  onComplete: (data: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PWAInstallStep({ onComplete }: PWAInstallStepProps) {
  const [platform, setPlatform] = useState<"ios" | "android" | "other" | null>(
    null,
  );
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Detect platform
    const ua = window.navigator.userAgent.toLowerCase();

    let targetPlatform: "ios" | "android" | null = null;
    if (ua.indexOf("iphone") > -1 || ua.indexOf("ipad") > -1)
      targetPlatform = "ios";
    else if (ua.indexOf("android") > -1) targetPlatform = "android";

    if (targetPlatform && platform !== targetPlatform) {
      const timer = setTimeout(() => {
        setPlatform(targetPlatform);
      }, 0);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const installedHandler = () => {
      onComplete({ pwaStatus: "installed" });
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, [platform, onComplete]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      onComplete({ pwaStatus: outcome });
      setDeferredPrompt(null);
    } else {
      // Manual instructions or just proceed
      onComplete({ pwaStatus: "manual_instructions_shown" });
    }
  };

  const handleSkip = () => {
    onComplete({ pwaStatus: "skipped" });
  };

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-black tracking-[-0.04em] uppercase leading-tight">
          Keep Qz. close.
        </h1>
        <p className="text-sm font-mono text-muted-foreground uppercase tracking-[0.2em] leading-relaxed">
          Install the web app for a native experience and faster access.
        </p>
      </div>

      <div className="space-y-8">
        {/* Device Frame Visualization */}
        <div className="relative h-50 border border-border bg-secondary/10 flex items-center justify-center group overflow-hidden">
          <Smartphone className="size-24 text-primary/20 group-hover:scale-110 transition-transform duration-700" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-16 bg-primary/10 border border-primary/20 backdrop-blur-md flex items-center justify-center"
          >
            <span className="font-black text-primary text-xl tracking-tighter">
              Qz.
            </span>
          </motion.div>

          {/* Floating UI element */}
          <div className="absolute bottom-4 right-4 p-2 bg-background border border-border shadow-2xl -skew-x-12 flex items-center gap-2">
            <Download className="size-3 text-primary" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              App Manifest Active
            </span>
          </div>
        </div>

        {platform === "ios" ? (
          <div className="p-4 bg-secondary/40 border border-border space-y-3">
            <p className="text-[10px] font-mono text-primary uppercase tracking-widest font-bold">
              iOS Instructions:
            </p>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
              1. Tap the <span className="text-primary font-bold">Share</span>{" "}
              icon in Safari&apos;s menu bar.
            </p>
            <ol className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest space-y-2 list-decimal pl-4">
              <li>
                Scroll down and select{" "}
                <span className="text-primary font-bold">
                  Add to Home Screen
                </span>
              </li>
              <li>
                Tap <span className="text-primary font-bold">Add</span> to
                confirm
              </li>
            </ol>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              onClick={handleInstall}
              className="w-full rounded-(--radius) font-mono text-xs tracking-[0.2em] uppercase h-14 bg-secondary hover:bg-secondary/80 border border-border group"
            >
              <Download className="size-4 mr-2 group-hover:translate-y-0.5 transition-transform" />
              {deferredPrompt ? "Install Web App" : "View Instructions"}
            </Button>
          </div>
        )}

        <button
          onClick={handleSkip}
          className="w-full text-[10px] font-mono tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors text-center"
        >
          [ I&apos;ll stay in the browser ]
        </button>
      </div>

      <div className="flex border-t border-border/40 pt-8 justify-center gap-8 opacity-40 grayscale">
        <Smartphone className="size-4" />
        <Layout className="size-4" />
      </div>
    </div>
  );
}
