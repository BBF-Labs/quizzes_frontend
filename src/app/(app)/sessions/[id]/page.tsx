"use client";

import { useCallback, useEffect, useState } from "react";
import { use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { useSessionStream } from "@/hooks/useSessionStream";
import { MessageFeed } from "@/components/session/MessageFeed";
import { SessionInput } from "@/components/session/SessionInput";
import { ConnectionStatus } from "@/components/session/ConnectionStatus";
import type { StepInput, ZDirective, ZSession } from "@/types/session";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default function SessionDetailPage({ params }: SessionPageProps) {
  const { id: sessionId } = use(params);

  const [session, setSession] = useState<ZSession | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [activeDirective, setActiveDirective] = useState<{
    directive: ZDirective;
    messageId: string;
  } | null>(null);

  const handleSessionUpdate = useCallback((data: ZSession) => {
    setSession(data);
  }, []);

  const { messages, isThinking, thinkingBuffer, isConnected, connectionType } =
    useSessionStream(sessionId, handleSessionUpdate);

  // Track the latest directive message as the active directive
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.type === "directive" && lastMsg.directive) {
      setActiveDirective({
        directive: lastMsg.directive,
        messageId: lastMsg.messageId,
      });
    }
  }, [messages]);

  const hasActiveDirective = activeDirective !== null;

  // ── Helpers ──────────────────────────────────────────────────────────────

  const postStep = useCallback(
    (step: StepInput) => {
      void api.post(`/sessions/${sessionId}/step`, step).catch(() => {
        // step errors are surfaced via the SSE stream
      });
    },
    [sessionId],
  );

  const resolveDirective = useCallback((messageId: string) => {
    setActiveDirective((prev) =>
      prev?.messageId === messageId ? null : prev,
    );
  }, []);

  // ── Interaction callbacks ─────────────────────────────────────────────────

  const onSubmitAnswer = useCallback(
    (answers: string[]) => {
      if (!activeDirective) return;
      const taskId = session?.agentPlan?.currentTaskId;
      postStep({ stepType: "answer_submitted", payload: { taskId, answers } });
      resolveDirective(activeDirective.messageId);
    },
    [activeDirective, session, postStep, resolveDirective],
  );

  const onApprove = useCallback(() => {
    if (!activeDirective) return;
    postStep({ stepType: "approve_plan" });
    resolveDirective(activeDirective.messageId);
  }, [activeDirective, postStep, resolveDirective]);

  const onContinue = useCallback(() => {
    if (!activeDirective) return;
    postStep({ stepType: "message", payload: { content: "continue" } });
    resolveDirective(activeDirective.messageId);
  }, [activeDirective, postStep, resolveDirective]);

  const onRetry = useCallback(() => {
    if (!activeDirective) return;
    postStep({ stepType: "message", payload: { content: "retry" } });
    resolveDirective(activeDirective.messageId);
  }, [activeDirective, postStep, resolveDirective]);

  const onSkip = useCallback(() => {
    if (!activeDirective) return;
    const taskId = session?.agentPlan?.currentTaskId;
    postStep({ stepType: "task_skipped", payload: { taskId } });
    resolveDirective(activeDirective.messageId);
  }, [activeDirective, session, postStep, resolveDirective]);

  const onExplainDifferently = useCallback(
    (topicTitle: string) => {
      if (!activeDirective) return;
      postStep({
        stepType: "message",
        payload: { content: `explain ${topicTitle} differently` },
      });
      resolveDirective(activeDirective.messageId);
    },
    [activeDirective, postStep, resolveDirective],
  );

  const onTestMe = useCallback(
    (topicTitle: string) => {
      if (!activeDirective) return;
      postStep({
        stepType: "message",
        payload: { content: `test me on ${topicTitle}` },
      });
      resolveDirective(activeDirective.messageId);
    },
    [activeDirective, postStep, resolveDirective],
  );

  const onTryMyself = useCallback(
    (topicTitle: string) => {
      if (!activeDirective) return;
      postStep({
        stepType: "message",
        payload: { content: `give me a similar problem for ${topicTitle}` },
      });
      resolveDirective(activeDirective.messageId);
    },
    [activeDirective, postStep, resolveDirective],
  );

  const onAction = useCallback(
    (actionType: string) => {
      if (!activeDirective) return;
      postStep({
        stepType: "message",
        payload: { content: actionType },
      });
      resolveDirective(activeDirective.messageId);
    },
    [activeDirective, postStep, resolveDirective],
  );

  // ── Free-text message send ────────────────────────────────────────────────

  const handleSend = async (text: string) => {
    if (isSending || isThinking || hasActiveDirective) return;
    setIsSending(true);
    try {
      await api.post(`/sessions/${sessionId}/message`, { content: text });
    } catch {
      // message send errors are surfaced via the SSE stream or silently ignored
    } finally {
      setIsSending(false);
    }
  };

  const inputDisabled =
    isSending || isThinking || !isConnected || hasActiveDirective;

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

      {/* ── Message feed ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <MessageFeed
          messages={messages}
          isThinking={isThinking}
          thinkingBuffer={thinkingBuffer}
          activeDirectiveMessageId={activeDirective?.messageId ?? null}
          onSubmitAnswer={onSubmitAnswer}
          onApprove={onApprove}
          onContinue={onContinue}
          onRetry={onRetry}
          onSkip={onSkip}
          onExplainDifferently={onExplainDifferently}
          onTestMe={onTestMe}
          onTryMyself={onTryMyself}
          onAction={onAction}
        />
      </motion.div>

      {/* ── Text input ── */}
      <SessionInput
        onSend={handleSend}
        disabled={inputDisabled}
        placeholder={
          isThinking
            ? "Z is thinking…"
            : hasActiveDirective
              ? "Respond to the directive above…"
              : !isConnected
                ? "Reconnecting…"
                : "Ask Z something…"
        }
      />
    </div>
  );
}

