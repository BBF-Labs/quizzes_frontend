"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// @ts-expect-error Side-effect CSS imports for react-pdf
import "react-pdf/dist/Page/AnnotationLayer.css";
// @ts-expect-error Side-effect CSS imports for react-pdf
import "react-pdf/dist/Page/TextLayer.css";

import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search, Trash2 } from "lucide-react";
import { SelectionContextMenu } from "./SelectionContextMenu";
import { useAppMaterial, useAppMaterialContent, useAppHighlights, useAddHighlight, useRemoveHighlight } from "@/hooks/app/use-app-actions";
import { toast } from "sonner";

// Configure worker - using unpkg for simplicity in this environment
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentReaderProps {
  materialId: string;
  sessionId: string;
}

export function DocumentReader({ materialId, sessionId }: DocumentReaderProps) {
  const material = useAppMaterial(sessionId, materialId);
  const { data: blob, isLoading: isLoadingBlob, isError: isBlobError } = useAppMaterialContent(sessionId, materialId);
  const { data: highlights = [] } = useAppHighlights(sessionId);
  const addHighlight = useAddHighlight(sessionId);
  const removeHighlight = useRemoveHighlight(sessionId);

  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Safe object URL management
  useEffect(() => {
    let url: string | null = null;
    const timeoutId = setTimeout(() => {
      if (blob) {
        url = URL.createObjectURL(blob);
        setObjectUrl(url);
      } else {
        setObjectUrl(null);
      }
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (url) URL.revokeObjectURL(url);
    };
  }, [blob]);

  // Page tracking via Intersection Observer
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = Number(entry.target.getAttribute("data-page-number"));
            if (pageNum) setCurrentPage(pageNum);
          }
        });
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.3,
      }
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
    setScale(prev => Math.min(Math.max(0.5, prev + delta), 3.0));
  };

  const handleHighlight = useCallback((text: string, rect: DOMRect, color: string = "yellow") => {
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

    addHighlight.mutate({
      materialId,
      pageNumber: currentPage,
      text,
      bounds,
      color,
    }, {
      onSuccess: () => toast.success("Highlighted text saved."),
      onError: () => toast.error("Failed to save highlight."),
    });
  }, [currentPage, materialId, addHighlight]);

  const pageHighlights = useMemo(() => {
    return highlights.filter(h => h.materialId === materialId);
  }, [highlights, materialId]);

  return (
    <div ref={containerRef} className="relative flex flex-col h-full bg-muted/20 overflow-hidden group/reader">
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
              {currentPage} / {numPages || '--'}
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
          <button onClick={() => zoom(-0.2)} className="p-1.5 hover:bg-accent rounded-md transition-colors">
            <ZoomOut className="size-3.5" />
          </button>
          <span className="text-[11px] font-mono text-muted-foreground w-12 text-center select-none">
            {Math.round(scale * 100)}%
          </span>
          <button onClick={() => zoom(0.2)} className="p-1.5 hover:bg-accent rounded-md transition-colors">
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
                <p className="text-xs font-mono text-muted-foreground animate-pulse">Streaming document...</p>
              </div>
            }
            error={
              <div className="p-12 text-center text-destructive text-xs font-mono border border-destructive/20 bg-destructive/5 rounded-lg max-w-md">
                Failed to load document. The file might be corrupted or inaccessible.
              </div>
            }
          >
            {[...Array(numPages)].map((_, i) => (
              <div 
                key={i + 1}
                ref={el => { pageRefs.current[i] = el }}
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
                    .filter(h => h.pageNumber === i + 1)
                    .map(h => {
                      const highlightColors: Record<string, string> = {
                        yellow: "rgba(255, 255, 0, 0.4)",
                        pink: "rgba(255, 0, 255, 0.3)",
                        green: "rgba(0, 255, 0, 0.3)",
                        blue: "rgba(0, 100, 255, 0.3)",
                      };
                      
                      return (
                        <div
                          key={h.id}
                          className="absolute group/hl pointer-events-auto"
                          style={{
                            top: `${h.bounds.top}%`,
                            left: `${h.bounds.left}%`,
                            width: `${h.bounds.width}%`,
                            height: `${h.bounds.height}%`,
                            backgroundColor: highlightColors[h.color || "yellow"],
                            mixBlendMode: "multiply",
                          }}
                          title={h.text}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeHighlight.mutate(h.id);
                            }}
                            className="absolute -top-1 -right-1 opacity-0 group-hover/hl:opacity-100 bg-destructive text-destructive-foreground p-0.5 rounded-sm shadow-sm transition-opacity"
                          >
                            <Trash2 className="size-2.5" />
                          </button>
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
                 Connection refused. Failed to fetch encrypted content for this material.
               </div>
            ) : (
              <>
                <Loader2 className="size-8 animate-spin text-primary/40" />
                <p className="text-xs font-mono text-muted-foreground animate-pulse">
                  {isLoadingBlob ? "Initializing secure reader..." : "Fetching bits..."}
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
