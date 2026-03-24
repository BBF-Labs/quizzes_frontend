"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { MessageSquare, BookOpen, CheckCircle, Clock } from "lucide-react";
import { useSessions } from "@/hooks";

function StatCard({
  label,
  value,
  icon: Icon,
  delay,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay ?? 0 }}
      className="border border-border/50 bg-card/40 px-5 py-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">
          {label}
        </span>
        <Icon className="size-4 text-primary/50" />
      </div>
      <p className="text-3xl font-black tracking-tighter text-foreground">
        {value}
      </p>
    </motion.div>
  );
}

export default function UsagePage() {
  const { data: sessions = [], isLoading } = useSessions();

  const stats = useMemo(() => {
    const total = sessions.length;
    const active = sessions.filter((s) => s.status === "active").length;
    const completed = sessions.filter((s) => s.status === "completed").length;
    // Estimate: sessions list doesn't carry message count, so we show session count as proxy
    return { total, active, completed };
  }, [sessions]);

  return (
    <div className="min-h-full px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-block border border-primary/40 bg-primary/5 px-2 py-1 mb-4">
            <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-primary">
              Usage
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter">Your Usage</h1>
          <p className="mt-2 text-sm text-muted-foreground font-mono">
            A snapshot of your study activity with Z.
          </p>
          <div className="mt-4 h-px w-10 bg-primary/40" />
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse bg-card/40 border border-border/30"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Total Sessions"
              value={stats.total}
              icon={BookOpen}
              delay={0}
            />
            <StatCard
              label="Active Sessions"
              value={stats.active}
              icon={Clock}
              delay={0.05}
            />
            <StatCard
              label="Completed"
              value={stats.completed}
              icon={CheckCircle}
              delay={0.1}
            />
            <StatCard
              label="Free Chat"
              value={sessions.filter((s) => s.mode === "free").length}
              icon={MessageSquare}
              delay={0.15}
            />
          </div>
        )}

        <p className="mt-8 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/30 text-center">
          Detailed analytics coming soon
        </p>
      </div>
    </div>
  );
}
