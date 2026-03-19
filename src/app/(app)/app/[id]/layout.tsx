"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  PanelLeft,
  PanelRight,
  Settings,
} from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useSessionStream } from "@/hooks/use-session-stream";
import { useSocket } from "@/hooks/use-socket";
import { useRenameSession } from "@/hooks/use-rename-session";
import { useSessionStep } from "@/hooks/use-session-actions";
import { MaterialManager } from "@/components/session/MaterialManager";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ZSessionMessage } from "@/types/session";

// ─── Panel dimensions ─────────────────────────────────────────────────────────

const LEFT_PANEL_WIDTH = 260;
const RIGHT_PANEL_WIDTH = 320;

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppLayoutContextValue {
  sessionId: string;
  leftOpen: boolean;
  rightOpen: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;
  messages: ZSessionMessage[];
  pushMessage: (msg: ZSessionMessage) => void;
  isThinking: boolean;
  thinkingBuffer: string;
  stepMutation: ReturnType<typeof useSessionStep>;
}

const AppLayoutContext = createContext<AppLayoutContextValue | null>(null);

export function useAppLayout(): AppLayoutContextValue {
  const ctx = useContext(AppLayoutContext);
  if (!ctx) {
    throw new Error("useAppLayout must be used inside AppLayout ([id]/layout)");
  }
  return ctx;
}

// ─── Layout ───────────────────────────────────────────────────────────────────

interface AppLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default function AppLayout({ children, params }: AppLayoutProps) {
  const { id: sessionId } = use(params);

  // ── Panel state — collapsed on mobile, expanded on lg ──────────────────────
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const isLg = window.matchMedia("(min-width: 1024px)").matches;
    setLeftOpen(isLg);
    setRightOpen(isLg);
  }, []);

  const toggleLeft = useCallback(() => setLeftOpen((v) => !v), []);
  const toggleRight = useCallback(() => setRightOpen((v) => !v), []);

  // ── Session data ────────────────────────────────────────────────────────────
  const { data: session } = useSession(sessionId);
  const stream = useSessionStream(sessionId, undefined, !!sessionId);
  const { isConnected: isSocketConnected } = useSocket();
  const stepMutation = useSessionStep();

  // ── Inline session name editing ─────────────────────────────────────────────
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const renameSession = useRenameSession();

  const sessionName =
    session?.name || session?.title || "New Study Session";

  function handleNameClick() {
    setNameInput(sessionName);
    setIsEditingName(true);
  }

  async function handleNameBlur() {
    setIsEditingName(false);
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === sessionName) return;
    try {
      await renameSession.mutateAsync({ sessionId, name: trimmed });
    } catch {
      // silent — optimistic rename
    }
  }

  // ── Context value ───────────────────────────────────────────────────────────
  const contextValue: AppLayoutContextValue = {
    sessionId,
    leftOpen,
    rightOpen,
    toggleLeft,
    toggleRight,
    messages: stream.messages,
    pushMessage: stream.pushMessage,
    isThinking: stream.isThinking,
    thinkingBuffer: stream.thinkingBuffer,
    stepMutation,
  };

  return (
    <AppLayoutContext.Provider value={contextValue}>
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="h-14 shrink-0 border-b border-border/50 flex items-center gap-3 px-4 bg-background/80 backdrop-blur-sm z-40">
          {/* Left: wordmark + breadcrumb + session name */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link
              href="/app"
              className="flex items-center gap-1.5 shrink-0 hover:opacity-80 transition-opacity"
            >
              <span className="text-lg font-bold tracking-widest">Qz.</span>
            </Link>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 shrink-0">
              / APP
            </span>
            <span className="text-muted-foreground/40 text-sm shrink-0">/</span>

            {/* Session name — editable inline */}
            {isEditingName ? (
              <Input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                  if (e.key === "Escape") setIsEditingName(false);
                }}
                className="h-6 text-[11px] font-mono px-2 max-w-[200px] border-primary/40 rounded-none"
              />
            ) : (
              <button
                onClick={handleNameClick}
                className="text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors truncate max-w-[200px]"
                title="Click to rename"
              >
                {sessionName}
              </button>
            )}
          </div>

          {/* Right: panel toggles + status badges + settings */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Panel toggles */}
            <button
              onClick={toggleLeft}
              className={cn(
                "flex size-7 items-center justify-center border transition-colors",
                leftOpen
                  ? "border-primary/40 text-primary bg-primary/5"
                  : "border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
              title="Toggle left panel"
            >
              <PanelLeft className="size-3.5" />
            </button>

            <button
              onClick={toggleRight}
              className={cn(
                "flex size-7 items-center justify-center border transition-colors",
                rightOpen
                  ? "border-primary/40 text-primary bg-primary/5"
                  : "border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
              title="Toggle right panel"
            >
              <PanelRight className="size-3.5" />
            </button>

            {/* Socket status */}
            <div className="rounded-none border border-border/50 bg-card/40 h-6 px-2 flex items-center gap-1.5">
              <div
                className={cn(
                  "size-1.5 rounded-none",
                  isSocketConnected
                    ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                    : "bg-destructive animate-pulse",
                )}
              />
              <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                Socket {isSocketConnected ? "Live" : "Off"}
              </p>
            </div>

            {/* SSE status */}
            <div className="rounded-none border border-border/50 bg-card/40 h-6 px-2 flex items-center gap-1.5">
              <Activity
                className={cn(
                  "size-3 text-muted-foreground",
                  stream.isConnected && "text-primary animate-pulse",
                )}
              />
              <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                SSE {stream.isConnected ? "Live" : "Off"}
              </p>
            </div>

            {/* Settings */}
            <Link
              href="/app/settings"
              className="flex size-7 items-center justify-center border border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
              title="Settings"
            >
              <Settings className="size-3.5" />
            </Link>
          </div>
        </header>

        {/* ── Three-panel body ─────────────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left panel */}
          <AnimatePresence initial={false}>
            {leftOpen && (
              <motion.div
                key="left-panel"
                initial={{ width: 0 }}
                animate={{ width: LEFT_PANEL_WIDTH }}
                exit={{ width: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
                className="shrink-0 border-r border-border/50 bg-card/20"
              >
                <div
                  style={{ width: LEFT_PANEL_WIDTH }}
                  className="h-full overflow-y-auto p-4"
                >
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50 mb-3">
                    Navigate
                  </p>
                  <nav className="flex flex-col gap-1">
                    <Link
                      href="/app"
                      className="flex items-center gap-2 px-3 py-2 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                    >
                      ← New Chat
                    </Link>
                    <Link
                      href="/app/all"
                      className="flex items-center gap-2 px-3 py-2 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                    >
                      All Chats
                    </Link>
                    <Link
                      href="/app/memory"
                      className="flex items-center gap-2 px-3 py-2 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                    >
                      Memory
                    </Link>
                  </nav>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Center — always visible, renders children (the page) */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            {children}
          </div>

          {/* Right panel — Studio */}
          <AnimatePresence initial={false}>
            {rightOpen && (
              <motion.div
                key="right-panel"
                initial={{ width: 0 }}
                animate={{ width: RIGHT_PANEL_WIDTH }}
                exit={{ width: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
                className="shrink-0 border-l border-border/50 bg-card/20"
              >
                <div
                  style={{ width: RIGHT_PANEL_WIDTH }}
                  className="h-full overflow-y-auto p-4"
                >
                  {session && (
                    <MaterialManager
                      sessionId={sessionId}
                      materials={session.materials || []}
                      courseId={session.courseId || ""}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayoutContext.Provider>
  );
}
