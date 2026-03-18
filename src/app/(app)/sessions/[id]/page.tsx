"use client";

import { useCallback, useState } from "react";
import { use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { useSessionStream } from "@/hooks/useSessionStream";
import { SessionMessages } from "@/components/session/SessionMessages";
import { SessionInput } from "@/components/session/SessionInput";
import { ConnectionStatus } from "@/components/session/ConnectionStatus";
import type { ZSession } from "@/types/session";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default function SessionDetailPage({ params }: SessionPageProps) {
  const { id: sessionId } = use(params);

  const [session, setSession] = useState<ZSession | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSessionUpdate = useCallback((data: ZSession) => {
    setSession(data);
  }, []);

  const { messages, isThinking, thinkingBuffer, isConnected, connectionType } =
    useSessionStream(sessionId, handleSessionUpdate);

  const handleSend = async (text: string) => {
    if (isSending || isThinking) return;
    setIsSending(true);
    try {
      await api.post(`/sessions/${sessionId}/message`, { content: text });
    } catch {
      // message send errors are surfaced via the SSE stream or silently ignored
    } finally {
      setIsSending(false);
    }
  };

  const inputDisabled = isSending || isThinking || !isConnected;

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      {/* ── Top bar ── */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border/50 bg-card/40 px-4 py-3">
        <Link
          href="/sessions"
          className="flex size-7 items-center justify-center border border-border/50 hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors"
          aria-label="Back to sessions"
        >
          <ArrowLeft className="size-3.5" />
        </Link>

        <div className="flex size-7 items-center justify-center border border-primary/30 bg-primary/10">
          <BookOpen className="size-3.5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="truncate font-mono text-xs font-bold uppercase tracking-wide">
            {session?.title ?? `Session ${sessionId.slice(0, 8)}`}
          </p>
          {session?.subject && (
            <p className="truncate text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              {session.subject}
            </p>
          )}
        </div>

        <ConnectionStatus
          connectionType={connectionType}
          isConnected={isConnected}
        />

        {session?.status && (
          <span
            className={cn(
              "hidden sm:inline text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border",
              session.status === "active"
                ? "border-green-500/40 bg-green-500/10 text-green-500"
                : session.status === "completed"
                  ? "border-border/50 bg-muted/30 text-muted-foreground"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-500",
            )}
          >
            {session.status}
          </span>
        )}
      </header>

      {/* ── Messages ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <SessionMessages
          messages={messages}
          isThinking={isThinking}
          thinkingBuffer={thinkingBuffer}
        />
      </motion.div>

      {/* ── Input ── */}
      <SessionInput
        onSend={handleSend}
        disabled={inputDisabled}
        placeholder={
          isThinking
            ? "Z is thinking…"
            : !isConnected
              ? "Reconnecting…"
              : "Ask Z something…"
        }
      />
    </div>
  );
}
