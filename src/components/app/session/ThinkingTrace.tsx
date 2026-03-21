"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const scrollRef = useRef<HTMLPreElement>(null);

  // Auto-scroll to bottom while streaming
  useEffect(() => {
    if (isStreaming && isExpanded && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content, isStreaming, isExpanded]);

  return (
    <div className="border border-primary/20 bg-background overflow-hidden font-mono text-xs w-full">
      {/* Header matches HowZWorks terminal card */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-2.5 border-b border-primary/10 bg-background/80 text-left hover:bg-primary/5 transition-colors"
      >
        {/* Z badge */}
        <div className="w-5 h-5 border border-primary/40 bg-primary/20 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
          Z
        </div>

        <span className="flex-1 text-[10px] font-bold uppercase tracking-widest text-primary/80">
          {isStreaming ? "Z is thinking…" : "Thought process"}
        </span>

        {/* Animated dots when streaming */}
        {isStreaming && (
          <span className="flex gap-0.5 mr-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="inline-block size-1 bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
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
            <pre
              ref={scrollRef}
              className="px-4 py-3 whitespace-pre-wrap wrap-break-word font-mono text-[11px] text-muted-foreground leading-relaxed max-h-52 overflow-y-auto scrollbar-none bg-card/20"
            >
              {content || (isStreaming ? "…" : "—")}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

