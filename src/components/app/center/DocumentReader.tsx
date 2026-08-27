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
  X,
  FileText,
  Bookmark,
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
  const removeHighlight = useRemoveHighlight(sessionId as string);
  const updateHighlight = useUpdateHighlight(sessionId as string);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(referencePage || 1);
  const [editingHighlight, setEditingHighlight] =
    useState<SessionHighlight | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

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
    if (referencePage && referencePage <= numPages) {
      setTimeout(() => scrollToPage(referencePage), 100);
    }
  }

  const scrollToPage = (pageNum: number) => {
    const target = pageRefs.current[pageNum - 1];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const zoom = (delta: number) => {
    setScale((prev) => Math.min(Math.max(0.6, Number((prev + delta).toFixed(1))), 2.0));
  };

  const handleHighlight = useCallback(
    (text: string, rect: DOMRect, color: string = "yellow", note?: string) => {
      const pageElement = pageRefs.current[currentPage - 1];
      if (!pageElement) return;

      const pageRect = pageElement.getBoundingClientRect();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm antialiased">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-4xl h-[92vh] max-h-[860px] rounded-[28px] bg-[#F7F9FC] border border-slate-200/80 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Top Title Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 shrink-0">
          <div className="w-8" />
          {/* Centered Title */}
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <FileText className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-extrabold text-slate-900">
              Source
            </span>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer"
            title="Close viewer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Toolbar Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-white/70 backdrop-blur-md border-b border-slate-200/60 shrink-0 text-xs">
          {/* Document Name and Page Dropdown */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 font-bold text-slate-700 max-w-xs sm:max-w-md truncate">
              <span className="truncate">{material?.filename || "Loading document…"}</span>
              <span className="text-slate-400">▸</span>
              <span className="text-slate-900 font-extrabold shrink-0">
                {currentPage}/{numPages || "--"}
              </span>
            </div>
          </div>

          {/* Zoom controls */}
          <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-0.5 text-xs font-bold text-slate-700">
            <button
              type="button"
              onClick={() => zoom(-0.1)}
              disabled={scale <= 0.6}
              className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] select-none">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => zoom(0.1)}
              disabled={scale >= 2.0}
              className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col items-center gap-8 scroll-smooth scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
        >
          {objectUrl ? (
            <Document
              file={objectUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center justify-center p-20 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0C60FC]" />
                  <p className="text-xs font-bold text-slate-400 animate-pulse">
                    Loading source document…
                  </p>
                </div>
              }
              error={
                <div className="p-12 text-center text-rose-600 text-xs font-bold border border-rose-200 bg-rose-50 rounded-2xl max-w-md">
                  Failed to load document preview.
                </div>
              }
            >
              {[...Array(numPages)].map((_, i) => {
                const pageNum = i + 1;
                const isReference = referencePage ? pageNum === referencePage : false;

                return (
                  <div key={pageNum} className="flex flex-col items-center gap-2">
                    {/* Page Label */}
                    <span className="text-[11px] font-bold text-slate-400 select-none">
                      Page {pageNum}
                    </span>

                    {/* Page Box (with Orange Reference Border if cited) */}
                    <div
                      ref={(el) => {
                        pageRefs.current[i] = el;
                      }}
                      data-page-number={pageNum}
                      className={cn(
                        "relative rounded-2xl overflow-hidden bg-white shadow-xl transition-all",
                        isReference &&
                          "ring-4 ring-orange-500/80 border-2 border-orange-500"
                      )}
                    >
                      {isReference && (
                        <div className="absolute top-2 left-2 z-30 inline-flex items-center gap-1 rounded-full bg-orange-500 text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-md">
                          <span>Reference</span>
                        </div>
                      )}

                      <Page
                        pageNumber={pageNum}
                        scale={scale}
                        renderAnnotationLayer={true}
                        renderTextLayer={true}
                        className="rounded-xl overflow-hidden"
                        loading={
                          <div className="h-96 w-72 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                          </div>
                        }
                      />

                      {/* Highlight Overlays */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                        {pageHighlights
                          .filter((h) => h.pageNumber === pageNum)
                          .map((h) => (
                            <div
                              key={h.id}
                              className="absolute pointer-events-auto cursor-pointer"
                              style={{
                                top: `${h.bounds.top}%`,
                                left: `${h.bounds.left}%`,
                                width: `${h.bounds.width}%`,
                                height: `${h.bounds.height}%`,
                                backgroundColor: "rgba(255, 235, 59, 0.4)",
                                mixBlendMode: "multiply",
                              }}
                              title={h.note || h.text}
                            />
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </Document>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#0C60FC]" />
              <p className="text-xs font-bold text-slate-400">Opening source…</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
