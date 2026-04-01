"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Paperclip, X, Settings2, Plus, ArrowUp } from "lucide-react";
import { useAppApprove } from "@/hooks";
import { useRetryMessage } from "@/hooks/app/use-app-actions";
import { useAppLayout } from "./layout";
import { cn } from "@/lib/utils";
import { MessageFeed } from "@/components/app/center/MessageFeed";

export default function ChatPage() {
  const router = useRouter();
  const {
    sessionId,
    messages,
    citations,
    sendMessage,
    messageMutation,
    truncateAfter,
    truncateFrom,
    activeMaterialId,
  } = useAppLayout();

  const isInSplitView = !!activeMaterialId;

  const approveMutation = useAppApprove();
  const retryMutation = useRetryMessage(sessionId);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const firstMessageSentRef = useRef(false);

  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [courseNote, setCourseNote] = useState("");
  const [enableHints, setEnableHints] = useState(true);
  const [pendingAutoSend, setPendingAutoSend] = useState<string | null>(null);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  // Close plus menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        plusMenuRef.current &&
        !plusMenuRef.current.contains(e.target as Node)
      ) {
        setShowPlusMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Send message
  const handleSend = useCallback(async () => {
    if (
      !sessionId ||
      sessionId === "undefined" ||
      !input.trim() ||
      messageMutation.isPending
    ) {
      return;
    }

    const userMessage = input.trim();
    setInput("");
    await sendMessage(userMessage);
  }, [input, messageMutation, sessionId, sendMessage]);

  // Hydrate first message from landing page handoff
  useEffect(() => {
    if (firstMessageSentRef.current || !sessionId) return;

    const key = `qz_first_msg_${sessionId}`;
    const first = sessionStorage.getItem(key);
    if (!first) return;

    sessionStorage.removeItem(key);
    setInput(first);
    setPendingAutoSend(first);
    firstMessageSentRef.current = true;
  }, [sessionId]);

  // Trigger auto-send once input is hydrated
  useEffect(() => {
    if (
      pendingAutoSend &&
      input === pendingAutoSend &&
      !messageMutation.isPending
    ) {
      setTimeout(() => {
        setPendingAutoSend(null);
        handleSend();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAutoSend, handleSend, messageMutation.isPending]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Derive the most-recent unresolved directive messageId ────────────────
  const activeDirectiveMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].type === "directive" && messages[i].directive) {
        return messages[i].messageId;
      }
    }
    return null;
  }, [messages]);

  // ── Directive action helpers ─────────────────────────────────────────────

  const handleSubmitAnswer = useCallback(
    (answers: string[]) => {
      if (!sessionId) return;
      const joined = answers.join(", ");
      messageMutation
        .mutateAsync({
          sessionId,
          message:
            Object.keys(answers).length > 1 ? `Answers: ${joined}` : joined,
        })
        .catch((err: unknown) => console.error("[submitAnswer] failed", err));
    },
    [sessionId, messageMutation],
  );
  const handleApprove = useCallback(() => {
    if (!sessionId) return;
    approveMutation
      .mutateAsync(sessionId)
      .catch((err: unknown) => console.error("[approvePlan] failed", err));
  }, [sessionId, approveMutation]);
  const handleContinue = useCallback(
    () => sendMessage("Continue"),
    [sendMessage],
  );
  const handleRetry = useCallback(() => sendMessage("Retry"), [sendMessage]);
  const handleSkip = useCallback(() => sendMessage("Skip"), [sendMessage]);
  const handleExplainDifferently = useCallback(
    () => sendMessage("Explain this differently"),
    [sendMessage],
  );
  const handleTestMe = useCallback(
    (topicTitle: string) => sendMessage(`Test me on ${topicTitle}`),
    [sendMessage],
  );
  const handleTryMyself = useCallback(
    (topicTitle: string) => sendMessage(`I'll try ${topicTitle} myself`),
    [sendMessage],
  );
  const handleAction = useCallback(
    (actionType: string) => sendMessage(actionType),
    [sendMessage],
  );

  // Guard: invalid session
  if (!sessionId || sessionId === "undefined") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">Invalid Session</h2>
        <p className="text-muted-foreground mb-4">
          The session ID is invalid or missing.
        </p>
        <button
          onClick={() => router.push("/app")}
          className="px-4 py-2 bg-primary text-primary-foreground font-mono text-sm uppercase tracking-widest"
        >
          Back to App
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Message feed */}
      <MessageFeed
        messages={messages}
        citations={citations}
        activeDirectiveMessageId={activeDirectiveMessageId}
        onSubmitAnswer={handleSubmitAnswer}
        onApprove={handleApprove}
        onContinue={handleContinue}
        onRetry={handleRetry}
        onSkip={handleSkip}
        onExplainDifferently={handleExplainDifferently}
        onTestMe={handleTestMe}
        onTryMyself={handleTryMyself}
        onAction={handleAction}
        onRetryMessage={(messageId: string) => {
          truncateAfter(messageId);
          retryMutation.mutate(messageId);
        }}
        onEditMessage={(messageId: string, newContent: string) => {
          truncateFrom(messageId);
          sendMessage(newContent);
        }}
      />

      {/* Input */}
      <div className={cn(
        "sticky bottom-0 z-50 pt-4 bg-background border-t border-border/5 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]",
        isInSplitView
          ? "px-3 pb-4"
          : "-mx-6 md:-mx-12 px-6 md:px-12 pb-12",
      )}>
        <div className="w-full">
          <AnimatePresence>
            {attachedFile && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="mb-2 flex items-center gap-2 border border-border/50 bg-card/60 px-3 py-1.5 w-fit"
              >
                <Paperclip className="size-3 text-muted-foreground" />
                <span className="text-[11px] font-mono text-muted-foreground truncate max-w-50">
                  {attachedFile.name}
                </span>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="text-muted-foreground/60 hover:text-destructive transition-colors"
                >
                  <X className="size-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3 px-3 py-2 border border-border/50 bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 shrink-0 self-center">
              <div className="relative" ref={plusMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowPlusMenu((v) => !v)}
                  className="flex size-8 items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                  title="More options"
                >
                  <Plus className="size-4" />
                </button>

                <AnimatePresence>
                  {showPlusMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute bottom-full left-0 mb-3 z-50 w-64 border border-border bg-popover p-4"
                    >
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
                        Session Options
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-1.5">
                            Course Note
                          </label>
                          <input
                            type="text"
                            value={courseNote}
                            onChange={(e) => setCourseNote(e.target.value)}
                            placeholder="Optional context"
                            className="w-full bg-transparent border border-border/40 px-3 py-2 text-[11px] font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => setEnableHints((prev) => !prev)}
                          className={cn(
                            "w-full flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-mono uppercase tracking-widest border transition-all",
                            enableHints
                              ? "border-primary bg-primary/5 text-primary shadow-[0_0_10px_rgba(var(--primary),0.1)]"
                              : "border-border/40 text-muted-foreground hover:border-primary/40",
                          )}
                        >
                          <Settings2 className="size-3.5" />
                          Study Hints: {enableHints ? "ON" : "OFF"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => setAttachedFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex size-8 items-center justify-center transition-all",
                  attachedFile
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5",
                )}
                title="Attach file"
              >
                <Paperclip className="size-4" />
              </button>
            </div>

            <div className="flex-1 min-w-0 flex items-center">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything…"
                rows={1}
                disabled={messageMutation.isPending || !sessionId}
                className="w-full resize-none bg-transparent py-1.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50 font-mono scrollbar-none"
                style={{ minHeight: "24px", maxHeight: "160px" }}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={messageMutation.isPending || !input.trim()}
              className={cn(
                "size-10 flex items-center justify-center shrink-0 transition-all self-end border",
                messageMutation.isPending || !input.trim()
                  ? "bg-muted/10 text-muted-foreground/30 border-border/20"
                  : "bg-primary/10 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground",
              )}
              title="Send message (or press Enter)"
            >
              {messageMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowUp className="size-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
