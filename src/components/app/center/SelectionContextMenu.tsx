"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, StickyNote, Copy, Check, Highlighter, X } from "lucide-react";
import { useAppLayout } from "@/components/app/layout";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SelectionContextMenuProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onHighlight?: (
    text: string,
    rect: DOMRect,
    color: string,
    note?: string,
    range?: Range,
  ) => void;
}

const HIGHLIGHT_COLORS = [
  { id: "yellow", bg: "bg-yellow-400", ring: "ring-yellow-400", label: "Yellow" },
  { id: "pink", bg: "bg-pink-400", ring: "ring-pink-400", label: "Pink" },
  { id: "green", bg: "bg-green-400", ring: "ring-green-400", label: "Green" },
  { id: "blue", bg: "bg-blue-400", ring: "ring-blue-400", label: "Blue" },
];

export function SelectionContextMenu({
  containerRef,
  onHighlight,
}: SelectionContextMenuProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [selectedRect, setSelectedRect] = useState<DOMRect | null>(null);
  const currentRangeRef = useRef<Range | null>(null);
  const { sendMessage, addNote } = useAppLayout();
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showHighlightColors, setShowHighlightColors] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isInteractingWithMenuRef = useRef(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const evaluateSelection = () => {
      if (isInteractingWithMenuRef.current) return;

      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
          if (!showNoteInput && !showHighlightColors) {
            setPosition(null);
          }
          return;
        }

        const text = selection.toString().trim();
        if (!text) {
          if (!showNoteInput && !showHighlightColors) {
            setPosition(null);
          }
          return;
        }

        try {
          const container = containerRef.current;
          if (!container) return;

          const range = selection.getRangeAt(0);
          const containerNode = container as Node;

          // Check if selection is within the reader container
          const isInside =
            containerNode.contains(range.commonAncestorContainer) ||
            containerNode.contains(range.startContainer) ||
            containerNode.contains(range.endContainer);

          if (!isInside) return;

          const rect = range.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          if (rect.width > 0 || rect.height > 0) {
            const isMobile = window.innerWidth < 768;
            const menuWidth = isMobile ? 250 : 280;
            const halfWidth = menuWidth / 2;

            // Compute relative center X of the selection within the scroll container
            const rawX =
              rect.left - containerRect.left + container.scrollLeft + rect.width / 2;

            // Clamp X so the menu remains fully inside the scroll container on narrow mobile viewports
            const minX = container.scrollLeft + halfWidth + 8;
            const maxX = container.scrollLeft + containerRect.width - halfWidth - 8;
            const clampedX = Math.max(minX, Math.min(maxX, rawX));

            // On mobile or if near top edge of container (< 75px), position below selection
            let clampedY: number;
            if (rect.top - containerRect.top < 75) {
              clampedY = rect.bottom - containerRect.top + container.scrollTop + 34;
            } else {
              clampedY = rect.top - containerRect.top + container.scrollTop - 10;
            }

            setPosition({ x: clampedX, y: clampedY });
            setSelectedText(text);
            setSelectedRect(rect);
            currentRangeRef.current = range.cloneRange();
          }
        } catch {
          // Handlers safely catch transient DOM selection changes
        }
      }, 50);
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) {
        isInteractingWithMenuRef.current = true;
        return;
      }
      isInteractingWithMenuRef.current = false;
      if (!showNoteInput && !showHighlightColors) {
        setPosition(null);
      }
    };

    document.addEventListener("mouseup", evaluateSelection);
    document.addEventListener("touchend", evaluateSelection);
    document.addEventListener("selectionchange", evaluateSelection);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, { passive: true });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener("mouseup", evaluateSelection);
      document.removeEventListener("touchend", evaluateSelection);
      document.removeEventListener("selectionchange", evaluateSelection);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [containerRef, showNoteInput, showHighlightColors]);

  const dismiss = () => {
    setPosition(null);
    setShowNoteInput(false);
    setShowHighlightColors(false);
    setNote("");
    currentRangeRef.current = null;
  };

  const handleAskZ = async () => {
    if (!selectedText) return;
    const prompt = `Can you explain this from my material: "${selectedText}"`;
    dismiss();
    try {
      await sendMessage(prompt);
    } catch {
      toast.error("Failed to send to Z.");
    }
  };

  const handleCopy = async () => {
    if (!selectedText) return;
    await navigator.clipboard.writeText(selectedText);
    setCopied(true);
    toast.success("Copied to clipboard.");
    setTimeout(() => {
      setCopied(false);
      dismiss();
    }, 900);
  };

  const handleSaveNote = () => {
    if (!selectedText) return;
    addNote("Snippet", selectedText);
    toast.success("Saved to notes.");
    dismiss();
  };

  const handleHighlight = (colorId: string) => {
    if (!selectedText || !selectedRect || !onHighlight) return;
    onHighlight(
      selectedText,
      selectedRect,
      colorId,
      note.trim() || undefined,
      currentRangeRef.current ?? undefined,
    );
    toast.success("Highlight saved.");
    dismiss();
  };

  if (!position) return null;

  return (
    <AnimatePresence>
      {position && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.92, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 6 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onTouchStart={(e) => {
            e.stopPropagation();
            isInteractingWithMenuRef.current = true;
          }}
          onTouchEnd={(e) => e.stopPropagation()}
          className="absolute z-100 select-none touch-auto"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: "translateX(-50%) translateY(-100%)",
          }}
        >
          <div
            className={cn(
              "bg-white border border-slate-200/90 shadow-xl shadow-slate-200/60 overflow-hidden flex flex-col",
              showNoteInput ? "rounded-[20px] w-64" : "rounded-full",
            )}
          >
            {/* Main action row */}
            <div className="flex items-center gap-0.5 px-1.5 py-1.5">
              {/* Ask Z — primary action */}
              <button
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  isInteractingWithMenuRef.current = true;
                }}
                onClick={handleAskZ}
                className="flex items-center gap-1.5 rounded-full bg-[#0C60FC] px-3.5 py-1.5 text-[11px] font-extrabold text-white hover:bg-[#0952d8] transition-colors whitespace-nowrap shadow-xs cursor-pointer"
              >
                <Sparkles className="h-3 w-3" />
                Ask Z
              </button>

              <div className="w-px h-4 bg-slate-200 mx-1" />

              {/* Copy */}
              <button
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  isInteractingWithMenuRef.current = true;
                }}
                onClick={handleCopy}
                title="Copy"
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full transition-colors cursor-pointer",
                  copied
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>

              {/* Save Note */}
              <button
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  isInteractingWithMenuRef.current = true;
                }}
                onClick={() => {
                  setShowHighlightColors(false);
                  setShowNoteInput((v) => !v);
                }}
                title="Save note"
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full transition-colors cursor-pointer",
                  showNoteInput
                    ? "bg-amber-50 text-amber-600"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <StickyNote className="h-3.5 w-3.5" />
              </button>

              {/* Highlight toggle — only shown when onHighlight is wired */}
              {onHighlight && (
                <>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      isInteractingWithMenuRef.current = true;
                    }}
                    onClick={() => {
                      setShowNoteInput(false);
                      setShowHighlightColors((v) => !v);
                    }}
                    title="Highlight"
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full transition-colors cursor-pointer",
                      showHighlightColors
                        ? "bg-blue-50 text-[#0C60FC]"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    <Highlighter className="h-3.5 w-3.5" />
                  </button>

                  {/* Inline colour swatches when not in note mode */}
                  {showHighlightColors && !showNoteInput && (
                    <>
                      <div className="w-px h-4 bg-slate-200 mx-1" />
                      <div className="flex items-center gap-1.5 pr-1">
                        {HIGHLIGHT_COLORS.map((c) => (
                          <button
                            key={c.id}
                            onMouseDown={(e) => e.preventDefault()}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              isInteractingWithMenuRef.current = true;
                            }}
                            onClick={() => handleHighlight(c.id)}
                            title={c.label}
                            className={cn(
                              "h-4 w-4 rounded-full border-2 border-white shadow-sm hover:scale-125 transition-transform cursor-pointer",
                              c.bg,
                            )}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Dismiss */}
              <button
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  isInteractingWithMenuRef.current = true;
                }}
                onClick={dismiss}
                title="Dismiss"
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Note panel (expands below) */}
            {showNoteInput && (
              <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100">
                <textarea
                  autoFocus
                  placeholder="Add a note to this snippet…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-transparent text-[11.5px] font-medium text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none leading-relaxed"
                  rows={3}
                />

                <div className="flex items-center justify-between mt-2">
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleSaveNote}
                    className="rounded-full bg-slate-950 px-3.5 py-1 text-[10.5px] font-extrabold text-white hover:bg-[#0C60FC] transition-colors"
                  >
                    Save note
                  </button>

                  {onHighlight && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mr-0.5">
                        + highlight
                      </span>
                      {HIGHLIGHT_COLORS.map((c) => (
                        <button
                          key={c.id}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleHighlight(c.id)}
                          title={`Highlight ${c.label}`}
                          className={cn(
                            "h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm hover:scale-125 transition-transform",
                            c.bg,
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
