"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Paperclip,
  X,
  Settings2,
  Plus,
  Sparkles,
  ArrowUp,
} from "lucide-react";
import { useAppLayout } from "./layout";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatPage() {
  const router = useRouter();
  const {
    sessionId,
    messages,
    pushMessage,
    isThinking,
    thinkingBuffer,
    stepMutation,
  } = useAppLayout();

  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      stepMutation.isPending
    ) {
      return;
    }

    const userMessage = input.trim();
    const userMessageId = Date.now().toString();

    pushMessage({
      id: userMessageId,
      messageId: userMessageId,
      role: "user",
      type: "text",
      content: userMessage,
      timestamp: new Date().toISOString(),
    });
    setInput("");

    try {
      await stepMutation.mutateAsync({
        sessionId,
        step: {
          stepType: "message",
          payload: {
            content: userMessage,
            clientMessageId: userMessageId,
          },
        },
      });
    } catch (err) {
      console.error("Failed to send message", err);
      pushMessage({
        id: `error-${Date.now()}`,
        messageId: `error-${Date.now()}`,
        role: "z",
        type: "text",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date().toISOString(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, stepMutation, sessionId, pushMessage]);

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
      !stepMutation.isPending
    ) {
      setTimeout(() => {
        setPendingAutoSend(null);
        handleSend();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAutoSend, handleSend, stepMutation.isPending]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 md:px-12 pt-12 pb-4 scrollbar-none scroll-smooth">
        <div className="w-full flex flex-col gap-10">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/30"
            >
              <div className="size-16 bg-primary/5 border border-primary/20 flex items-center justify-center mb-6">
                <Sparkles className="size-8 text-primary/60" />
              </div>
              <div>
                <h2 className="text-xl font-mono uppercase tracking-[0.3em] font-bold mb-3">
                  Study Partner
                </h2>
                <p className="text-muted-foreground max-w-sm">
                  I&apos;m here to help you study, explain concepts, and prepare
                  for your exams.
                </p>
              </div>
            </motion.div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: idx * 0.05,
                  ease: "easeOut",
                }}
                className={cn(
                  "flex gap-3 px-4",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[90%] px-6 py-4 text-sm prose prose-sm dark:prose-invert border transition-colors",
                    msg.role === "user"
                      ? "bg-primary/5 border-primary/40 text-foreground"
                      : "bg-muted/20 text-foreground border-border/40",
                  )}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </motion.div>
            ))
          )}

          {isThinking && !!thinkingBuffer && (
            <div className="flex justify-start">
              <div className="max-w-[90%] px-6 py-4 text-sm bg-muted/10 text-muted-foreground border border-border/20 italic prose prose-sm dark:prose-invert opacity-70">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {thinkingBuffer}
                </ReactMarkdown>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-6 md:px-12 pb-12 pt-4 bg-background border-t border-border/5 animate-in fade-in slide-in-from-bottom-2">
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
                <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[200px]">
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
                disabled={stepMutation.isPending || !sessionId}
                className="w-full resize-none bg-transparent py-1.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50 font-mono scrollbar-none"
                style={{ minHeight: "24px", maxHeight: "160px" }}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={stepMutation.isPending || !input.trim()}
              className={cn(
                "size-10 flex items-center justify-center shrink-0 transition-all self-end border",
                stepMutation.isPending || !input.trim()
                  ? "bg-muted/10 text-muted-foreground/30 border-border/20"
                  : "bg-primary/10 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground",
              )}
              title="Send message (or press Enter)"
            >
              {stepMutation.isPending ? (
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
