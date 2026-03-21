"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const DOT_ANIMATION_DELAY = 0.2;

interface ThinkingTraceProps {
  content: string;
  isStreaming: boolean;
  defaultExpanded?: boolean;
}

export function ThinkingTrace({
  content,
  isStreaming,
  defaultExpanded,
}: ThinkingTraceProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded ?? false);

  return (
    <div className="border border-primary/20 bg-primary/5 text-sm w-full">
      {/* Header / collapsed toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-primary/10 transition-colors"
      >
        <Brain
          className={cn(
            "size-3.5 shrink-0 text-primary",
            isStreaming && "animate-pulse",
          )}
        />
        <span className="flex-1 text-[10px] font-mono uppercase tracking-widest text-primary/80">
          {isStreaming ? "Z is thinking…" : "Thought process"}
        </span>
        {isStreaming && (
          <span className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="inline-block size-1 bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * DOT_ANIMATION_DELAY,
                }}
              />
            ))}
          </span>
        )}
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-180",
          )}
        />
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="thinking-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-primary/20 px-3 py-2">
              <pre className="whitespace-pre-wrap break-words font-mono text-[11px] text-muted-foreground leading-relaxed max-h-64 overflow-y-auto">
                {content || (isStreaming ? "…" : "—")}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
