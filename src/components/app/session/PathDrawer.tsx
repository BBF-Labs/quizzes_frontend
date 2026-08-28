"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Map, Compass, BookOpen } from "lucide-react";
import { KnowledgePathway, type KnowledgeBlockItem } from "./KnowledgePathway";
import { cn } from "@/lib/utils";

interface PathDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: KnowledgeBlockItem[];
  onSelectBlock?: (item: KnowledgeBlockItem) => void;
  chapterTitle?: string;
}

export function PathDrawer({
  isOpen,
  onClose,
  items,
  onSelectBlock,
  chapterTitle = "Study Plan Pathway",
}: PathDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-xs"
          />

          {/* Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm sm:max-w-md bg-white border-l border-slate-200 shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0C60FC]">
                    <Map className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                      Roadmap
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-950 truncate max-w-56">
                      {chapterTitle}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
                  title="Close Pathway"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Connected Knowledge Pathway */}
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Follow your structured roadmap. Select any milestone to preview or focus your session.
              </p>

              <KnowledgePathway
                items={items}
                onSelectBlock={(block) => {
                  onSelectBlock?.(block);
                  onClose();
                }}
                className="bg-slate-50/60 border-slate-100 shadow-none p-4"
              />
            </div>

            {/* Footer Summary */}
            <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
              <p>Completed milestones update automatically in real time.</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
