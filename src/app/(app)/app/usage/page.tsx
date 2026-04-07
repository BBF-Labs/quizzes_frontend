"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MessageSquare, BookOpen, CheckCircle, Clock, Flame, Zap,
  Brain, FileText, Upload, Star, ArrowRight, Snowflake,
  TrendingUp, Target, ThumbsUp, BarChart2,
} from "lucide-react";
import { useSessions } from "@/hooks";
import { useBillingStatus, useStreakStatus, useStreakFreeze } from "@/hooks";
import { useAnalyticsSummary } from "@/hooks/app/use-app-queries";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER_LABELS: Record<string, string> = {
  cooked: "Cooked",
  cruising: "Cruising",
  locked_in: "Locked In",
};

const DURATION_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  semester: "Semester",
};

const FEATURE_ROWS: Array<{
  key: keyof import("@/hooks").DailyUsage;
  limitKey: string;
  icon: React.ElementType;
  label: string;
}> = [
  { key: "tutorSessions",    limitKey: "tutorSessionsPerDay",    icon: Brain,     label: "Z Tutor Sessions"  },
  { key: "quizGenerations",  limitKey: "quizGenerationsPerDay",  icon: BookOpen,  label: "Quiz Generations"  },
  { key: "flashcardSets",    limitKey: "flashcardSetsPerDay",    icon: Zap,       label: "Flashcard Sets"    },
  { key: "mindMaps",         limitKey: "mindMapsPerDay",         icon: FileText,  label: "Mind Maps"         },
  { key: "materialUploads",  limitKey: "materialUploadsPerDay",  icon: Upload,    label: "Material Uploads"  },
];

// Phase display order and labels for the funnel
const PHASE_ORDER = [
  { key: "idle",              label: "Idle / Free Chat"     },
  { key: "analysis",         label: "Analysis"             },
  { key: "planning",         label: "Planning"             },
  { key: "awaiting_approval",label: "Awaiting Approval"    },
  { key: "implementation",   label: "Implementation"       },
  { key: "verification",     label: "Verification"         },
  { key: "signoff",          label: "Sign-Off"             },
  { key: "complete",         label: "Complete"             },
  { key: "interrupted",      label: "Interrupted"          },
];

const ARTIFACT_ICONS: Record<string, React.ElementType> = {
  quiz:      BookOpen,
  flashcard: Zap,
  mindmap:   Brain,
  lesson:    FileText,
  walkthrough: Star,
};

// ─── Subcomponents ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  delay,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: boolean;
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
        <Icon className={cn("size-4", accent ? "text-primary/70" : "text-muted-foreground/30")} />
      </div>
      <p className={cn("text-3xl font-black tracking-tighter", accent && "text-primary")}>
        {value}
      </p>
      {sub && (
        <p className="text-[10px] font-mono text-muted-foreground/50 -mt-1">{sub}</p>
      )}
    </motion.div>
  );
}

