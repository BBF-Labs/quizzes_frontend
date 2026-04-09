"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, Timer, Users, Trophy, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RoomOverlaysProps {
  state: "waiting" | "focus" | "ready_check" | "game_start" | null;
  message?: string;
  subMessage?: string;
}

export function RoomOverlays({ state, message, subMessage }: RoomOverlaysProps) {
  if (!state) return null;

  const content = {
    waiting: {
      bg: "bg-indigo-950/80",
      icon: <Users className="size-16 text-indigo-400" />,
      title: "Waiting for Crew",
      description: "Once everyone is ready, we'll start the sprint.",
      accent: "border-indigo-400/30",
    },
    focus: {
        bg: "bg-black/90",
        icon: <Timer className="size-16 text-emerald-400 animate-pulse" />,
        title: "Deep Focus Mode",
        description: "Zero distractions. Time to level up your knowledge.",
        accent: "border-emerald-400/30",
    },
    ready_check: {
        bg: "bg-indigo-900/90",
        icon: <Play className="size-16 text-amber-400" />,
        title: "Ready Check!",
        description: "Verify your attendance to start the game.",
        accent: "border-amber-400/30",
    },
    game_start: {
        bg: "bg-fuchsia-950/90",
        icon: <Trophy className="size-16 text-yellow-400" />,
        title: "Game Starting",
        description: "Get ready to compete for the top spot!",
        accent: "border-yellow-400/30",
    }
  }[state];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md",
          content.bg
        )}
      >
        <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className={cn(
                "relative flex w-full max-w-2xl flex-col items-center gap-8 rounded-3xl border-4 bg-white/5 p-12 text-center text-white shadow-2xl backdrop-blur-3xl",
                content.accent
            )}
        >
            <div className="absolute -top-10 flex size-20 items-center justify-center rounded-2xl bg-indigo-600 shadow-xl border-b-4 border-indigo-800">
                {content.icon}
            </div>

            <div className="mt-4 space-y-4">
                <h2 className="text-4xl font-black uppercase tracking-tight sm:text-6xl">
                    {message || content.title}
                </h2>
                <p className="mx-auto max-w-md text-lg font-medium text-indigo-200">
                    {subMessage || content.description}
                </p>
            </div>

            <div className="flex flex-col items-center gap-6">
                <div className="flex h-1.5 w-64 overflow-hidden rounded-full bg-white/10">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="bg-indigo-400" 
                    />
                </div>
                
                <Badge variant="outline" className="rounded-full border-white/20 px-6 py-2 text-sm font-bold uppercase tracking-widest text-indigo-300">
                   Session in Progress
                </Badge>
            </div>

            {/* Locked Padlock Icon for visual weight */}
            <div className="absolute -bottom-5 -right-5 rotate-12 opacity-20">
                <Lock className="size-24" />
            </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
