"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { useSocket } from "@/hooks/use-socket";
import type { ISessionMaterial } from "@/types/session";
import { MaterialCard } from "@/components/app/left/MaterialCard";

// ─── Accepted MIME types ──────────────────────────────────────────────────────

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
  "text/markdown": [".md"],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mimeToType(mime: string): ISessionMaterial["type"] {
  if (mime === "application/pdf") return "pdf";
  if (mime.includes("wordprocessingml")) return "docx";
  if (mime === "text/markdown") return "md";
  return "txt";
}

// ─── Upload row ───────────────────────────────────────────────────────────────

interface UploadRow {
  filename: string;
  progress: number;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SourcesPanelProps {
  sessionId: string;
  activeCitationId: string | null;
  highlightedExcerpt?: string;
}

// ─── Stagger animation ────────────────────────────────────────────────────────

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function SourcesPanel({
  sessionId,
  activeCitationId,
  highlightedExcerpt,
}: SourcesPanelProps) {
  const { socket } = useSocket();

  const [materials, setMaterials] = useState<ISessionMaterial[]>([]);
  const [uploading, setUploading] = useState<UploadRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // ── Fetch materials on mount ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    api
      .get<{ data: ISessionMaterial[] } | ISessionMaterial[]>(`/app/${sessionId}/materials`)
      .then((res) => {
        if (cancelled) return;
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : (raw as { data: ISessionMaterial[] }).data;
        setMaterials(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (!cancelled) console.error("[SourcesPanel] fetch failed", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // ── Socket listener: material_ready ────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    function handleSignal(payload: {
      signalType?: string;
      id?: string;
      materialId?: string;
    }) {
      if (payload.signalType !== "material_ready") return;
      const mid = payload.id ?? payload.materialId;
      if (!mid) return;

      setMaterials((prev) =>
        prev.map((m) =>
          m.id === mid ? { ...m, processingStatus: "ready" } : m,
        ),
      );
    }

    socket.on("app:signal", handleSignal);
    return () => {
      socket.off("app:signal", handleSignal);
    };
  }, [socket]);

  // ── Upload handler ──────────────────────────────────────────────────────────
  const uploadFile = useCallback(
    (file: File) => {
      return new Promise<void>((resolve) => {
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          `${process.env.NEXT_PUBLIC_API_URL}/app/${sessionId}/materials`,
        );

        // Inject auth token
        const token = getAccessToken();
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        // Track per-file progress
        xhr.upload.onprogress = (e) => {
          if (!e.lengthComputable) return;
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploading((prev) =>
            prev.map((u) =>
              u.filename === file.name ? { ...u, progress: pct } : u,
            ),
          );
        };

        xhr.onload = () => {
          try {
            const parsed = JSON.parse(xhr.responseText);
            const mat: ISessionMaterial = parsed.data ?? parsed;
            // Honour the server's processingStatus if present; fall back to "pending"
            setMaterials((prev) => [
              ...prev,
              { ...mat, processingStatus: mat.processingStatus ?? "pending" },
            ]);
          } catch {
            // server sent non-JSON or error — add minimal placeholder
            setMaterials((prev) => [
              ...prev,
              {
                id: `local-${Date.now()}`,
                filename: file.name,
                type: mimeToType(file.type),
                size: file.size,
                processingStatus: "pending",
              },
            ]);
          }
          setUploading((prev) => prev.filter((u) => u.filename !== file.name));
          resolve();
        };

        xhr.onerror = () => {
          console.error(`[SourcesPanel] upload failed: ${file.name}`);
          setUploading((prev) => prev.filter((u) => u.filename !== file.name));
          resolve();
        };

        xhr.send(formData);
      });
    },
    [sessionId],
  );

  // ── react-dropzone ──────────────────────────────────────────────────────────
  const onDrop = useCallback(
    (accepted: File[]) => {
      accepted.forEach((file) => {
        // Register in uploading list
        setUploading((prev) => [
          ...prev,
          { filename: file.name, progress: 0 },
        ]);
        uploadFile(file);
      });
    },
    [uploadFile],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    noClick: false,
    noKeyboard: false,
  });

  // ── Delete handler ──────────────────────────────────────────────────────────
  const handleDelete = useCallback((id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = query.trim()
    ? materials.filter((m) =>
        m.filename.toLowerCase().includes(query.toLowerCase()),
      )
    : materials;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Heading + add button */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50">
          Sources
        </p>
        <button
          type="button"
          onClick={open}
          className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest border border-border/50 px-2 py-1 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
        >
          <Plus className="size-2.5" />
          Add
        </button>
      </div>

      {/* Search */}
      <div className="relative flex items-center border border-border/40 focus-within:border-primary/40 transition-colors">
        <Search className="absolute left-2 size-3 text-muted-foreground/50 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sources…"
          className="w-full bg-transparent pl-7 pr-7 py-1.5 text-[11px] font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              <X className="size-3" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center gap-1.5 border border-dashed px-3 py-4 cursor-pointer transition-colors select-none",
          isDragActive
            ? "border-primary/60 bg-primary/5 text-primary"
            : "border-border/40 bg-muted/10 text-muted-foreground/50 hover:border-primary/30 hover:text-muted-foreground",
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="size-4" />
        <span className="text-[10px] font-mono text-center leading-tight">
          {isDragActive ? "Release to upload" : "Drop files here or click to upload"}
        </span>
        <span className="text-[9px] font-mono text-muted-foreground/40">
          PDF · DOCX · TXT · MD
        </span>
      </div>

      {/* In-progress uploads */}
      <AnimatePresence>
        {uploading.map((u) => (
          <motion.div
            key={u.filename}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex flex-col gap-1 border border-border/40 bg-card/30 px-3 py-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono truncate text-foreground max-w-[80%]">
                {u.filename}
              </span>
              <span className="text-[9px] font-mono text-muted-foreground/60">
                {u.progress}%
              </span>
            </div>
            <div className="h-0.5 w-full bg-border/40 overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                animate={{ width: `${u.progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Material list */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] font-mono text-muted-foreground/50 animate-pulse">
            Loading…
          </span>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-[10px] font-mono text-muted-foreground/40 text-center py-4">
          {query ? "No sources match your search" : "No sources uploaded yet"}
        </p>
      ) : (
        <motion.div
          className="flex flex-col gap-2 overflow-y-auto flex-1"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {filtered.map((m) => (
            <motion.div key={m.id} variants={itemVariants}>
              <MaterialCard
                sessionId={sessionId}
                material={m}
                isHighlighted={activeCitationId === m.id}
                highlightedExcerpt={
                  activeCitationId === m.id ? highlightedExcerpt : undefined
                }
                searchQuery={query}
                onDelete={() => handleDelete(m.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
