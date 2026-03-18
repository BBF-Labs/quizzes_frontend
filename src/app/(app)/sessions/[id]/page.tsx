"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Paperclip,
  X,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { useSessionStep } from "@/hooks/use-session-actions";
import { useSessionStream } from "@/hooks/use-session-stream";
import { useSession } from "@/hooks/use-session";
import { MaterialManager } from "@/components/session/MaterialManager";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default function ChatPage({ params }: SessionPageProps) {
  const { id: sessionId } = use(params);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [courseNote, setCourseNote] = useState("");
  const [enableHints, setEnableHints] = useState(true);
  const firstMessageSentRef = useRef(false);

  // Hooks
  const { data: session } = useSession(sessionId);
  const stepMutation = useSessionStep();
  const stream = useSessionStream(sessionId);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sync messages from session (source of truth)
  // Session data includes all messages persisted on the backend
  useEffect(() => {
    if (!session?.zMessages) return;

    setMessages((prev) => {
      // Use messageId as the true identifier since it's server-assigned
      const existingIds = new Set(prev.map((m) => (m as any).messageId));
      const newMessages: ChatMessage[] = [];

      for (const msg of session.zMessages) {
        if (!existingIds.has(msg.messageId)) {
          newMessages.push({
            id: msg.id,
            role:
              msg.type === "thinking"
                ? "assistant"
                : msg.role === "user"
                  ? "user"
                  : "assistant",
            content: msg.content,
            timestamp: new Date(msg.timestamp),
          });
        }
      }

      return [...prev, ...newMessages];
    });
  }, [session?.zMessages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

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

  // Session polling already keeps messages in sync via useSession
  // Stream is used for optimistic updates and real-time signals, but session is source of truth

  // Send message
  const handleSend = useCallback(async () => {
    if (!sessionId || !input.trim() || stepMutation.isPending) return;

    const userMessage = input.trim();
    const userMessageObj: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };

    // Add user message to UI
    setMessages((prev) => [...prev, userMessageObj]);
    setInput("");

    try {
      await stepMutation.mutateAsync({
        sessionId,
        step: {
          stepType: "message",
          payload: { content: userMessage },
        },
      });
    } catch (err) {
      console.error("Failed to send message", err);

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    }
  }, [input, stepMutation, sessionId]);

  // Hydrate first message from landing page handoff (don't auto-send)
  useEffect(() => {
    if (firstMessageSentRef.current) return;
    const key = `qz_first_msg_${sessionId}`;
    const first = sessionStorage.getItem(key);
    if (!first || !sessionId) return;

    sessionStorage.removeItem(key);
    setInput(first);
    firstMessageSentRef.current = true;
  }, [sessionId]);

  // Handle Enter key — only for new lines (Shift+Enter adds newline, Enter sends)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 border-b border-border/50 bg-card/40 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link
            href="/sessions"
            className="flex size-8 items-center justify-center rounded border border-border/50 hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Back to sessions"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {session?.title || "New Chat"}
            </p>
          </div>
        </div>

        <Button variant="ghost" size="sm" asChild>
          <Link href="/sessions">
            <Plus className="size-4" />
          </Link>
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages Section */}
        <div className="flex flex-1 flex-col relative overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex h-full flex-col items-center justify-center gap-4"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">New Chat</h2>
                  <p className="text-sm text-muted-foreground">
                    Ask me anything and I&apos;ll help you learn
                  </p>
                </div>
              </motion.div>
            ) : (
              messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-lg rounded-lg px-4 py-2 text-sm",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  </div>
                </motion.div>
              ))
            )}

            {stepMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex gap-2">
                    <div className="size-2 bg-foreground/50 rounded-full animate-bounce" />
                    <div
                      className="size-2 bg-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="size-2 bg-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="sticky bottom-0 left-0 right-0 px-4 py-4 shrink-0">
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

              <div className="flex items-end gap-3 px-2 py-2 border border-border/50">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative" ref={plusMenuRef}>
                    <button
                      type="button"
                      onClick={() => setShowPlusMenu((v) => !v)}
                      className="flex size-7 items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                      title="More options"
                    >
                      <Plus className="size-3.5" />
                    </button>

                    <AnimatePresence>
                      {showPlusMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          className="absolute bottom-full left-0 mb-2 z-50 w-64 border border-border/60 bg-popover shadow-lg p-3"
                        >
                          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">
                            Session Options
                          </p>

                          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-1">
                            Course Note
                          </label>
                          <input
                            type="text"
                            value={courseNote}
                            onChange={(e) => setCourseNote(e.target.value)}
                            placeholder="Optional context"
                            className="w-full bg-transparent border border-border/40 px-2.5 py-1.5 text-[11px] font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors mb-3"
                          />

                          <button
                            type="button"
                            onClick={() => setEnableHints((prev) => !prev)}
                            className={cn(
                              "flex items-center gap-2 px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-widest border transition-colors",
                              enableHints
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border/40 text-muted-foreground hover:border-primary/40",
                            )}
                          >
                            <Settings2 className="size-3" />
                            Study Hints {enableHints ? "On" : "Off"}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      setAttachedFile(e.target.files?.[0] ?? null)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "flex size-7 items-center justify-center transition-colors",
                      attachedFile
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary",
                    )}
                    title="Attach file"
                  >
                    <Paperclip className="size-3.5" />
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything&hellip;"
                  rows={1}
                  disabled={stepMutation.isPending || !sessionId}
                  className="flex-1 w-full resize-none bg-transparent py-1.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50 font-mono"
                  style={{ minHeight: "36px", maxHeight: "140px" }}
                />

                <button
                  onClick={handleSend}
                  disabled={stepMutation.isPending || !input.trim()}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 text-[12px] font-mono uppercase tracking-widest shrink-0 transition-colors",
                    stepMutation.isPending || !input.trim()
                      ? "opacity-50 cursor-not-allowed text-muted-foreground"
                      : "text-primary hover:text-primary/80",
                  )}
                  title="Send message (or press Enter)"
                >
                  {stepMutation.isPending ? (
                    <>
                      <Loader2 className="size-3 animate-spin" />
                      Sending
                    </>
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Materials */}
        {session && (
          <aside className="hidden lg:block w-80 border-l border-border/50 bg-card/20 p-4 shrink-0 overflow-y-auto">
            <MaterialManager
              sessionId={sessionId}
              materials={session.materials || []}
              courseId={session.courseId || ""}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
