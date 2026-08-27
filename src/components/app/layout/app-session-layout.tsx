"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence } from "framer-motion";
import { Users, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useApp } from "@/hooks/app/use-app-queries";
import {
  useRenameApp,
  useAppMessage,
  useCreateStudioNote,
} from "@/hooks/app/use-app-actions";
import { useAppStream } from "@/hooks/app/use-app-stream";
import { useSocket } from "@/hooks";
import { DocumentReader } from "@/components/app/center/DocumentReader";
import type {
  ZAppMessage,
  IZStudyPartnerApp,
  StudioNote,
  SharedNote,
  StudioFlashcard,
  StudioQuiz,
  StudioMindMap,
  StudioExport,
  SessionCitation,
} from "@/types/session";

// ─── Context ──────────────────────────────────────────────────────────────────

export interface AppLayoutContextValue {
  sessionId: string;
  leftOpen: boolean;
  rightOpen: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;
  messages: ZAppMessage[];
  citations: SessionCitation[];
  pushMessage: (message: ZAppMessage) => void;
  sendMessage: (content: string, retryId?: string) => Promise<void>;
  addNote: (title: string, content: string) => void;
  messageMutation: ReturnType<typeof useAppMessage>;
  activeMaterialId: string | null;
  setActiveMaterialId: (id: string | null) => void;
  truncateAfter: (messageId: string) => void;
  truncateFrom: (messageId: string) => void;
}

const AppLayoutContext = createContext<AppLayoutContextValue | null>(null);

export function useAppLayout(): AppLayoutContextValue {
  const ctx = useContext(AppLayoutContext);
  if (!ctx) {
    throw new Error("useAppLayout must be used inside AppSessionLayout");
  }
  return ctx;
}

// ─── Layout Component ─────────────────────────────────────────────────────────

export interface AppSessionLayoutProps {
  children: ReactNode;
  sessionId: string;
}

