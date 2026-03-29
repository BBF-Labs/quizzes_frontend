"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Save, Copy, Check, Highlighter } from "lucide-react";
import { useAppLayout } from "@/app/(app)/app/[id]/layout";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SelectionContextMenuProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onHighlight?: (text: string, rect: DOMRect, color: string) => void;
}

export function SelectionContextMenu({ containerRef, onHighlight }: SelectionContextMenuProps) {
  const [position, setPosition] = useState<{ x: number, y: number } | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [selectedRect, setSelectedRect] = useState<DOMRect | null>(null);
  const { sendMessage, addNote } = useAppLayout();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleMouseUp = () => {
      // Small timeout to ensure selection is populated
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          setPosition(null);
          return;
        }

        const range = selection.getRangeAt(0);
        const text = selection.toString().trim();

        if (text.length > 0) {
          try {
             // Get bounding rect relative to the reader container
            const rect = range.getBoundingClientRect();
            const containerRect = containerRef.current?.getBoundingClientRect();

            if (containerRect && rect.width > 0) {
              // Position above the selection
              setPosition({
                x: rect.left - containerRect.left + (rect.width / 2),
                y: rect.top - containerRect.top - 10,
              });
              setSelectedText(text);
              setSelectedRect(rect);
            }
          } catch (e) {
            console.warn("[SelectionContextMenu] Failed to get bounding rect", e);
            setPosition(null);
            setSelectedRect(null);
          }
        } else {
          setPosition(null);
          setSelectedRect(null);
        }
      }, 10);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      if (container) {
        container.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [containerRef]);

  const handleAskZ = async () => {
    if (!selectedText) return;
    const prompt = `Can you explain this excerpt from the material: "${selectedText}"?`;
    setPosition(null);
    try {
      await sendMessage(prompt);
      toast.success("Query sent to Z.");
    } catch {
      toast.error("Failed to send query.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setPosition(null);
    }, 1000);
    toast.success("Text copied to clipboard.");
  };

  const handleSaveNote = () => {
    if (!selectedText) return;
    addNote("Snippet", selectedText);
    setPosition(null);
  };

  const handleHighlight = (color: string) => {
    if (!selectedText || !selectedRect || !onHighlight) return;
    onHighlight(selectedText, selectedRect, color);
    setPosition(null);
  };

  const colors = [
    { id: "yellow", class: "bg-yellow-400" },
    { id: "pink", class: "bg-pink-400" },
    { id: "green", class: "bg-green-400" },
    { id: "blue", class: "bg-blue-400" },
  ];

  return (
    <AnimatePresence>
      {position && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="absolute z-100 flex items-center gap-1 p-1 bg-background/95 backdrop-blur-md border border-border/50 shadow-xl rounded-full"
          style={{ 
            left: `${position.x}px`, 
            top: `${position.y}px`,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <button 
            onClick={handleAskZ}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-primary hover:bg-primary/10 rounded-full transition-colors whitespace-nowrap"
          >
            <Sparkles className="size-3" />
            Ask Z
          </button>
          
          <div className="w-px h-3 bg-border/50 mx-0.5" />
          
          <button 
            onClick={handleCopy}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            title="Copy"
          >
            {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
          </button>

          <button 
            onClick={handleSaveNote}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            title="Save Note"
          >
            <Save className="size-3" />
          </button>

          {onHighlight && (
             <>
               <div className="w-px h-3 bg-border/50 mx-0.5" />
               <div className="flex items-center gap-1.5 px-2">
                 {colors.map((c) => (
                   <button
                     key={c.id}
                     onClick={() => handleHighlight(c.id)}
                     className={cn(
                       "size-3 rounded-full hover:scale-125 transition-transform shadow-sm border border-black/10",
                       c.class,
                     )}
                     title={`Highlight ${c.id}`}
                   />
                 ))}
               </div>
             </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
