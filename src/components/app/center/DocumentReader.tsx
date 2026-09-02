"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { X } from "lucide-react";
import {
  useAppMaterial,
  useAppMaterialContent,
  useAppHighlights,
  useAddHighlight,
} from "@/hooks/app/use-app-actions";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SelectionContextMenu } from "./SelectionContextMenu";

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentReaderProps {
  materialId: string;
  sessionId: string;
  onClose?: () => void;
  referencePage?: number;
}

export function DocumentReader({
  materialId,
  sessionId,
  onClose,
  referencePage,
}: DocumentReaderProps) {
  const material = useAppMaterial(sessionId, materialId);
  const {
    data: blob,
    isLoading: isLoadingBlob,
  } = useAppMaterialContent(sessionId, materialId);
  const { data: highlights = [] } = useAppHighlights(sessionId);
  const addHighlight = useAddHighlight(sessionId);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(referencePage || 1);
  const [scale, setScale] = useState<number>(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return 0.7;
    }
    return 1.0;
  });
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  // Responsive scale: on mobile (< 768px, e.g. Galaxy S9), default to 70% scale to fit page view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setScale((prev) => (prev === 1.0 ? 0.7 : prev));
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const rawName = material?.filename || (material as any)?.title || "Document";
  const displayName = rawName.replace(/\.pdf$/i, "");

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
    const container = scrollContainerRef.current;
    if (!container || !numPages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the most-visible page
        let best: { pageNum: number; ratio: number } | null = null;
        entries.forEach((entry) => {
          const pageNum = Number(entry.target.getAttribute("data-page-number"));
          if (!pageNum) return;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { pageNum, ratio: entry.intersectionRatio };
          }
        });
        if (best) setCurrentPage((best as any).pageNum);
      },
      {
        root: container,
        threshold: [0, 0.1, 0.3, 0.5, 0.8],
      },
    );

    pageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [numPages]);

  const scrollToPage = useCallback((pageNum: number) => {
    const target = pageRefs.current[pageNum - 1];
    if (!target) return;

    // Use the scroll container's scrollTop rather than scrollIntoView
    // to prevent the whole browser window from jumping
    const container = scrollContainerRef.current;
    if (container) {
      const containerTop = container.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      const offset = targetTop - containerTop;
      container.scrollBy({ top: offset - 24, behavior: "smooth" });
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    pageRefs.current = new Array(numPages).fill(null);
    // Defer scroll until PDF pages have painted
    if (referencePage && referencePage <= numPages) {
      // Retry a few times because react-pdf renders lazily
      const attempt = (tries: number) => {
        setTimeout(() => {
          const target = pageRefs.current[referencePage - 1];
          if (target) {
            scrollToPage(referencePage);
          } else if (tries > 0) {
            attempt(tries - 1);
          }
        }, 300);
      };
      attempt(5);
    }
  }

  // Re-scroll when referencePage changes after load (e.g. clicking a different citation)
  useEffect(() => {
    if (!referencePage || !numPages) return;
    if (referencePage > numPages) return;
    scrollToPage(referencePage);
  }, [referencePage, numPages, scrollToPage]);

  const zoom = (delta: number) => {
    setScale((prev) => Math.min(Math.max(0.6, Number((prev + delta).toFixed(1))), 2.0));
  };

  const pageHighlights = useMemo(() => {
    return highlights.filter((h) => h.materialId === materialId);
  }, [highlights, materialId]);

  const handleHighlight = useCallback(
    (text: string, rect: DOMRect, color: string, note?: string, range?: Range) => {
      let pageNumber = currentPage;
      let pageEl: HTMLElement | null = null;

      if (range) {
        const node = range.startContainer instanceof HTMLElement
          ? range.startContainer
          : range.startContainer.parentElement;
        pageEl = node?.closest("[data-page-number]") as HTMLElement | null;
      }

      if (!pageEl && pageNumber) {
        pageEl = pageRefs.current[pageNumber - 1];
      }

      if (!pageEl) return;

      const detectedPage = Number(pageEl.getAttribute("data-page-number"));
      if (detectedPage) pageNumber = detectedPage;

      const pageRect = pageEl.getBoundingClientRect();
      if (pageRect.width <= 0 || pageRect.height <= 0) return;

      const bounds = {
        top: Math.max(0, Math.min(100, ((rect.top - pageRect.top) / pageRect.height) * 100)),
        left: Math.max(0, Math.min(100, ((rect.left - pageRect.left) / pageRect.width) * 100)),
        width: Math.max(0, Math.min(100, (rect.width / pageRect.width) * 100)),
        height: Math.max(0, Math.min(100, (rect.height / pageRect.height) * 100)),
      };

      addHighlight.mutate(
        {
          materialId,
          pageNumber,
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

  const totalPages = numPages || 0;
  const pagesList = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/45 backdrop-blur-[2px] antialiased">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-4xl h-[92vh] max-h-220 rounded-[28px] bg-white border border-slate-200/70 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-100 shrink-0">
          <div className="w-6" />

          {/* Centered Green Document Icon + Source title */}
          <div className="flex items-center gap-1.5">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-[#52B32B]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span className="text-xs sm:text-[13px] font-bold text-slate-900">
              Source
            </span>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            title="Close viewer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-2 bg-white/90 border-b border-slate-100/80 shrink-0">
          {/* Left: document name + page counter */}
          <div className="rounded-full bg-white border border-slate-200/90 shadow-2xs px-3.5 py-1 text-xs font-bold text-slate-800 flex items-center gap-2">
            <span className="truncate max-w-64 sm:max-w-xs">{displayName}</span>
            <span className="text-slate-300 text-[10px]">•</span>
            <span className="text-slate-500 font-semibold font-mono text-[11.5px]">
              {currentPage}/{totalPages || "--"}
            </span>
          </div>

          {/* Right: zoom */}
          <div className="rounded-full bg-white border border-slate-200/90 shadow-2xs px-3 py-1 text-xs font-bold text-slate-700 flex items-center gap-2.5 select-none">
            <button
              type="button"
              onClick={() => zoom(-0.1)}
              disabled={scale <= 0.6}
              className="text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer text-sm font-bold"
              title="Zoom out"
            >
              −
            </button>
            <span className="font-mono text-[11px] text-slate-700">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => zoom(0.1)}
              disabled={scale >= 2.0}
              className="text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer text-sm font-bold"
              title="Zoom in"
            >
              +
            </button>
          </div>
        </div>

        {/* Content area — position:relative so SelectionContextMenu absolute coords work */}
        <div
          ref={scrollContainerRef}
          className="relative flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col items-center min-h-0 bg-[#F7F7F7] scroll-smooth scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
        >
          {/* Selection Context Menu wired to scroll container */}
          <SelectionContextMenu
            containerRef={scrollContainerRef}
            onHighlight={handleHighlight}
          />

          {objectUrl ? (
            <Document
              file={objectUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center p-20">
                  <div className="h-6 w-6 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
                </div>
              }
              error={
                <div className="p-8 text-center text-slate-500 text-xs font-medium max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm">
                  Document preview unavailable.
                </div>
              }
            >
              {pagesList.map((pageNum) => {
                const isReference = Boolean(referencePage && pageNum === referencePage);

                return (
                  <div key={pageNum} className="flex flex-col items-center w-full max-w-2xl mb-8">
                    {/* Page Label */}
                    <span className="text-[11px] font-medium text-slate-400 mb-2 select-none">
                      Page {pageNum}
                    </span>

                    {/* Page Container */}
                    <div
                      ref={(el) => {
                        pageRefs.current[pageNum - 1] = el;
                      }}
                      data-page-number={pageNum}
                      className={cn(
                        "relative w-full rounded-[20px] bg-white transition-all overflow-hidden",
                        isReference
                          ? "border-2 border-[#FF5722] shadow-md"
                          : "border border-slate-200 shadow-sm",
                      )}
                    >
                      {/* Orange Reference badge */}
                      {isReference && (
                        <div className="absolute top-2.5 left-2.5 z-30 inline-flex items-center rounded-full bg-[#FF5722] text-white px-3 py-0.5 text-[10.5px] font-bold tracking-wide shadow-xs pointer-events-none">
                          Reference
                        </div>
                      )}

                      <Page
                        pageNumber={pageNum}
                        scale={scale}
                        renderAnnotationLayer={true}
                        renderTextLayer={true}
                        className="rounded-lg overflow-hidden"
                        loading={
                          <div className="h-80 w-full flex items-center justify-center">
                            <div className="h-5 w-5 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
                          </div>
                        }
                      />

                      {/* Highlight Overlays */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                        {pageHighlights
                          .filter((h) => h.pageNumber === pageNum)
                          .map((h) => {
                            const colorMap: Record<string, string> = {
                              yellow: "rgba(250, 204, 21, 0.45)",
                              pink: "rgba(244, 114, 182, 0.45)",
                              green: "rgba(74, 222, 128, 0.45)",
                              blue: "rgba(96, 165, 250, 0.45)",
                            };
                            return (
                              <div
                                key={h.id}
                                className="absolute pointer-events-auto cursor-pointer rounded-xs transition-opacity hover:opacity-80"
                                style={{
                                  top: `${h.bounds.top}%`,
                                  left: `${h.bounds.left}%`,
                                  width: `${h.bounds.width}%`,
                                  height: `${h.bounds.height}%`,
                                  backgroundColor: colorMap[h.color || "yellow"] || "rgba(250, 204, 21, 0.45)",
                                  mixBlendMode: "multiply",
                                }}
                                title={h.note || h.text}
                              />
                            );
                          })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </Document>
          ) : isLoadingBlob ? (
            <div className="flex flex-col items-center justify-center p-16 space-y-3">
              <div className="h-6 w-6 rounded-full border-2 border-[#0C60FC] border-t-transparent animate-spin" />
              <span className="text-xs text-slate-500 font-medium">Loading document…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center max-w-md bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 my-auto">
              <div className="h-10 w-10 rounded-2xl bg-blue-50 text-[#0C60FC] flex items-center justify-center font-bold text-sm">
                PDF
              </div>
              <h4 className="text-sm font-bold text-slate-900">{displayName}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Document preview is loading or content is being prepared.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
