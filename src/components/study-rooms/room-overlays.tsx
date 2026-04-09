"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Timer, Users, Trophy, Play, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RoomOverlaysProps {
  state: "waiting" | "focus" | "ready_check" | "game_start" | null;
  message?: string;
  subMessage?: string;
  onDismiss?: () => void;
}

export function RoomOverlays({ state, message, subMessage, onDismiss }: RoomOverlaysProps) {
  if (!state) return null;

  const content = {
    waiting: {
      bg: "bg-background/90",
      icon: <Users className="size-10 text-primary" />,
      title: "Wait for Dispatch",
      description: "Awaiting all personnel for the sprint cycle.",
      accent: "border-primary/20",
    },
    focus: {
        bg: "bg-background/95",
        icon: <Timer className="size-10 text-primary animate-pulse" />,
        title: "Deep Focus Mode",
        description: "Zero distractions authorized. Max performance only.",
        accent: "border-primary/20",
    },
    ready_check: {
        bg: "bg-background/90",
        icon: <Play className="size-10 text-primary" />,
        title: "Ready Check!",
        description: "Verify your attendance to start the game.",
        accent: "border-primary/20",
    },
    game_start: {
        bg: "bg-background/90",
        icon: <Trophy className="size-10 text-primary" />,
        title: "Game Loaded",
        description: "Prepare for competitive evaluation.",
        accent: "border-primary/20",
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
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className={cn(
                "relative flex w-full max-w-xl flex-col items-center gap-8 rounded-(--radius) border border-border/50 bg-card p-12 text-center text-foreground shadow-2xl backdrop-blur-3xl",
                content.accent
            )}
        >
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-4 rounded-full text-muted-foreground hover:bg-white/10"
                onClick={onDismiss}
            >
                <X className="size-5" />
            </Button>

            <div className="size-20 flex items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-sm">
                {content.icon}
            </div>

            <div className="mt-4 space-y-4">
                <h2 className="text-3xl font-mono font-black italic tracking-tighter sm:text-5xl text-foreground">
                    {message || content.title}
                </h2>
                <p className="mx-auto max-w-sm text-xs font-mono font-bold tracking-widest text-muted-foreground">
                    {subMessage || content.description}
                </p>
            </div>

            <div className="flex flex-col items-center gap-6 w-full">
                <div className="flex h-1 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="bg-primary" 
                    />
                </div>
                
                <Badge variant="outline" className="rounded-(--radius) border-border/50 px-6 py-2 text-[10px] font-mono font-bold tracking-[0.2em] text-muted-foreground">
                   Active Operation
                </Badge>
            </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
