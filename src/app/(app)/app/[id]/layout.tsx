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
import { PanelLeftOpen, PanelRightOpen, X, Users, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { api } from "@/lib/api";
import {
  useApp,
} from "@/hooks/app/use-app-queries";
import {
  useRenameApp,
  useAppMessage,
  useCreateStudioNote,
} from "@/hooks/app/use-app-actions";
import { useAppStream } from "@/hooks/app/use-app-stream";
import { useSocket } from "@/hooks";
import { StudioPanel } from "@/components/app/right";
import { SourcesPanel } from "@/components/app/left/SourcesPanel";
import { DocumentReader } from "@/components/app/center/DocumentReader";
import { UserProfileDropdown } from "@/components/common";
import { useAuth } from "@/contexts/auth-context";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  ZAppMessage,
  IZStudyPartnerApp,
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
  messages: ZAppMessage[];
  pushMessage: (message: ZAppMessage) => void;
  sendMessage: (content: string) => Promise<void>;
  addNote: (title: string, content: string) => void;
  messageMutation: ReturnType<typeof useAppMessage>;
  activeMaterialId: string | null;
  setActiveMaterialId: (id: string | null) => void;
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

  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);

  // ── Queries and Mutations ────────────────────────────────────────────────────
  const { user, logout } = useAuth();
  const { data: app, isLoading, error } = useApp(sessionId, !!sessionId);
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await api.post(`/app/${sessionId}/join`);
      toast.success("Joined session!");
      window.location.reload(); 
    } catch {
      toast.error("Failed to join session.");
    } finally {
      setJoining(false);
    }
  };

  const renameAction = useRenameApp();
  const messageAction = useAppMessage();
  const createStudioNoteAction = useCreateStudioNote(sessionId);
 
  const stream = useAppStream(
    sessionId,
    app?.zMessages || [],
    !!sessionId,
  );
  const { isConnected: isSocketConnected } = useSocket();

  // ── Studio workspace state ──────────────────────────────────────────────────
  const [studioNotes, setStudioNotes] = useState<StudioNote[]>([]);
  const [studioSharedNotes, setStudioSharedNotes] = useState<SharedNote[]>([]);
  const [studioFlashcards, setStudioFlashcards] = useState<StudioFlashcard[]>([]);
  const [studioQuizzes, setStudioQuizzes] = useState<StudioQuiz[]>([]);
  const [studioMindMap, setStudioMindMap] = useState<StudioMindMap | undefined>(undefined);
  const [studioExports, setStudioExports] = useState<StudioExport[]>([]);

  const handleSessionChange = useCallback(
    (updated: Partial<IZStudyPartnerApp>) => {
      if (updated.notes !== undefined) setStudioNotes(updated.notes);
      if (updated.sharedNotes !== undefined) setStudioSharedNotes(updated.sharedNotes);
      if (updated.flashcards !== undefined) setStudioFlashcards(updated.flashcards);
      if (updated.quizzes !== undefined) setStudioQuizzes(updated.quizzes);
      if (updated.mindMap !== undefined) setStudioMindMap(updated.mindMap);
      if (updated.exports !== undefined) setStudioExports(updated.exports);
    },
    [],
  );

  // ── Sync artifacts from session data ────────────────────────────────────────
  useEffect(() => {
    if (app?.artifacts) {
      // Sync mindmap
      const mmArtifact = (app.artifacts ?? [])
        .find((a) => a.type === "mindmap");
      if (mmArtifact) {
        setStudioMindMap(mmArtifact.content as StudioMindMap);
      }
 
      // Sync quizzes
      const quizArtifacts = (app.artifacts ?? [])
        .filter((a) => a.type === "quiz")
        .map((a) => {
          const content = a.content as { topicTitle?: string; questions?: unknown[]; savedToPersonalQuizId?: string };
          return {
            id: a.artifactId,
            title: a.title,
            topicTitle: content.topicTitle || "Quiz",
            questionCount: content.questions?.length || 0,
            generatedAt: a.createdAt,
            savedToBank: !!content.savedToPersonalQuizId,
          };
        }) as StudioQuiz[];
      
      if (quizArtifacts.length > 0) {
        setStudioQuizzes(quizArtifacts);
      }
 
      // Sync flashcards
      const fcArtifacts = (app.artifacts ?? [])
        .filter((a) => a.type === "flashcard_set")
        .flatMap((a) => (a.content as { cards?: unknown[] }).cards || []) as StudioFlashcard[];
      
      if (fcArtifacts.length > 0) {
        setStudioFlashcards(fcArtifacts);
      }

      // Sync notes
      const notes = (app.artifacts ?? [])
        .filter((a) => a.type === "notes")
        .flatMap((a) => ((a.content as { sections?: { id?: string; title?: string; body?: string; content?: string }[] }).sections || []).map((s) => ({
          id: s.id || nanoid(),
          title: s.title || "Untitled",
          content: s.content || s.body || "",
          generatedByZ: true,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt
        }))) as StudioNote[];
      
      if (notes.length > 0) {
        setStudioNotes(notes);
      }

      // Sync shared notes and exports from app studio
      if (app.studio?.exportedFiles) {
        setStudioExports(app.studio.exportedFiles as unknown as StudioExport[]);
      }
      if (app.studio?.notes) {
        setStudioNotes(app.studio.notes as unknown as StudioNote[]);
      }
      if (app.sharedNotes) {
        setStudioSharedNotes(app.sharedNotes as unknown as SharedNote[]);
      }
    }
  }, [app?.artifacts, app?.studio?.exportedFiles, app?.studio?.notes, app?.sharedNotes]);

  // ── Inline session name editing ─────────────────────────────────────────────
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  
  const appName = app?.name || app?.title || "New App";

  function handleNameClick() {
    setNameInput(appName);
    setIsEditingName(true);
  }

  async function handleNameBlur() {
    setIsEditingName(false);
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === appName) return;
    try {
      await renameAction.mutateAsync({ sessionId, name: trimmed });
    } catch {
      // silent — optimistic rename
    }
  }

  // ── Send a plain-text message ────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string, retryId?: string) => {
      const trimmed = content.trim();
      if (!trimmed || messageAction.isPending) return;

      let msgId: string;
      if (retryId) {
        msgId = retryId;
        stream.updateMessage(msgId, { status: "sending" });
      } else {
        msgId = Date.now().toString();
        stream.pushMessage({
          id: msgId,
          messageId: msgId,
          role: "user",
          type: "text",
          content: trimmed,
          timestamp: new Date().toISOString(),
          status: "sending",
        });
      }

      try {
        await messageAction.mutateAsync({
          sessionId,
          message: trimmed,
          messageId: msgId,
        });
        stream.updateMessage(msgId, { status: "sent" });
      } catch (err) {
        console.error("[useAppLayout] sendMessage failed", err);
        stream.updateMessage(msgId, { status: "error" });
      }
    },
    [sessionId, messageAction, stream],
  );

  const addNote = useCallback(
    async (title: string, content: string) => {
      try {
        await createStudioNoteAction.mutateAsync({ title, content });
        toast.success("Note saved to snippet collection.");
      } catch (err) {
        console.error("[useAppLayout] addNote failed", err);
        toast.error("Failed to save note.");
      }
    },
    [createStudioNoteAction],
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
    addNote,
    messageMutation: messageAction,
    activeMaterialId,
    setActiveMaterialId,
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
                    {appName}
                  </button>
                )}
              </div>

              {/* Right controls: Badges & Open Studio if closed */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <div className="hidden md:flex rounded-(--radius) border border-border/40 bg-card/60 backdrop-blur-md h-8 px-2.5 items-center gap-1.5 shadow-sm">
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
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
                  <Loader2 className="size-8 animate-spin text-primary/40" />
                  <p className="text-xs font-mono text-muted-foreground animate-pulse">
                    Connecting to study partner session...
                  </p>
                </div>
              ) : error && (error as { response?: { status: number } }).response?.status === 403 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
                  <div className="size-20 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 shadow-sm border border-primary/10">
                    <Users className="size-10 text-primary/60" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Study Partner Session</h2>
                  <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                    This is a private study session. You&apos;ve been invited to join as a partner to collaborate on notes and chat with Z.
                  </p>
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                  >
                    {joining ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="size-5" />
                        Join Collaborative Session
                      </>
                    )}
                  </button>
                </div>
              ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-sm text-destructive font-mono">Failed to load session.</p>
                </div>
              ) : activeMaterialId ? (
                <div className="flex-1 flex min-h-0">
                  <div className="flex-1 border-r border-border/40 relative">
                    <button
                      onClick={() => setActiveMaterialId(null)}
                      className="absolute top-4 right-4 z-50 size-8 flex items-center justify-center rounded-full bg-background/80 hover:bg-background border border-border shadow-sm text-muted-foreground hover:text-foreground transition-all"
                      title="Close Reader"
                    >
                      <X className="size-4" />
                    </button>
                    <DocumentReader 
                      materialId={activeMaterialId} 
                      sessionId={sessionId} 
                    />
                  </div>
                  <div className="w-112.5 flex flex-col min-w-[320px]">
                    {children}
                  </div>
                </div>
              ) : (
                children
              )}
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
                  {app && (
                    <StudioPanel
                      sessionId={sessionId}
                      app={{
                        ...app,
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
