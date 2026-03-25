"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  GalleryVerticalEnd,
  FileQuestion,
  Network,
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
  { id: "flashcards", label: "Cards", icon: GalleryVerticalEnd },
  { id: "quiz", label: "Quiz", icon: FileQuestion },
  { id: "mindmap", label: "Map", icon: Network },
  { id: "export", label: "Export", icon: Download },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface StudioPanelProps {
  sessionId: string;
  session: IZStudyPartnerSession;
  /** Called when the user sends a chat message from within the panel (e.g. "take quiz") */
  onSendMessage: (message: string) => void;
  onSessionChange: (updated: Partial<IZStudyPartnerSession>) => void;
  onClose?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StudioPanel({
  sessionId,
  session,
  onSendMessage,
  onSessionChange,
  onClose,
}: StudioPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("notes");

  const isPeerMode = session.mode === "structured";

  return (
    <div className="flex flex-col h-full bg-card/20">
      {/* ── Panel Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 shrink-0">
        <span className="text-sm font-semibold tracking-wide text-foreground">
          Studio
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            title="Close Panel"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2"></rect>
              <path d="M15 3v18"></path>
              <path d="m8 9 3 3-3 3"></path>
            </svg>
          </button>
        )}
      </div>

      {/* ── NotebookLM-style Tool Grid ─────────────────────────────────────────── */}
      <div className="shrink-0 p-4 border-b border-border/40 bg-background/50">
        <div className="grid grid-cols-2 gap-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            // Assign NotebookLM-esque colors based on the tool
            let colorClass = "text-muted-foreground";
            let iconBgClass = "bg-muted/20";
            if (tab.id === "notes") {
              colorClass = "text-yellow-500";
              iconBgClass = "bg-yellow-500/10";
            } else if (tab.id === "flashcards") {
              colorClass = "text-red-500";
              iconBgClass = "bg-red-500/10";
            } else if (tab.id === "quiz") {
              colorClass = "text-blue-500";
              iconBgClass = "bg-blue-500/10";
            } else if (tab.id === "mindmap") {
              colorClass = "text-purple-500";
              iconBgClass = "bg-purple-500/10";
            } else if (tab.id === "export") {
              colorClass = "text-emerald-500";
              iconBgClass = "bg-emerald-500/10";
            }

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center flex-col gap-3 rounded-(--radius) border p-4 transition-all duration-200 text-left group relative",
                  isActive
                    ? "bg-muted/70 border-primary/20 shadow-sm"
                    : "bg-muted/30 border-transparent hover:bg-muted/60 hover:border-border/50",
                )}
                title={tab.label}
              >
                <div className="flex w-full items-start justify-between">
                  <div
                    className={cn(
                      "p-2.5 rounded-(--radius) flex items-center justify-center shrink-0",
                      iconBgClass,
                    )}
                  >
                    <Icon className={cn("size-6", colorClass)} />
                  </div>
                  <div className="shrink-0 opacity-0 group-hover:opacity-60 transition-opacity">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                  </div>
                </div>
                <span
                  className={cn(
                    "w-full text-sm font-semibold tracking-wide truncate mt-1",
                    isActive
                      ? "text-foreground"
                      : "text-foreground/80 group-hover:text-foreground",
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3">
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
                onNotesChange={(notes: StudioNote[]) =>
                  onSessionChange({ notes })
                }
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
