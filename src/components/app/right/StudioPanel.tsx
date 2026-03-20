"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CreditCard,
  ListChecks,
  Share2,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotesTab } from "./tabs/NotesTab";
import { FlashcardsTab } from "./tabs/FlashcardsTab";
import { QuizTab } from "./tabs/QuizTab";
import { MindMapTab } from "./tabs/MindMapTab";
import { ExportTab } from "./tabs/ExportTab";
import type {
  IZStudyPartnerSession,
  StudioNote,
  SharedNote,
  StudioFlashcard,
  StudioQuiz,
  StudioExport,
} from "@/types/session";

// ─── Tab definitions ──────────────────────────────────────────────────────────

type TabId = "notes" | "flashcards" | "quiz" | "mindmap" | "export";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "notes", label: "Notes", icon: FileText },
  { id: "flashcards", label: "Cards", icon: CreditCard },
  { id: "quiz", label: "Quiz", icon: ListChecks },
  { id: "mindmap", label: "Map", icon: Share2 },
  { id: "export", label: "Export", icon: Download },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface StudioPanelProps {
  sessionId: string;
  session: IZStudyPartnerSession;
  /** Called when the user sends a chat message from within the panel (e.g. "take quiz") */
  onSendMessage: (message: string) => void;
  onSessionChange: (updated: Partial<IZStudyPartnerSession>) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StudioPanel({
  sessionId,
  session,
  onSendMessage,
  onSessionChange,
}: StudioPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("notes");

  const isPeerMode = session.mode === "peer";

  return (
    <div className="flex flex-col h-full">
      {/* ── Tab bar ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-border/40 flex">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2 px-1 text-[9px] font-mono uppercase tracking-widest transition-colors",
                isActive
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground/50 hover:text-muted-foreground border-b-2 border-transparent",
              )}
              title={tab.label}
            >
              <Icon className="size-3.5" />
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "notes" && (
              <NotesTab
                sessionId={sessionId}
                notes={session.notes ?? []}
                isPeerMode={isPeerMode}
                sharedNotes={session.sharedNotes ?? []}
                onNotesChange={(notes: StudioNote[]) => onSessionChange({ notes })}
                onSharedNotesChange={(sharedNotes: SharedNote[]) =>
                  onSessionChange({ sharedNotes })
                }
              />
            )}
            {activeTab === "flashcards" && (
              <FlashcardsTab
                sessionId={sessionId}
                flashcards={session.flashcards ?? []}
                onFlashcardsChange={(flashcards: StudioFlashcard[]) =>
                  onSessionChange({ flashcards })
                }
              />
            )}
            {activeTab === "quiz" && (
              <QuizTab
                sessionId={sessionId}
                quizzes={session.quizzes ?? []}
                onQuizzesChange={(quizzes: StudioQuiz[]) =>
                  onSessionChange({ quizzes })
                }
                onSendMessage={onSendMessage}
              />
            )}
            {activeTab === "mindmap" && (
              <MindMapTab mindMap={session.mindMap} />
            )}
            {activeTab === "export" && (
              <ExportTab
                sessionId={sessionId}
                exports={session.exports ?? []}
                onExportsChange={(exports: StudioExport[]) =>
                  onSessionChange({ exports })
                }
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
