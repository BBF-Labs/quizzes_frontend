"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, BookCheck, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { StudioQuiz } from "@/types/session";

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuizTabProps {
  sessionId: string;
  quizzes: StudioQuiz[];
  onQuizzesChange: (quizzes: StudioQuiz[]) => void;
  /** Sends a chat message to the center panel so Z can handle quiz start */
  onSendMessage: (message: string) => void;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function QuizTab({
  sessionId,
  quizzes,
  onQuizzesChange,
  onSendMessage,
}: QuizTabProps) {
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  const handleSaveToBank = async (quiz: StudioQuiz) => {
    if (savingIds.has(quiz.id)) return;
    setSavingIds((prev) => new Set([...prev, quiz.id]));
    try {
      await api.post(`/app/${sessionId}/studio/quizzes/${quiz.id}/save`);
      onQuizzesChange(
        quizzes.map((q) => (q.id === quiz.id ? { ...q, savedToBank: true } : q)),
      );
    } catch (err) {
      console.error("[QuizTab] save to bank failed", err);
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(quiz.id);
        return next;
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/50">
        Quizzes
      </span>

      {quizzes.length === 0 ? (
        <p className="text-[10px] font-mono text-muted-foreground/40 text-center py-4">
          No quizzes generated yet
        </p>
      ) : (
        <motion.div
          className="flex flex-col gap-2"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
          initial="hidden"
          animate="visible"
        >
          {quizzes.map((quiz) => (
            <motion.div
              key={quiz.id}
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
              }}
              className="border border-border/40 bg-card/40 px-3 py-2 flex flex-col gap-1.5"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-mono font-bold truncate text-foreground">
                    {quiz.title}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground/60 truncate">
                    {quiz.topicTitle}
                  </p>
                </div>
                {quiz.savedToBank && (
                  <CheckCircle className="shrink-0 size-3.5 text-green-500 mt-0.5" />
                )}
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[9px] font-mono h-4 px-1.5"
                >
                  {quiz.questionCount} Qs
                </Badge>
                <span className="text-[9px] font-mono text-muted-foreground/40">
                  {new Date(quiz.generatedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Action buttons — hidden once saved */}
              {!quiz.savedToBank && (
                <div className="flex gap-1.5 mt-0.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-6 gap-1 text-[9px] font-mono"
                    disabled={savingIds.has(quiz.id)}
                    onClick={() => handleSaveToBank(quiz)}
                  >
                    <BookCheck className="size-2.5" />
                    {savingIds.has(quiz.id) ? "Saving…" : "Save to Bank"}
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 h-6 gap-1 text-[9px] font-mono"
                    onClick={() => onSendMessage(`start quiz for ${quiz.title}`)}
                  >
                    <Play className="size-2.5" />
                    Take Quiz
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
