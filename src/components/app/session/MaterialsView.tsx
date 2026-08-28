"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  UploadCloud,
  Loader2,
  Trash2,
  ExternalLink,
  Plus,
} from "lucide-react";
import {
  useAppMaterials,
  useDeleteAppMaterial,
} from "@/hooks/app/use-app-actions";
import { queryKeys } from "@/lib/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/session";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { IAppMaterial } from "@/types/session";

interface MaterialsViewProps {
  sessionId: string;
  onOpenDocument: (materialId: string) => void;
  onAskAboutMaterial?: (filename: string) => void;
}

export function MaterialsView({
  sessionId,
  onOpenDocument,
  onAskAboutMaterial,
}: MaterialsViewProps) {
  const queryClient = useQueryClient();
  const { data: materials = [], isLoading } = useAppMaterials(sessionId);
  const deleteMutation = useDeleteAppMaterial(sessionId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(
    (file: File) => {
      return new Promise<void>((resolve, reject) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          `${process.env.NEXT_PUBLIC_API_URL}/app/${sessionId}/materials`,
        );

        const token = getAccessToken();
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        xhr.onload = () => {
          setIsUploading(false);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const parsed = JSON.parse(xhr.responseText);
              const mat: IAppMaterial = parsed.data ?? parsed;
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
              toast.success(`${file.name} uploaded successfully.`);
              resolve();
            } catch {
              queryClient.invalidateQueries({
                queryKey: queryKeys.app.materials(sessionId),
              });
              resolve();
            }
          } else {
            toast.error("Failed to upload material.");
            reject(new Error("Upload failed"));
          }
        };

        xhr.onerror = () => {
          setIsUploading(false);
          toast.error("Network error during upload.");
          reject(new Error("Network error"));
        };

        xhr.send(formData);
      });
    },
    [sessionId, queryClient],
  );

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      toast.info(`Uploading ${file.name}…`);
      await uploadFile(file);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 antialiased scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Sources &amp; Study Materials
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Lecture slides, PDFs, and syllabus powering your active study session.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full bg-slate-950 hover:bg-[#0C60FC] text-white px-4 py-2 text-xs font-extrabold shadow-sm transition cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Upload File</span>
        </button>
      </div>

      {/* Drag and Drop Zone */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.md"
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files)}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "rounded-[28px] border-2 border-dashed p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3",
          dragOver
            ? "border-[#0C60FC] bg-blue-50/60"
            : "border-slate-200 hover:border-slate-300 bg-white/60 hover:bg-white"
        )}
      >
        <div className="h-12 w-12 rounded-2xl bg-blue-50 text-[#0C60FC] flex items-center justify-center shadow-xs">
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">
            {isUploading
              ? "Uploading & processing material…"
              : "Drop your lecture slides or syllabus here"}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Supports PDF, DOCX, TXT, and Markdown (up to 50MB)
          </p>
        </div>
      </div>

      {/* Materials List */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
          Uploaded Sources ({materials.length})
        </h3>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : materials.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center text-xs text-slate-400">
            No source documents uploaded yet. Upload a slide deck or PDF to get context-aware citations and exercises.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {materials.map((m: any) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {m.filename}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      {m.size ? `${(m.size / (1024 * 1024)).toFixed(1)} MB` : "Document"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => onOpenDocument(m.id)}
                    className="font-bold text-[#0C60FC] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Open in Reader</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove ${m.filename}?`)) {
                        deleteMutation.mutate(m.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                    title="Remove source"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
