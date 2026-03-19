"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, Brain, Users, Tag } from "lucide-react";

// ─── localStorage-backed toggle ───────────────────────────────────────────────

function useLocalToggle(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) setValue(JSON.parse(stored) as boolean);
    } catch {}
  }, [key]);

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
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setValue(stored);
    } catch {}
  }, [key]);

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

export default function SessionSettingsPage() {
  const [thinkingMode, toggleThinking] = useLocalToggle(
    "qz_setting_thinking_mode",
    true,
  );
  const [autoTitle, toggleAutoTitle] = useLocalToggle(
    "qz_setting_auto_title",
    true,
  );
  const [defaultMode, setDefaultMode] = useLocalSelect(
    "qz_setting_default_mode",
    "ai",
  );

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
              Settings
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter">AI Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground font-mono">
            Customize how Z behaves in your sessions.
          </p>
          <div className="mt-4 h-px w-10 bg-primary/40" />
        </motion.div>

        {/* Toggles */}
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

        <p className="mt-8 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/30 text-center">
          Settings are saved locally on this device
        </p>
      </div>
    </div>
  );
}
