"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
import {
  useSession,
  useSessionStream,
  useRenameSession,
  useSessionMessage,
} from "@/hooks";
import { useSocket } from "@/hooks";
import { StudioPanel } from "@/components/app/right";
import { SourcesPanel } from "@/components/app/left/SourcesPanel";
import { UserProfileDropdown } from "@/components/common";
import { useAuth } from "@/contexts/auth-context";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  ZSessionMessage,
  IZStudyPartnerSession,
  StudioNote,
  SharedNote,
  StudioFlashcard,
  StudioQuiz,
  StudioMindMap,
  StudioExport,
} from "@/types/session";

// ─── Panel dimensions ─────────────────────────────────────────────────────────

const LEFT_PANEL_WIDTH = 320;
const RIGHT_PANEL_WIDTH = 360;

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppLayoutContextValue {
  sessionId: string;
  leftOpen: boolean;
  rightOpen: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;
  messages: ZSessionMessage[];
  pushMessage: (message: ZSessionMessage) => void;
  sendMessage: (content: string) => Promise<void>;
  messageMutation: ReturnType<typeof useSessionMessage>;
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

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onMqlChange = ({ matches }: MediaQueryListEvent | MediaQueryList) => {
      setLeftOpen(matches);
      setRightOpen(matches);
    };
    mql.addEventListener("change", onMqlChange);
    onMqlChange(mql);
    return () => mql.removeEventListener("change", onMqlChange);
  }, []);

  const toggleLeft = useCallback(() => setLeftOpen((v) => !v), []);
  const toggleRight = useCallback(() => setRightOpen((v) => !v), []);

  // ── Session data ────────────────────────────────────────────────────────────
  const { user, logout } = useAuth();
  const { data: session } = useSession(sessionId);
  const stream = useSessionStream(
    sessionId,
    session?.zMessages || [],
    !!sessionId,
  );
  const { isConnected: isSocketConnected } = useSocket();

  const messageMutation = useSessionMessage();

  // ── Studio workspace state ──────────────────────────────────────────────────
  const [studioNotes, setStudioNotes] = useState<StudioNote[]>([]);
  const [studioSharedNotes, setStudioSharedNotes] = useState<SharedNote[]>([]);
  const [studioFlashcards, setStudioFlashcards] = useState<StudioFlashcard[]>(
    [],
  );
  const [studioQuizzes, setStudioQuizzes] = useState<StudioQuiz[]>([]);
  const [studioMindMap, setStudioMindMap] = useState<StudioMindMap | undefined>(
    undefined,
  );
  const [studioExports, setStudioExports] = useState<StudioExport[]>([]);

  const handleSessionChange = useCallback(
    (updated: Partial<IZStudyPartnerSession>) => {
      if (updated.notes !== undefined) setStudioNotes(updated.notes);
      if (updated.sharedNotes !== undefined)
        setStudioSharedNotes(updated.sharedNotes);
      if (updated.flashcards !== undefined)
        setStudioFlashcards(updated.flashcards);
      if (updated.quizzes !== undefined) setStudioQuizzes(updated.quizzes);
      if (updated.mindMap !== undefined) setStudioMindMap(updated.mindMap);
      if (updated.exports !== undefined) setStudioExports(updated.exports);
    },
    [],
  );

  // ── Sync artifacts from session data ────────────────────────────────────────
  useEffect(() => {
    if (session?.artifacts) {
      // Find the latest mindmap artifact
      const mmArtifact = [...session.artifacts]
        .reverse()
        .find((a) => a.type === "mindmap");
      if (mmArtifact) {
        setStudioMindMap(mmArtifact.content as StudioMindMap);
      }

      // Sync quizzes
      const quizzes = session.artifacts
        .filter((a) => a.type === "quiz")
        .map((a) => a.content as StudioQuiz);
      if (quizzes.length > 0) {
        setStudioQuizzes(quizzes);
      }

      // Sync flashcards (aggregated from all flashcard sets)
      const flashcards = session.artifacts
        .filter((a) => a.type === "flashcard_set")
        .flatMap((a: any) => (a.content as any).cards || []);
      if (flashcards.length > 0) {
        setStudioFlashcards(flashcards);
      }

      // Sync notes (aggregated from all notes artifacts)
      const notes = session.artifacts
        .filter((a) => a.type === "notes")
        .flatMap((a: any) => (a.content as any).sections || []);
      if (notes.length > 0) {
        setStudioNotes(notes);
      }

      // Sync exports from session.studio
      if (session.studio?.exportedFiles) {
        setStudioExports(session.studio.exportedFiles);
      }
    }
  }, [session?.artifacts, session?.studio?.exportedFiles]);

  // ── Inline session name editing ─────────────────────────────────────────────
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const renameSession = useRenameSession();

  const sessionName = session?.name || session?.title || "New Session";

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

  // ── Send a plain-text message ────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || messageMutation.isPending) return;
      const msgId = Date.now().toString();
      stream.pushMessage({
        id: msgId,
        messageId: msgId,
        role: "user",
        type: "text",
        content: content.trim(),
        timestamp: new Date().toISOString(),
      });
      try {
        await messageMutation.mutateAsync({
          sessionId,
          message: content.trim(),
          messageId: msgId,
        });
      } catch (err) {
        console.error("[AppLayout] sendMessage failed", err);
      }
    },
    [sessionId, messageMutation, stream],
  );

  // ── Context value ───────────────────────────────────────────────────────────
  const contextValue: AppLayoutContextValue = {
    sessionId,
    leftOpen,
    rightOpen,
    toggleLeft,
    toggleRight,
    messages: stream.messages,
    pushMessage: stream.pushMessage,
    sendMessage,
    messageMutation,
  };

  return (
    <AppLayoutContext.Provider value={contextValue}>
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        {/* ── Three-panel NotebookLM body ─────────────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0 overflow-hidden relative">
          {/* ── Left panel (Sources) ─────────────────────────────────────────────── */}
          <AnimatePresence initial={false}>
            {leftOpen && (
              <motion.div
                key="left-panel"
                initial={{ width: 0 }}
                animate={{ width: LEFT_PANEL_WIDTH }}
                exit={{ width: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
                className="shrink-0 border-r border-border/50 bg-card/10 flex flex-col"
              >
                <div
                  style={{ width: LEFT_PANEL_WIDTH }}
                  className="h-full flex flex-col"
                >
                  {/* Top Left Logo Area */}
                  <div className="h-14 shrink-0 flex items-center px-4">
                    <Link
                      href="/app/all"
                      className="flex items-center gap-1.5 shrink-0 hover:opacity-80 transition-opacity"
                    >
                      <span className="text-xl font-bold tracking-widest text-foreground">
                        Qz.
                      </span>
                    </Link>
                  </div>
                  <div className="flex-1 min-h-0">
                    <SourcesPanel
                      sessionId={sessionId}
                      activeCitationId={null}
                      onClose={toggleLeft}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Center panel (Chat) ──────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden relative">
            {/* Center Header Overlay */}
            <div className="absolute top-0 inset-x-0 h-14 flex items-center justify-between px-4 z-40 bg-linear-to-b from-background/90 to-transparent pointer-events-none">
              {/* Left controls: Open Sources if closed */}
              <div className="flex items-center gap-3 pointer-events-auto">
                {!leftOpen && (
                  <button
                    onClick={toggleLeft}
                    className="flex size-8 items-center justify-center rounded-md border border-border/40 bg-card/60 backdrop-blur-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors shadow-sm"
                    title="Open Sources"
                  >
                    <PanelLeftOpen className="size-4.5" />
                  </button>
                )}
                {!leftOpen && (
                  <div className="flex items-center gap-2 min-w-0 flex-1 ml-2">
                    <Link
                      href="/app/all"
                      className="flex items-center gap-1.5 shrink-0 hover:opacity-80 transition-opacity"
                    >
                      <span className="text-xl font-bold tracking-widest text-foreground">
                        Qz.
                      </span>
                    </Link>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 shrink-0">
                      / APP
                    </span>
                  </div>
                )}
              </div>

              {/* Session Title (Center) */}
              <div className="flex flex-1 justify-center items-center pointer-events-auto">
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
                    className="h-8 text-sm font-semibold max-w-75 border-primary/40 text-center bg-card/60 backdrop-blur-md shadow-sm"
                  />
                ) : (
                  <button
                    onClick={handleNameClick}
                    className="text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors truncate max-w-75 px-3 py-1.5 rounded-md hover:bg-muted/40"
                    title="Click to rename"
                  >
                    {sessionName}
                  </button>
                )}
              </div>

              {/* Right controls: Badges & Open Studio if closed */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <div className="hidden md:flex rounded-none border border-border/40 bg-card/60 backdrop-blur-md h-8 px-2.5 items-center gap-1.5 shadow-sm">
                  <div
                    className={cn(
                      "size-2 rounded-full",
                      isSocketConnected
                        ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                        : "bg-destructive animate-pulse",
                    )}
                  />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80">
                    Socket
                  </p>
                </div>

                <UserProfileDropdown user={user} onLogout={logout} />

                {!rightOpen && (
                  <button
                    onClick={toggleRight}
                    className="flex size-8 items-center justify-center rounded-md border border-border/40 bg-card/60 backdrop-blur-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors shadow-sm"
                    title="Open Studio"
                  >
                    <PanelRightOpen className="size-4.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Main Chat Page Content */}
            <div className="flex-1 pt-14 flex flex-col min-h-0 bg-background">
              {children}
            </div>
          </div>

          {/* ── Right panel (Studio) ─────────────────────────────────────────────── */}
          <AnimatePresence initial={false}>
            {rightOpen && (
              <motion.div
                key="right-panel"
                initial={{ width: 0 }}
                animate={{ width: RIGHT_PANEL_WIDTH }}
                exit={{ width: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                style={{ overflow: "hidden", zIndex: 10 }}
                className="shrink-0 border-l border-border/50 shadow-sm"
              >
                <div
                  style={{ width: RIGHT_PANEL_WIDTH }}
                  className="h-full flex flex-col bg-card/10"
                >
                  {session && (
                    <StudioPanel
                      sessionId={sessionId}
                      session={{
                        ...session,
                        notes: studioNotes,
                        sharedNotes: studioSharedNotes,
                        flashcards: studioFlashcards,
                        quizzes: studioQuizzes,
                        mindMap: studioMindMap,
                        exports: studioExports,
                      }}
                      onSendMessage={sendMessage}
                      onSessionChange={handleSessionChange}
                      onClose={toggleRight}
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