function StreakWidget({
  current,
  longest,
  freezesAvailable,
  isActive,
  delay,
}: {
  current: number;
  longest: number;
  freezesAvailable: number;
  isActive: boolean;
  delay: number;
}) {
  const freeze = useStreakFreeze();

  async function handleFreeze() {
    try {
      await freeze.mutateAsync();
      toast.success("Streak freeze used. Your streak is safe today.");
    } catch {
      toast.error("No freezes available.");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="border border-border/50 bg-card/40 px-5 py-5 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">
          Study Streak
        </span>
        <Flame className={cn("size-4", isActive ? "text-amber-400" : "text-muted-foreground/30")} />
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black tracking-tighter">{current}</span>
        <span className="text-xs font-mono text-muted-foreground">days</span>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
        <span>Longest: <span className="text-foreground">{longest}</span></span>
        {!isActive && current > 0 && (
          <span className="text-destructive/70">Broken</span>
        )}
      </div>

      {freezesAvailable > 0 && (
        <button
          onClick={handleFreeze}
          disabled={freeze.isPending}
          className="flex items-center gap-2 w-fit border border-sky-400/30 bg-sky-400/5 px-3 py-1.5 text-[10px] font-mono text-sky-400 hover:border-sky-400/60 transition-colors"
        >
          <Snowflake className="size-3" />
          Use freeze ({freezesAvailable} left)
        </button>
      )}
    </motion.div>
  );
}

function DailyLimitsGrid({
  usage,
  limits,
  delay,
}: {
  usage: import("@/hooks").DailyUsage;
  limits: import("@/hooks").TierLimits | null;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="border border-border/50 bg-card/40 p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">
          Today&apos;s Usage
        </span>
        <Star className="size-3 text-muted-foreground/30" />
      </div>

      <div className="flex flex-col gap-3">
        {FEATURE_ROWS.map(({ key, limitKey, icon: Icon, label }) => {
          const used = (usage[key] as number) ?? 0;
          const limit = limits ? (limits[limitKey as keyof typeof limits] as number | null) : 2;
          const unlimited = limit === null;
          const pct = unlimited ? 0 : limit === 0 ? 100 : Math.min(100, (used / limit) * 100);
          const nearLimit = !unlimited && limit !== null && used >= limit - 1;

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon className="size-3 text-muted-foreground/50" />
                  <span className="text-xs font-mono text-muted-foreground">{label}</span>
                </div>
                <span className={cn("text-xs font-mono", unlimited ? "text-primary" : nearLimit ? "text-amber-400" : "text-foreground")}>
                  {unlimited ? "∞" : `${used} / ${limit}`}
                </span>
              </div>
              {!unlimited && limit !== null && (
                <div className="h-0.5 bg-border/30 w-full">
                  <div
                    className={cn(
                      "h-full transition-all",
                      pct >= 100 ? "bg-destructive/60" : nearLimit ? "bg-amber-400/60" : "bg-primary/40",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function PhaseFunnel({
  sessionsByPhase,
  totalSessions,
}: {
  sessionsByPhase: Record<string, number>;
  totalSessions: number;
}) {
  const phases = PHASE_ORDER
    .map((p) => ({ ...p, count: sessionsByPhase[p.key] ?? 0 }))
    .filter((p) => p.count > 0);

  const max = Math.max(...phases.map((p) => p.count), 1);

  return (
    <div className="border border-border/50 bg-card/40 p-5">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">
          Phase Distribution
        </p>
        <span className="text-[10px] font-mono text-muted-foreground/40">
          {totalSessions} sessions · 90 days
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {phases.map(({ key, label, count }) => {
          const pct = (count / max) * 100;
          const isComplete = key === "complete";
          const isInterrupted = key === "interrupted";

          return (
            <div key={key} className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-muted-foreground/60 w-36 shrink-0 truncate">
                {label}
              </span>
              <div className="flex-1 h-5 bg-border/20 relative overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all",
                    isComplete
                      ? "bg-primary/60"
                      : isInterrupted
                      ? "bg-destructive/30"
                      : "bg-primary/20",
                  )}
                  style={{ width: `${pct}%` }}
                />
                <span className="absolute inset-0 flex items-center px-2 text-[9px] font-mono text-foreground/70">
                  {count}
                </span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground/50 w-8 text-right shrink-0">
                {totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ArtifactBreakdown({ artifactsByType }: { artifactsByType: Record<string, number> }) {
  const entries = Object.entries(artifactsByType).sort(([, a], [, b]) => b - a);
  const total = entries.reduce((sum, [, n]) => sum + n, 0);
  if (entries.length === 0) return null;

  return (
    <div className="border border-border/50 bg-card/40 p-5">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">
          Artifacts Generated
        </p>
        <span className="text-[10px] font-mono text-muted-foreground/40">
          {total} total
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {entries.map(([type, count]) => {
          const Icon = ARTIFACT_ICONS[type] ?? FileText;
          const pct = Math.round((count / total) * 100);

          return (
            <div key={type} className="flex items-center gap-3">
              <Icon className="size-3 text-muted-foreground/40 shrink-0" />
              <span className="text-[10px] font-mono text-muted-foreground/70 w-24 shrink-0 capitalize">
                {type}
              </span>
              <div className="flex-1 h-1 bg-border/20">
                <div
                  className="h-full bg-primary/50 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-foreground w-6 text-right shrink-0">
                {count}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground/40 w-8 text-right shrink-0">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SatisfactionBar({
  positiveRatings,
  negativeRatings,
}: {
  positiveRatings: number;
  negativeRatings: number;
}) {
  const total = positiveRatings + negativeRatings;
  if (total === 0) return null;
  const score = Math.round((positiveRatings / total) * 100);

  return (
    <div className="border border-border/50 bg-card/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">
          Z Response Satisfaction
        </p>
        <ThumbsUp className="size-3 text-muted-foreground/30" />
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-black tracking-tighter text-primary">{score}%</span>
        <span className="text-[10px] font-mono text-muted-foreground/50">positive</span>
      </div>

      <div className="h-1 w-full bg-border/20 mb-2">
        <div
          className="h-full bg-primary/60 transition-all"
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="flex justify-between text-[9px] font-mono text-muted-foreground/40">
        <span>{positiveRatings} 👍</span>
        <span>{negativeRatings} 👎</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsagePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const { data: billing, isLoading: billingLoading } = useBillingStatus();
  const { data: streak, isLoading: streakLoading } = useStreakStatus();

  const stats = useMemo(() => {
    const total = sessions.length;
    const active = sessions.filter((s) => s.status === "active").length;
    const completed = sessions.filter((s) => s.status === "completed").length;
    const freeChat = sessions.filter((s) => s.mode === "free").length;
    return { total, active, completed, freeChat };
  }, [sessions]);

  const isSuperAdmin = user?.role === "super_admin";
  const isPaidTier = isSuperAdmin || billing?.planTier === "cruising" || billing?.planTier === "locked_in";
  const { data: analytics } = useAnalyticsSummary();
  const isLoading = sessionsLoading || billingLoading || streakLoading;

  const completionRate = analytics && analytics.totalSessions > 0
    ? Math.round((analytics.completedSessions / analytics.totalSessions) * 100)
    : 0;

  const avgMsgsPerSession = analytics && analytics.totalSessions > 0
    ? Math.round(analytics.totalMessagesSent / analytics.totalSessions)
    : 0;

  return (
    <div className="min-h-full px-4 py-8">
      <div className="mx-auto max-w-5xl">

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
            Daily limits, streak, and study analytics.
          </p>
          <div className="mt-4 h-px w-10 bg-primary/40" />
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse bg-card/40 border border-border/30" />
            ))}
          </div>
        ) : (
          <>
            {/* Plan + credits row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                className="border border-border/50 bg-card/40 px-5 py-5 flex flex-col gap-2"
              >
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">
                  Current Plan
                </span>
                {billing?.planTier ? (
                  <>
                    <p className="text-xl font-black tracking-tighter">
                      {TIER_LABELS[billing.planTier] ?? billing.planTier}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {DURATION_LABELS[billing.planDuration!] ?? billing.planDuration}
                      {billing.subscriptionEndsAt && (
                        <span className="block text-muted-foreground/50">
                          Until {new Date(billing.subscriptionEndsAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </>
                ) : isSuperAdmin ? (
                  <p className="text-xl font-black tracking-tighter text-primary">Super Admin</p>
                ) : (
                  <>
                    <p className="text-xl font-black tracking-tighter text-muted-foreground">Free</p>
                    <button
                      onClick={() => router.push("/app/billing")}
                      className="flex items-center gap-1 text-[10px] font-mono text-primary hover:underline underline-offset-2 w-fit"
                    >
                      Upgrade <ArrowRight className="size-2.5" />
                    </button>
                  </>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="border border-border/50 bg-card/40 px-5 py-5 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">
                    Credits
                  </span>
                  <Zap className="size-3 text-amber-400" />
                </div>
                <p className="text-3xl font-black tracking-tighter text-amber-400">
                  {billing?.credits.balance ?? 0}
                </p>
                <button
                  onClick={() => router.push("/app/billing#credits")}
                  className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-amber-400 transition-colors w-fit"
                >
                  Top up <ArrowRight className="size-2.5" />
                </button>
              </motion.div>
            </div>

            {/* Daily limits */}
            {billing?.dailyUsage && (
              <div className="mb-4">
                <DailyLimitsGrid
                  usage={billing.dailyUsage}
                  limits={billing.planLimits}
                  delay={0.1}
                />
              </div>
            )}

            {/* Streak */}
            {streak && (
              <div className="mb-4">
                <StreakWidget
                  current={streak.current}
                  longest={streak.longest}
                  freezesAvailable={streak.freezesAvailable}
                  isActive={streak.isActive}
                  delay={0.15}
                />
              </div>
            )}

            {/* Session overview */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <StatCard
                label="Total Sessions"
                value={stats.total}
                icon={BookOpen}
                delay={0.2}
              />
              <StatCard
                label="Completed"
                value={stats.completed}
                sub={stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}% completion rate` : undefined}
                icon={CheckCircle}
                delay={0.22}
              />
              <StatCard
                label="Active"
                value={stats.active}
                icon={Clock}
                delay={0.24}
              />
              <StatCard
                label="Free Chat Sessions"
                value={stats.freeChat}
                icon={MessageSquare}
                delay={0.26}
              />
            </div>

            {/* Analytics section */}
            {isPaidTier && analytics ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 space-y-4"
              >
                {/* Section header */}
                <div className="flex items-center gap-3">
                  <div className="inline-block border border-primary/30 bg-primary/5 px-2 py-0.5">
                    <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-primary">
                      90-Day Analytics
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-border/30" />
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-border/50 bg-card/40 px-4 py-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50">
                        Completion Rate
                      </span>
                      <Target className="size-3 text-muted-foreground/30" />
                    </div>
                    <p className="text-2xl font-black tracking-tighter text-primary">{completionRate}%</p>
                    <p className="text-[9px] font-mono text-muted-foreground/40">
                      {analytics.completedSessions} of {analytics.totalSessions}
                    </p>
                  </div>

                  <div className="border border-border/50 bg-card/40 px-4 py-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50">
                        Msgs / Session
                      </span>
                      <TrendingUp className="size-3 text-muted-foreground/30" />
                    </div>
                    <p className="text-2xl font-black tracking-tighter">{avgMsgsPerSession}</p>
                    <p className="text-[9px] font-mono text-muted-foreground/40">
                      {analytics.totalMessagesSent} total
                    </p>
                  </div>

                  <div className="border border-border/50 bg-card/40 px-4 py-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50">
                        Avg Duration
                      </span>
                      <BarChart2 className="size-3 text-muted-foreground/30" />
                    </div>
                    <p className="text-2xl font-black tracking-tighter">{analytics.avgSessionDurationMinutes}m</p>
                    <p className="text-[9px] font-mono text-muted-foreground/40">
                      {analytics.studyDaysThisMonth} study days this month
                    </p>
                  </div>
                </div>

                {/* Phase funnel */}
                <PhaseFunnel
                  sessionsByPhase={analytics.sessionsByPhase}
                  totalSessions={analytics.totalSessions}
                />

                {/* Artifact breakdown + satisfaction */}
                <div className="grid grid-cols-2 gap-3">
                  <ArtifactBreakdown artifactsByType={analytics.artifactsByType} />
                  <SatisfactionBar
                    positiveRatings={analytics.positiveRatings}
                    negativeRatings={analytics.negativeRatings}
                  />
                </div>
              </motion.div>
            ) : !isPaidTier && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 border border-border/30 bg-card/20 px-5 py-6 text-center"
              >
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-2">
                  Detailed analytics
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Phase funnels, artifact breakdowns, and session stats are available on Cruising and Locked In plans.
                </p>
                <button
                  onClick={() => router.push("/app/billing")}
                  className="text-[10px] font-mono uppercase tracking-widest text-primary hover:underline"
                >
                  Upgrade to unlock →
                </button>
              </motion.div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
