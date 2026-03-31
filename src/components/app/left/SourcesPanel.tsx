"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, UploadCloud, X, Library } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useSocket } from "@/hooks";
import { useAppMaterials } from "@/hooks/app/use-app-actions";
import { queryKeys } from "@/lib/query-keys";
import type { IAppMaterial } from "@/types/session";
import { MaterialCard } from "@/components/app/left/MaterialCard";
import { MaterialSelectorDialog } from "@/components/app/center/MaterialSelectorDialog";
import { getAccessToken } from "@/lib/session";

// ─── Accepted MIME types ──────────────────────────────────────────────────────

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
  "text/markdown": [".md"],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mimeToType(mime: string): IAppMaterial["type"] {
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
  onClose?: () => void;
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
  onClose,
}: SourcesPanelProps) {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const { data: materials = [], isLoading: loading } = useAppMaterials(sessionId);
  const [uploading, setUploading] = useState<UploadRow[]>([]);
  const [query, setQuery] = useState("");
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

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

      queryClient.setQueryData<IAppMaterial[]>(
        queryKeys.app.materials(sessionId),
        (old) => {
          if (!old) return old;
          return old.map((m) =>
            m.id === mid ? { ...m, processingStatus: "ready" } : m,
          );
        },
      );
    }

    socket.on("app:signal", handleSignal);
    return () => {
      socket.off("app:signal", handleSignal);
    };
  }, [socket, queryClient, sessionId]);

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
            const mat: IAppMaterial = parsed.data ?? parsed;
            // Honour the server's processingStatus if present; fall back to "pending"
            queryClient.setQueryData<IAppMaterial[]>(
              queryKeys.app.materials(sessionId),
              (old) => {
                const arr = old ? [...old] : [];
                return [
                  ...arr,
                  { ...mat, processingStatus: mat.processingStatus ?? "pending" },
                ];
              },
            );
          } catch {
            // server sent non-JSON or error — add minimal placeholder
            queryClient.setQueryData<IAppMaterial[]>(
              queryKeys.app.materials(sessionId),
              (old) => {
                const arr = old ? [...old] : [];
                return [
                  ...arr,
                  {
                    id: `local-${Date.now()}`,
                    filename: file.name,
                    type: mimeToType(file.type),
                    size: file.size,
                    processingStatus: "pending",
                  },
                ];
              },
            );
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
    [sessionId, queryClient],
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
  // ── Delete handler (optimistic) ─────────────────────────────────────────────
  const handleDelete = useCallback((id: string) => {
    queryClient.setQueryData<IAppMaterial[]>(
      queryKeys.app.materials(sessionId),
      (old) => (old ? old.filter((m) => m.id !== id) : []),
    );
  }, [queryClient, sessionId]);

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = query.trim()
    ? materials.filter((m) =>
        m.filename.toLowerCase().includes(query.toLowerCase()),
      )
    : materials;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full gap-3 p-4">
      {/* Heading + add button */}
      <div className="flex items-center justify-between pb-1 border-b border-border/40">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
               title="Close Panel"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                <path d="M9 3v18"></path>
                <path d="m16 15-3-3 3-3"></path>
              </svg>
            </button>
          )}
          <span className="text-sm font-semibold tracking-wide text-foreground">
            Sources
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsLibraryOpen(true)}
            className="flex items-center gap-1.5 text-[11px] font-medium border border-border/50 rounded-md px-2 py-1 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors hover:bg-muted/30"
          >
            <Library className="size-3" />
            Library
          </button>
          <button
            type="button"
            onClick={open}
            className="flex items-center gap-1.5 text-[11px] font-medium border border-border/50 rounded-md px-2 py-1 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors hover:bg-muted/30"
          >
            <Plus className="size-3" />
            Add
          </button>
        </div>
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
          className="flex flex-col gap-2 overflow-y-auto no-scrollbar flex-1"
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

      <MaterialSelectorDialog 
        isOpen={isLibraryOpen}
        onOpenChange={setIsLibraryOpen}
        sessionId={sessionId}
        alreadyAddedIds={materials.map(m => m.id)}
      />
    </div>
  );
}
