"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Search,
  Trash2,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { SelectionContextMenu } from "./SelectionContextMenu";
import {
  useAppMaterial,
  useAppMaterialContent,
  useAppHighlights,
  useAddHighlight,
  useRemoveHighlight,
  useUpdateHighlight,
} from "@/hooks/app/use-app-actions";
import { SessionHighlight } from "@/types/session";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Configure worker - using unpkg for simplicity in this environment
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentReaderProps {
  materialId: string;
  sessionId: string;
}

export function DocumentReader({ materialId, sessionId }: DocumentReaderProps) {
  const material = useAppMaterial(sessionId, materialId);
  const {
    data: blob,
    isLoading: isLoadingBlob,
    isError: isBlobError,
  } = useAppMaterialContent(sessionId, materialId);
  const { data: highlights = [] } = useAppHighlights(sessionId);
  const addHighlight = useAddHighlight(sessionId);
  const removeHighlight = useRemoveHighlight(sessionId as string);
  const updateHighlight = useUpdateHighlight(sessionId as string);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingHighlight, setEditingHighlight] =
    useState<SessionHighlight | null>(null);
  const [scale, setScale] = useState<number>(1.2);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Safe object URL management
  useEffect(() => {
    if (!blob) {
      setObjectUrl(null);
      return;
    }

    const url = URL.createObjectURL(blob);
    setObjectUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [blob]);

  // Page tracking via Intersection Observer
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = Number(
              entry.target.getAttribute("data-page-number"),
            );
            if (pageNum) setCurrentPage(pageNum);
          }
        });
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.3,
      },
    );

    pageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [numPages, isLoadingBlob]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    pageRefs.current = new Array(numPages).fill(null);
  }

  const scrollToPage = (pageNum: number) => {
    const target = pageRefs.current[pageNum - 1];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const zoom = (delta: number) => {
    setScale((prev) => Math.min(Math.max(0.5, prev + delta), 3.0));
  };

  const handleHighlight = useCallback(
    (text: string, rect: DOMRect, color: string = "yellow", note?: string) => {
      // Find the page element that contains the selection to calculate relative bounds
      const pageElement = pageRefs.current[currentPage - 1];
      if (!pageElement) return;

      const pageRect = pageElement.getBoundingClientRect();

      // Bounds as percentages for responsive scaling
      const bounds = {
        top: ((rect.top - pageRect.top) / pageRect.height) * 100,
        left: ((rect.left - pageRect.left) / pageRect.width) * 100,
        width: (rect.width / pageRect.width) * 100,
        height: (rect.height / pageRect.height) * 100,
      };

      addHighlight.mutate(
        {
          materialId,
          pageNumber: currentPage,
          text,
          bounds,
          color,
          note,
        },
        {
          onSuccess: () => toast.success("Highlighted text saved."),
          onError: () => toast.error("Failed to save highlight."),
        },
      );
    },
    [currentPage, materialId, addHighlight],
  );

  const pageHighlights = useMemo(() => {
    return highlights.filter((h) => h.materialId === materialId);
  }, [highlights, materialId]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col h-full bg-muted/20 overflow-hidden group/reader"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-background/50 backdrop-blur-sm z-20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Search className="size-3 text-muted-foreground/60" />
            <span className="text-[11px] font-semibold truncate text-foreground/80 max-w-50">
              {material?.filename || "Loading..."}
            </span>
            {material?.processingStatus === "pending" && (
              <Loader2 className="size-3 animate-spin text-amber-500" />
            )}
          </div>
          <div className="w-px h-3 bg-border/40 mx-1" />
          <div className="flex items-center gap-1">
            <button
              onClick={() => scrollToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 hover:bg-accent rounded-md disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-[11px] font-mono text-muted-foreground w-16 text-center">
              {currentPage} / {numPages || "--"}
            </span>
            <button
              onClick={() => scrollToPage(currentPage + 1)}
              disabled={currentPage >= numPages}
              className="p-1.5 hover:bg-accent rounded-md disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => zoom(-0.2)}
            className="p-1.5 hover:bg-accent rounded-md transition-colors"
          >
            <ZoomOut className="size-3.5" />
          </button>
          <span className="text-[11px] font-mono text-muted-foreground w-12 text-center select-none">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => zoom(0.2)}
            className="p-1.5 hover:bg-accent rounded-md transition-colors"
          >
            <ZoomIn className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Content Area - Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto p-4 flex flex-col items-center gap-6 no-scrollbar scroll-smooth"
      >
        {objectUrl ? (
          <Document
            file={objectUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex flex-col items-center justify-center p-20 gap-3">
                <Loader2 className="size-8 animate-spin text-primary/40" />
                <p className="text-xs font-mono text-muted-foreground animate-pulse">
                  Streaming document...
                </p>
              </div>
            }
            error={
              <div className="p-12 text-center text-destructive text-xs font-mono border border-destructive/20 bg-destructive/5 rounded-lg max-w-md">
                Failed to load document. The file might be corrupted or
                inaccessible.
              </div>
            }
          >
            {[...Array(numPages)].map((_, i) => (
              <div
                key={i + 1}
                ref={(el) => {
                  pageRefs.current[i] = el;
                }}
                data-page-number={i + 1}
                className="relative shadow-xl shadow-black/10 transition-transform duration-300"
              >
                <Page
                  pageNumber={i + 1}
                  scale={scale}
                  renderAnnotationLayer={true}
                  renderTextLayer={true}
                  className="rounded-none overflow-hidden"
                  loading={null}
                />

                {/* Highlight Overlays for this page */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                  {pageHighlights
                    .filter((h) => h.pageNumber === i + 1)
                    .map((h) => {
                      const highlightColors: Record<string, string> = {
                        yellow: "rgba(255, 255, 0, 0.4)",
                        pink: "rgba(255, 0, 255, 0.3)",
                        green: "rgba(0, 255, 0, 0.3)",
                        blue: "rgba(0, 100, 255, 0.3)",
                      };

                      return (
                        <div
                          key={h.id}
                          className={cn(
                            "absolute group/hl pointer-events-auto cursor-pointer transition-shadow hover:shadow-[0_0_0_2px_rgba(var(--primary),0.3)]",
                            editingHighlight?.id === h.id &&
                              "shadow-[0_0_0_2px_rgba(var(--primary),0.5)] z-40",
                          )}
                          style={{
                            top: `${h.bounds.top}%`,
                            left: `${h.bounds.left}%`,
                            width: `${h.bounds.width}%`,
                            height: `${h.bounds.height}%`,
                            backgroundColor:
                              highlightColors[h.color || "yellow"],
                            mixBlendMode: "multiply",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (editingHighlight?.id !== h.id) setEditingHighlight(h);
                          }}
                          title={h.note ? `Note: ${h.note}` : h.text}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeHighlight.mutate(h.id, {
                                onSuccess: () => toast.success("Highlight removed"),
                                onError: () => toast.error("Failed to remove highlight"),
                              });
                              if (editingHighlight?.id === h.id)
                                setEditingHighlight(null);
                            }}
                            className="absolute -top-1 -right-1 opacity-0 group-hover/hl:opacity-100 bg-destructive text-destructive-foreground p-0.5 rounded-sm shadow-sm transition-opacity"
                          >
                            <Trash2 className="size-2.5" />
                          </button>

                          {h.note && (
                            <div className="absolute -top-1 -left-1 size-2 rounded-full bg-primary border border-background shadow-xs" />
                          )}

                          {h.note && (
                            <div
                              className={cn(
                                "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 transition-opacity pointer-events-auto z-50 cursor-default",
                                editingHighlight?.id === h.id
                                  ? "opacity-100"
                                  : "opacity-0 group-hover/hl:opacity-100",
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (editingHighlight?.id !== h.id) setEditingHighlight(h);
                              }}
                            >
                              <div className="bg-background/95 backdrop-blur-md border border-border/50 p-2.5 rounded-lg shadow-xl text-[10px] min-w-48 max-w-64 font-mono leading-relaxed group/note relative">
                                {editingHighlight?.id === h.id ? (
                                  <div className="space-y-2.5" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                                      <p className="text-primary font-bold uppercase tracking-widest text-[8px]">
                                        Editing Annotation
                                      </p>
                                      <button 
                                        onClick={() => setEditingHighlight(null)}
                                        className="p-0.5 hover:bg-muted rounded transition-colors text-muted-foreground"
                                      >
                                        <X className="size-2.5" />
                                      </button>
                                    </div>
                                    
                                    <textarea
                                      autoFocus
                                      defaultValue={h.note}
                                      id={`edit-note-${h.id}`}
                                      className="w-full bg-muted/30 border border-border/40 rounded p-1.5 text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-primary/30 min-h-[60px] resize-none leading-relaxed"
                                    />

                                    <div className="flex items-center justify-between pt-1">
                                      <div className="flex items-center gap-1.5">
                                        {Object.keys(highlightColors).map((cId) => (
                                          <button
                                            key={cId}
                                            onClick={() => {
                                              const newNote = (document.getElementById(`edit-note-${h.id}`) as HTMLTextAreaElement).value;
                                              updateHighlight.mutate({
                                                highlightId: h.id,
                                                note: newNote,
                                                color: cId
                                              }, {
                                                onSuccess: () => setEditingHighlight(null)
                                              });
                                            }}
                                            className={cn(
                                              "size-3 rounded-full border border-black/10 transition-transform hover:scale-125",
                                              cId === "yellow" && "bg-yellow-400",
                                              cId === "pink" && "bg-pink-400",
                                              cId === "green" && "bg-green-400",
                                              cId === "blue" && "bg-blue-400",
                                              (h.color || "yellow") === cId && "ring-1 ring-primary ring-offset-1 ring-offset-background"
                                            )}
                                          />
                                        ))}
                                      </div>
                                      
                                      <button
                                        onClick={() => {
                                          const newNote = (document.getElementById(`edit-note-${h.id}`) as HTMLTextAreaElement).value;
                                          updateHighlight.mutate({
                                            highlightId: h.id,
                                            note: newNote,
                                            color: h.color
                                          }, {
                                            onSuccess: () => {
                                              toast.success("Note updated");
                                              setEditingHighlight(null);
                                            }
                                          });
                                        }}
                                        className="bg-primary text-primary-foreground px-2 py-1 rounded text-[9px] font-bold flex items-center gap-1 hover:opacity-90 transition-opacity"
                                      >
                                        <Save className="size-2.5" />
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center justify-between mb-1.5 border-b border-border/40 pb-1">
                                      <p className="text-muted-foreground/60 uppercase tracking-widest text-[8px]">
                                        Annotation
                                      </p>
                                      <button className="p-0.5 hover:bg-muted rounded transition-colors text-muted-foreground/40 hover:text-primary">
                                        <Pencil className="size-2.5" />
                                      </button>
                                    </div>
                                    <p className="text-foreground whitespace-pre-wrap cursor-text">
                                      {h.note}
                                    </p>
                                  </>
                                )}
                              </div>
                              <div className="w-2 h-2 bg-background/95 border-r border-b border-border/50 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </Document>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 gap-3 min-h-100">
            {isBlobError ? (
              <div className="p-12 text-center text-destructive text-xs font-mono border border-destructive/20 bg-destructive/5 rounded-lg max-w-md">
                Connection refused. Failed to fetch encrypted content for this
                material.
              </div>
            ) : (
              <>
                <Loader2 className="size-8 animate-spin text-primary/40" />
                <p className="text-xs font-mono text-muted-foreground animate-pulse">
                  {isLoadingBlob
                    ? "Initializing secure reader..."
                    : "Fetching bits..."}
                </p>
              </>
            )}
          </div>
        )}

        {/* Selection Context Menu - Bound to main reader container */}
        <SelectionContextMenu
          containerRef={containerRef}
          onHighlight={handleHighlight}
        />
      </div>
    </div>
  );
}
