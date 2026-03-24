"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Brain, Lightbulb, Sparkles } from "lucide-react";
import { useSessions, useSession } from "@/hooks";

// ─── Memory snippet derived from a single session ─────────────────────────────

function SessionMemorySnippets({ sessionId }: { sessionId: string }) {
  const { data: session } = useSession(sessionId);

  const memoryMessages = useMemo(
    () =>
      (session?.zMessages ?? [])
        .filter((m) => m.role === "z" && m.type === "text" && m.content.trim())
        .slice(0, 3),
    [session],
  );

  if (!memoryMessages.length) return null;

  return (
    <>
      {memoryMessages.map((m) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-border/40 bg-card/30 px-4 py-3 flex gap-3"
        >
          <Lightbulb className="size-3.5 text-primary/60 shrink-0 mt-0.5" />
          <p className="text-[12px] font-mono text-muted-foreground leading-relaxed line-clamp-3">
            {m.content}
          </p>
        </motion.div>
      ))}
    </>
  );
}

export default function MemoryPage() {
  const { data: sessions = [], isLoading } = useSessions();
  const recentSessionIds = sessions.slice(0, 5).map((s) => s.id);

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
              Memory
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter">Z Remembers</h1>
          <p className="mt-2 text-sm text-muted-foreground font-mono">
            Key insights Z has gathered from your past sessions.
          </p>
          <div className="mt-4 h-px w-10 bg-primary/40" />
        </motion.div>

        {/* Memory enabled badge */}
        <div className="mb-6 flex items-center gap-2 border border-primary/20 bg-primary/5 px-3 py-2 w-fit">
          <Sparkles className="size-3 text-primary" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
            Z Memory Enabled
          </span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse bg-card/40 border border-border/30"
              />
            ))}
          </div>
        )}

        {/* Snippets from recent sessions */}
        {!isLoading && recentSessionIds.length > 0 && (
          <div className="flex flex-col gap-2">
            {recentSessionIds.map((id) => (
              <SessionMemorySnippets key={id} sessionId={id} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && sessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-20 text-center"
          >
            <div className="flex size-16 items-center justify-center border border-primary/20 bg-primary/5">
              <Brain className="size-8 text-primary/50" />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50">
              No memory yet — start a session and Z will begin learning
            </p>
          </motion.div>
        )}

        <p className="mt-8 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/30 text-center">
          Memory is derived from your recent session activity
        </p>
      </div>
    </div>
  );
}
