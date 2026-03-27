"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { File, FileText, FileType2, Loader2, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { IAppMaterial } from "@/types/session";

// ─── Helper: escape a string for use in a RegExp ─────────────────────────────

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSearchPattern(query: string): RegExp | null {
  const words = query.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;
  return new RegExp(`(${words.map(escapeRegex).join("|")})`, "gi");
}

// ─── Helper: bold matched words in a string ───────────────────────────────────

function BoldMatches({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const pattern = buildSearchPattern(query);
  if (!pattern) return <>{text}</>;

  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) => {
        pattern.lastIndex = 0;
        return pattern.test(part) ? (
          <strong key={`${i}-${part}`}>{part}</strong>
        ) : (
          <span key={`${i}-${part}`}>{part}</span>
        );
      })}
    </>
  );
}

// ─── File icon by type ────────────────────────────────────────────────────────

function FileIcon({ type, className }: { type: string; className?: string }) {
  const lower = type.toLowerCase();
  if (lower === "pdf") return <FileText className={className} />;
  if (lower === "docx" || lower === "doc") return <FileType2 className={className} />;
  return <File className={className} />;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: IAppMaterial["processingStatus"] }) {
  if (status === "pending") {
    return (
      <span className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-amber-500 animate-pulse">
        <Loader2 className="size-2.5 animate-spin" />
        Processing
      </span>
    );
  }
  if (status === "ready") {
    return (
      <span className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-green-500">
        <CheckCircle className="size-2.5" />
        Ready
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-destructive">
      <XCircle className="size-2.5" />
      Failed
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface MaterialCardProps {
  sessionId: string;
  material: IAppMaterial;
  isHighlighted: boolean;
  highlightedExcerpt?: string;
  /** Words to bold within the excerpt (typically the current search query) */
  searchQuery?: string;
  onDelete: () => void;
}

export function MaterialCard({
  sessionId,
  material,
  isHighlighted,
  highlightedExcerpt,
  searchQuery,
  onDelete,
}: MaterialCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [showExcerpt, setShowExcerpt] = useState(false);

  // Show excerpt when highlighted, auto-hide after 2 s
  useEffect(() => {
    if (isHighlighted && highlightedExcerpt) {
      setShowExcerpt(true);
      const t = setTimeout(() => setShowExcerpt(false), 2000);
      return () => clearTimeout(t);
    }
  }, [isHighlighted, highlightedExcerpt]);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await api.delete(`/app/${sessionId}/materials/${material.id}`);
      onDelete();
    } catch (err) {
      console.error("[MaterialCard] delete failed", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      animate={{
        borderLeftColor: isHighlighted
          ? "hsl(var(--primary))"
          : "transparent",
      }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col gap-1.5 border border-border/50 bg-card/40 px-3 py-2",
        "border-l-2",
        isHighlighted && "border-l-primary bg-primary/5",
      )}
    >
      {/* Top row: icon + filename + size + delete */}
      <div className="flex items-center gap-2 min-w-0">
        <FileIcon
          type={material.type}
          className="size-3.5 shrink-0 text-muted-foreground"
        />
        <span className="flex-1 text-[11px] font-mono truncate text-foreground leading-tight">
          {material.filename}
        </span>
        <span className="shrink-0 text-[10px] font-mono text-muted-foreground/60 whitespace-nowrap">
          {(material.size / 1024).toFixed(1)} KB
        </span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="shrink-0 p-0.5 text-muted-foreground/50 hover:text-destructive transition-colors disabled:opacity-40"
          aria-label={`Delete ${material.filename}`}
        >
          {deleting ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Trash2 className="size-3" />
          )}
        </button>
      </div>

      {/* Status */}
      <StatusBadge status={material.processingStatus} />

      {/* Highlighted excerpt */}
      <AnimatePresence>
        {showExcerpt && highlightedExcerpt && (
          <motion.div
            key="excerpt"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 border border-primary/20 bg-primary/5 px-2 py-1.5 text-[11px] font-mono text-muted-foreground leading-relaxed">
              <BoldMatches text={highlightedExcerpt} query={searchQuery ?? ""} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
