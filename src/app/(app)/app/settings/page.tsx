"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Brain,
  Users,
  Tag,
  GraduationCap,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useStudentVerifyStatus, useInitiateStudentVerify } from "@/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Mail } from "lucide-react";

// ─── localStorage-backed toggle ───────────────────────────────────────────────

function useLocalToggle(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as boolean) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const toggle = () => {
    setValue((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return [value, toggle] as const;
}

function useLocalSelect(key: string, defaultValue: string) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? stored : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const set = (next: string) => {
    setValue(next);
    try {
      localStorage.setItem(key, next);
    } catch {}
  };

  return [value, set] as const;
}

// ─── Toggle row ───────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  value,
  onToggle,
  icon: Icon,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border border-border/40 bg-card/30 px-4 py-4">
      <div className="flex gap-3">
        <Icon className="size-4 text-muted-foreground/60 shrink-0 mt-0.5" />
        <div>
          <p className="text-[12px] font-mono font-semibold text-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            {description}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus:outline-none ${
          value ? "border-primary bg-primary" : "border-border/60 bg-muted/40"
        }`}
        aria-checked={value}
        role="switch"
      >
        <span
          className={`inline-block size-3.5 rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// ─── Student Verification Section ────────────────────────────────────────────

function StudentVerificationSection() {
  const [email, setEmail] = useState("");
  const { data: status, isLoading } = useStudentVerifyStatus();
  const initiate = useInitiateStudentVerify();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await initiate.mutateAsync(email.trim().toLowerCase());
      toast.success("Verification email sent. Check your inbox.");
      setEmail("");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(msg ?? "Failed to send verification email.");
    }
  }

  const STATUS_CONFIG = {
    verified: { icon: CheckCircle, label: "Verified", color: "text-primary" },
    pending: { icon: Clock, label: "Email sent", color: "text-amber-400" },
    expired: { icon: XCircle, label: "Expired", color: "text-destructive" },
    rejected: { icon: XCircle, label: "Rejected", color: "text-destructive" },
    unverified: {
      icon: GraduationCap,
      label: "Not verified",
      color: "text-muted-foreground",
    },
  } as const;

  const cfg = STATUS_CONFIG[status?.status ?? "unverified"];
  const StatusIcon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="border border-radius-(--radius) border-border/40 bg-card/30 px-4 py-4 flex flex-col gap-4"
    >
      <div className="flex items-center gap-3">
        <GraduationCap className="size-4 text-muted-foreground/60 shrink-0" />
        <div className="flex-1">
          <p className="text-[12px] font-mono font-semibold text-foreground uppercase tracking-wide">
            Student Verification
          </p>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            Verify your university email for 10% off any plan.
          </p>
        </div>
        {isLoading ? (
          <Loader2 className="size-3 animate-spin text-muted-foreground" />
        ) : (
          <div className={cn("flex items-center gap-1", cfg.color)}>
            <StatusIcon className="size-3" />
            <span className="text-[10px] font-mono">{cfg.label}</span>
          </div>
        )}
      </div>

      {status?.status === "verified" && status.studentEmail && (
        <div className="text-[11px] font-mono text-muted-foreground px-0">
          Verified as{" "}
          <span className="text-foreground">{status.studentEmail}</span>
          {status.expiresAt && (
            <span className="text-muted-foreground/50">
              {" "}
              · Valid until {new Date(status.expiresAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {(status?.status === "unverified" ||
        status?.status === "expired" ||
        !status) && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu.gh"
            required
            className="flex-1 border border-border/50 bg-background px-3 py-2 text-xs font-mono outline-none placeholder:text-muted-foreground/40 focus:border-primary/50 transition-colors"
          />
          <button
            type="submit"
            disabled={initiate.isPending || !email.trim()}
            className={cn(
              "px-4 text-[10px] font-mono uppercase tracking-[0.15em] border transition-colors flex items-center gap-1.5",
              initiate.isPending
                ? "border-primary/30 text-primary/50 cursor-not-allowed"
                : "border-primary text-primary hover:bg-primary/10",
            )}
          >
            {initiate.isPending && (
              <Loader2 className="size-2.5 animate-spin" />
            )}
            Verify
          </button>
        </form>
      )}

      {status?.status === "pending" && (
        <p className="text-[11px] font-mono text-muted-foreground">
          A verification link was sent to{" "}
          <span className="text-foreground">{status.studentEmail}</span>. Check
          your inbox.
        </p>
      )}
    </motion.div>
  );
}

// ─── Weekly digest toggle ─────────────────────────────────────────────────────

function useWeeklyDigest() {
  const queryClient = useQueryClient();

  const { data: enabled = false } = useQuery({
    queryKey: ["notifications", "weeklyDigest"],
    queryFn: async () => {
      const res = await api.get<{ data: { weeklyDigest?: boolean } }>(
        "/users/notifications",
      );
      return res.data.data?.weeklyDigest ?? false;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { mutate: setDigest, isPending } = useMutation({
    mutationFn: async (value: boolean) => {
      await api.put("/users/notifications", { weeklyDigest: value });
    },
    onMutate: async (value) => {
      await queryClient.cancelQueries({
        queryKey: ["notifications", "weeklyDigest"],
      });
      const prev = queryClient.getQueryData(["notifications", "weeklyDigest"]);
      queryClient.setQueryData(["notifications", "weeklyDigest"], value);
      return { prev };
    },
    onError: (_err, _value, context) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(
          ["notifications", "weeklyDigest"],
          context.prev,
        );
      }
      toast.error("Failed to update notification settings");
    },
  });

  return { enabled, setDigest, isPending };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SessionSettingsPage() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab");
  const [thinkingMode, toggleThinking] = useLocalToggle(
    "qz_setting_thinking_mode",
    true,
  );
  const [autoTitle, toggleAutoTitle] = useLocalToggle(
    "qz_setting_auto_title",
    true,
  );
  const { enabled: weeklyDigest, setDigest } = useWeeklyDigest();
  const [defaultMode, setDefaultMode] = useLocalSelect(
    "qz_setting_default_mode",
    "ai",
  );

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
              Settings
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter">AI Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground font-mono">
            Customize how Z behaves in your sessions.
          </p>
          <p className="mt-2 text-xs text-muted-foreground font-mono">
            UI styling now lives in the floating button on the right side.
          </p>
          <div className="mt-4 h-px w-10 bg-primary/40" />
        </motion.div>

        {/* AI toggles */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-3"
        >
          <ToggleRow
            label="Thinking Mode"
            description="Show Z's reasoning process before each response."
            value={thinkingMode}
            onToggle={toggleThinking}
            icon={Brain}
          />
          <ToggleRow
            label="Auto-Title Sessions"
            description="Automatically name sessions from your first message."
            value={autoTitle}
            onToggle={toggleAutoTitle}
            icon={Tag}
          />

          {/* Default mode selector */}
          <div className="flex items-start justify-between gap-4 border border-border/40 bg-card/30 px-4 py-4">
            <div className="flex gap-3">
              <Users className="size-4 text-muted-foreground/60 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-mono font-semibold text-foreground uppercase tracking-wide">
                  Default Session Mode
                </p>
                <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                  Choose whether new sessions default to AI Tutor or Peer Study.
                </p>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              {(["ai", "peer"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDefaultMode(m)}
                  className={`px-3 py-1 text-[10px] font-mono uppercase tracking-widest border transition-colors ${
                    defaultMode === m
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {m === "ai" ? "AI Tutor" : "Peer"}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Notification preferences */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-4"
        >
          <ToggleRow
            label="Weekly Study Digest"
            description="Receive a Monday morning email summarising your sessions and progress from the past week."
            value={weeklyDigest}
            onToggle={() => setDigest(!weeklyDigest)}
            icon={Mail}
          />
        </motion.div>

        {/* Student verification */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <div
            id="verification"
            className={cn(
              activeTab === "verification" && "ring-1 ring-primary/30",
            )}
          >
            <StudentVerificationSection />
          </div>
        </motion.div>

        <p className="mt-8 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/30 text-center">
          AI settings are saved locally on this device
        </p>
      </div>
    </div>
  );
}