export function AppSessionLayout({ children, sessionId }: AppSessionLayoutProps) {
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);
  const [localCitations, setLocalCitations] = useState<SessionCitation[]>([]);

  const queryClient = useQueryClient();
  const { data: app, isLoading, error } = useApp(sessionId);
  const renameMutation = useRenameApp();
  const createNoteMutation = useCreateStudioNote(sessionId);
  const messageAction = useAppMessage();
  const { socket } = useSocket();

  // Handle invitation join if 403 partner
  const [joining, setJoining] = useState(false);
  const handleJoin = async () => {
    try {
      setJoining(true);
      await api.post(`/app/${sessionId}/join`);
      queryClient.invalidateQueries({ queryKey: queryKeys.app.detail(sessionId) });
    } catch {
      toast.error("Failed to join session");
    } finally {
      setJoining(false);
    }
  };

  // Sync session name
  const [appName, setAppName] = useState("");
  useEffect(() => {
    if (app?.title) setAppName(app.title);
    else if (app?.name) setAppName(app.name);
  }, [app?.name, app?.title]);

  // Session state collections
  const [studioNotes, setStudioNotes] = useState<StudioNote[]>([]);
  const [studioSharedNotes, setStudioSharedNotes] = useState<SharedNote[]>([]);
  const [studioFlashcards, setStudioFlashcards] = useState<StudioFlashcard[]>([]);
  const [studioQuizzes, setStudioQuizzes] = useState<StudioQuiz[]>([]);
  const [studioMindMap, setStudioMindMap] = useState<StudioMindMap | null>(null);
  const [studioExports, setStudioExports] = useState<StudioExport[]>([]);

  useEffect(() => {
    if (!app) return;
    const partner = app as IZStudyPartnerApp;
    setStudioNotes(app.notes ?? []);
    setStudioSharedNotes(partner.sharedNotes ?? []);
    setStudioFlashcards(partner.flashcards ?? []);
    setStudioQuizzes(partner.quizzes ?? []);
    setStudioMindMap(partner.mindMap ?? null);
    setStudioExports(partner.exports ?? []);
    if (app.citations) {
      setLocalCitations(app.citations);
    }
  }, [app]);

  // Socket listener for dynamic live stream signals
  useEffect(() => {
    if (!socket || !sessionId) return;

    function handleSignal(payload: {
      type: string;
      data: any;
      sessionId?: string;
    }) {
      if (payload.sessionId && payload.sessionId !== sessionId) return;

      switch (payload.type) {
        case "citations:update":
          if (Array.isArray(payload.data)) {
            setLocalCitations(payload.data);
          }
          break;
        case "notes:update":
          if (Array.isArray(payload.data)) setStudioNotes(payload.data);
          break;
        case "flashcards:update":
          if (Array.isArray(payload.data)) setStudioFlashcards(payload.data);
          break;
        case "quizzes:update":
          if (Array.isArray(payload.data)) setStudioQuizzes(payload.data);
          break;
        case "mindmap:update":
          setStudioMindMap(payload.data ?? null);
          break;
        case "exports:update":
          if (Array.isArray(payload.data)) setStudioExports(payload.data);
          break;
        case "course_summary_updated":
          queryClient.invalidateQueries({
            queryKey: queryKeys.app.detail(sessionId),
          });
          break;
      }
    }

    const handleStudyPlanUpdated = () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(sessionId),
      });
    };

    const handleBlockCompleted = () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(sessionId),
      });
    };

    socket.on("app:signal", handleSignal);
    socket.on("app:study_plan_updated", handleStudyPlanUpdated);
    socket.on("app:block_completed", handleBlockCompleted);

    return () => {
      socket.off("app:signal", handleSignal);
      socket.off("app:study_plan_updated", handleStudyPlanUpdated);
      socket.off("app:block_completed", handleBlockCompleted);
    };
  }, [socket, sessionId, queryClient]);

  // Stream Hook
  const stream = useAppStream(sessionId);

  // Send message
  const sendMessage = useCallback(
    async (content: string, retryId?: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const userMsgId = retryId ?? nanoid();
      const userMsg: ZAppMessage = {
        id: userMsgId,
        messageId: userMsgId,
        role: "user",
        type: "text",
        content: trimmed,
        timestamp: new Date().toISOString(),
        status: "sending",
      };

      if (!retryId) {
        stream.pushMessage(userMsg);
      }

      try {
        await messageAction.mutateAsync({
          sessionId,
          message: trimmed,
        });
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Failed to send message. Please try again.";
        toast.error(errorMsg);
        stream.pushMessage({
          id: nanoid(),
          messageId: nanoid(),
          role: "z",
          type: "text",
          content: `⚠️ Error: ${errorMsg}`,
          timestamp: new Date().toISOString(),
          status: "error",
        });
      }
    },
    [messageAction, sessionId, stream],
  );

  const addNote = useCallback(
    (title: string, content: string) => {
      createNoteMutation.mutate({ title, content });
    },
    [createNoteMutation],
  );

  // Context value (no sidebars)
  const contextValue: AppLayoutContextValue = {
    sessionId,
    leftOpen: false,
    rightOpen: false,
    toggleLeft: () => {},
    toggleRight: () => {},
    messages: stream.messages,
    citations: localCitations,
    pushMessage: stream.pushMessage,
    sendMessage,
    addNote,
    messageMutation: messageAction,
    activeMaterialId,
    setActiveMaterialId,
    truncateAfter: stream.truncateAfter,
    truncateFrom: stream.truncateFrom,
  };

  return (
    <AppLayoutContext.Provider value={contextValue}>
      <div className="flex flex-col h-screen bg-[#FAF9F6] text-foreground overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
            <Loader2 className="size-8 animate-spin text-primary/40" />
            <p className="text-xs font-mono text-muted-foreground animate-pulse">
              Connecting to study partner session...
            </p>
          </div>
        ) : error &&
          (error as { response?: { status: number } }).response
            ?.status === 403 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
            <div className="size-20 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 shadow-sm border border-primary/10">
              <Users className="size-10 text-primary/60" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Study Partner Session
            </h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              This is a private study session. You&apos;ve been invited to
              join as a partner to collaborate on notes and chat with Z.
            </p>
            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer"
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
            <p className="text-sm text-destructive font-mono">
              Failed to load session.
            </p>
          </div>
        ) : (
          <>
            {children}
            <AnimatePresence>
              {activeMaterialId && (
                <DocumentReader
                  materialId={activeMaterialId}
                  sessionId={sessionId}
                  onClose={() => setActiveMaterialId(null)}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </AppLayoutContext.Provider>
  );
}
