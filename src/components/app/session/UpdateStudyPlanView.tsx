"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Maximize2,
  Minimize2,
  ArrowRight,
  Plus,
  Send,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DiamondIcon, CloverIcon, ChapterProgressRing } from "./StudyPlanView";
import { useApp } from "@/hooks/app/use-app-queries";
import {
  useAppMessage,
  useAppSteer,
  useAddChapter,
  useAddChapterGoal,
  useToggleBlockCompletion,
  useGenerateStudyPlan,
} from "@/hooks/app/use-app-actions";
import type { IChapter, IKnowledgeBlock } from "@/types/session";
import { toast } from "sonner";

interface UpdateStudyPlanViewProps {
  sessionId?: string;
  userName?: string;
  courseTitle?: string;
  onStartNow?: () => void;
  onSendMessage?: (msg: string) => void;
}

interface MessageItem {
  id: string;
  sender: "ai" | "user";
  tag?: string;
  content: string;
}

export function UpdateStudyPlanView({
  sessionId,
  userName = "Student",
  courseTitle,
  onStartNow,
  onSendMessage,
}: UpdateStudyPlanViewProps) {
  const { data: app } = useApp(sessionId || "");
  const sendMessageMutation = useAppMessage();
  const generatePlanMutation = useGenerateStudyPlan(sessionId || "");
  const addChapterMutation = useAddChapter(sessionId || "");
  const addGoalMutation = useAddChapterGoal(sessionId || "");
  const toggleBlockMutation = useToggleBlockCompletion(sessionId || "");

  const [inputVal, setInputVal] = useState("");
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterDesc, setNewChapterDesc] = useState("");
  const [expandedMap, setExpandedMap] = useState<Record<number, boolean>>({
    1: true,
  });

  const chapters: IChapter[] = useMemo(() => {
    if (app?.studyPlan?.chapters && app.studyPlan.chapters.length > 0) {
      return app.studyPlan.chapters;
    }
    return [];
  }, [app?.studyPlan]);

  const allExpanded = chapters.length > 0 && chapters.every((ch, idx) => expandedMap[ch.chapterNumber || idx + 1]);

  const toggleAll = () => {
    const nextState = !allExpanded;
    const newMap: Record<number, boolean> = {};
    chapters.forEach((ch, idx) => {
      newMap[ch.chapterNumber || idx + 1] = nextState;
    });
    setExpandedMap(newMap);
  };

  const toggleChapter = (num: number) => {
    setExpandedMap((prev) => ({
      ...prev,
      [num]: !prev[num],
    }));
  };

  // Chat messages: synthesize from live zMessages or initial welcome
  const [localMessages, setLocalMessages] = useState<MessageItem[]>([]);

  const handleSend = async () => {
    if (!inputVal.trim()) return;
    const text = inputVal.trim();
    setInputVal("");

    const newMsg: MessageItem = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: text,
    };
    setLocalMessages((prev) => [...prev, newMsg]);

    if (sessionId) {
      try {
        await Promise.allSettled([
          generatePlanMutation.mutateAsync({
            goal: app?.studyPlan?.goal,
            instruction: text,
          }),
          sendMessageMutation.mutateAsync({
            sessionId,
            message: `[STUDENT_ACTION: UPDATE_STUDY_PLAN] ${text}`,
            isSystemAction: true,
            type: "system_action",
          }),
        ]);
        toast.success("Study plan update requested from Z");
      } catch {
        toast.error("Failed to send instruction to Z");
      }
    }

    onSendMessage?.(text);
  };

  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim() || !sessionId) return;
    try {
      await addChapterMutation.mutateAsync({
        title: newChapterTitle.trim(),
        description: newChapterDesc.trim() || undefined,
      });
      toast.success("New chapter added to study plan");
      setNewChapterTitle("");
      setNewChapterDesc("");
      setIsAddingChapter(false);
    } catch {
      toast.error("Failed to add chapter");
    }
  };

  const handleToggleBlock = async (blockId: string) => {
    if (!sessionId || !blockId) return;
    try {
      await toggleBlockMutation.mutateAsync(blockId);
    } catch {
      toast.error("Failed to toggle block");
    }
  };

  return (
    <div className="w-full flex flex-col items-center px-4 py-4 antialiased pb-32">
      {/* Container matching screenshot width */}
      <div className="w-full max-w-[580px] space-y-4">
        {/* Top Header Card */}
        <div className="rounded-[28px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h1 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight">
                Update study plan
              </h1>
              <p className="text-xs text-slate-500 font-sans">
                Refine, reorder, or add custom goals with Z's assistance.
              </p>
            </div>

            <button
              type="button"
              onClick={onStartNow}
              className="rounded-full bg-black hover:bg-slate-850 text-white px-4 py-1.5 text-xs font-bold shadow-xs hover:scale-102 transition cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Start session</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Prompt Box */}
          <div className="relative rounded-2xl bg-slate-50 border border-slate-200 p-2 flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="e.g. Add a chapter on Graph Algorithms, or remove Chapter 3..."
              className="flex-1 bg-transparent px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sendMessageMutation.isPending || !inputVal.trim()}
              className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer shrink-0"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">
              {chapters.length} {chapters.length === 1 ? "Chapter" : "Chapters"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddingChapter((v) => !v)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-950 bg-white border border-slate-200 rounded-xl px-2.5 py-1 shadow-2xs cursor-pointer transition"
            >
              <Plus className="h-3 w-3" />
              <span>Add Chapter</span>
            </button>

            {chapters.length > 0 && (
              <button
                type="button"
                onClick={toggleAll}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl px-2.5 py-1 shadow-2xs cursor-pointer transition"
              >
                {allExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                <span>{allExpanded ? "Collapse All" : "Expand All"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Add Chapter Form */}
        <AnimatePresence>
          {isAddingChapter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs"
            >
              <h3 className="text-xs font-bold text-slate-900">Add New Chapter</h3>
              <input
                type="text"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                placeholder="Chapter Title (e.g. Chapter 3: Dynamic Programming)"
                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-slate-400"
              />
              <textarea
                value={newChapterDesc}
                onChange={(e) => setNewChapterDesc(e.target.value)}
                placeholder="Chapter Description (optional)"
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-slate-400 resize-none"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingChapter(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateChapter}
                  disabled={addChapterMutation.isPending || !newChapterTitle.trim()}
                  className="rounded-xl bg-slate-900 text-white px-3.5 py-1 text-xs font-bold hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
                >
                  {addChapterMutation.isPending ? "Adding..." : "Save Chapter"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chapter List */}
        <div className="space-y-3">
          {chapters.map((ch, idx) => {
            const chNum = ch.chapterNumber || idx + 1;
            const isExpanded = !!expandedMap[chNum];

            let chCompleted = 0;
            let chTotal = 0;
            for (const g of ch.goals || []) {
              for (const b of g.knowledgeBlocks || []) {
                chTotal++;
                if (b.isCompleted) chCompleted++;
              }
            }

            return (
              <motion.div
                key={ch.chapterId || chNum}
                layout
                className="rounded-[24px] border border-slate-200/90 bg-white overflow-hidden shadow-2xs"
              >
                {/* Chapter Header */}
                <div
                  onClick={() => toggleChapter(chNum)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <ChapterProgressRing
                      number={chNum}
                      completed={chCompleted}
                      total={chTotal}
                      size="sm"
                    />
                    <div>
                      <h3 className="text-xs sm:text-[13.5px] font-bold text-slate-900">
                        {ch.title}
                      </h3>
                      {ch.description && !isExpanded && (
                        <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                          {ch.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-600">
                      {chCompleted}/{chTotal}
                    </span>
                    <DiamondIcon completed={chCompleted > 0} className="h-3 w-2" />
                  </div>
                </div>

                {/* Chapter Expanded Details */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-3"
                    >
                      {ch.description && (
                        <p className="text-xs text-slate-600 leading-relaxed font-sans pt-2">
                          {ch.description}
                        </p>
                      )}

                      {/* Goals & Blocks */}
                      {(ch.goals || []).map((g, gIdx) => (
                        <div key={g.goalId || gIdx} className="rounded-xl bg-slate-50 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <CloverIcon className="h-3 w-3" />
                              <span>{g.title || `Goal ${gIdx + 1}`}</span>
                            </span>
                            <span className="text-[10.5px] font-mono font-bold text-slate-500">
                              {(g.knowledgeBlocks || []).filter((b) => b.isCompleted).length}/
                              {(g.knowledgeBlocks || []).length}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {(g.knowledgeBlocks || []).map((b) => (
                              <div
                                key={b.blockId}
                                onClick={() => handleToggleBlock(b.blockId)}
                                className="flex items-center gap-2 text-xs text-slate-700 hover:text-slate-950 transition cursor-pointer p-1 rounded-lg hover:bg-white"
                              >
                                <DiamondIcon completed={b.isCompleted} />
                                <span className="truncate">{b.concept}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
