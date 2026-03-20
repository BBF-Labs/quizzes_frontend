"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { StudioExport } from "@/types/session";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ExportTabProps {
  sessionId: string;
  exports: StudioExport[];
  onExportsChange: (exports: StudioExport[]) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ExportTab({
  sessionId,
  exports,
  onExportsChange,
}: ExportTabProps) {
  const [generating, setGenerating] = useState<"markdown" | "pdf" | null>(null);

  const handleGenerate = async (type: "markdown" | "pdf") => {
    if (generating) return;
    setGenerating(type);
    try {
      const res = await api.post(`/app/${sessionId}/studio/exports`, { type });
      const created: StudioExport = res.data?.data;
      if (!created?.id) {
        throw new Error("Unexpected response from exports API");
      }
      onExportsChange([created, ...exports]);
    } catch (err) {
      console.error("[ExportTab] generate failed", err);
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header + actions */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/50">
          Export
        </span>
      </div>

      {/* Generate buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-7 gap-1 text-[9px] font-mono uppercase tracking-widest"
          disabled={!!generating}
          onClick={() => handleGenerate("markdown")}
        >
          <FileCode className="size-3" />
          {generating === "markdown" ? "Generating…" : "Markdown"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-7 gap-1 text-[9px] font-mono uppercase tracking-widest"
          disabled={!!generating}
          onClick={() => handleGenerate("pdf")}
        >
          <FileText className="size-3" />
          {generating === "pdf" ? "Generating…" : "PDF"}
        </Button>
      </div>

      {/* Exports list */}
      {exports.length === 0 ? (
        <p className="text-[10px] font-mono text-muted-foreground/40 text-center py-4">
          No exports yet
        </p>
      ) : (
        <motion.div
          className="flex flex-col gap-2"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          initial="hidden"
          animate="visible"
        >
          {exports.map((exp) => (
            <motion.div
              key={exp.id}
              variants={{
                hidden: { opacity: 0, y: 6 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
              }}
              className="border border-border/40 bg-card/30 px-3 py-2 flex items-center gap-2"
            >
              {exp.type === "pdf" ? (
                <FileText className="size-3.5 shrink-0 text-muted-foreground/60" />
              ) : (
                <FileCode className="size-3.5 shrink-0 text-muted-foreground/60" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono font-bold text-foreground uppercase">
                  {exp.type}
                </p>
                <p className="text-[9px] font-mono text-muted-foreground/50">
                  {formatDate(exp.createdAt)}
                </p>
              </div>
              {exp.url && (
                <a
                  href={exp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-muted-foreground/50 hover:text-primary transition-colors"
                  aria-label="Download export"
                >
                  <Download className="size-3.5" />
                </a>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
