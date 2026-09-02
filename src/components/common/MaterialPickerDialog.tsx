"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  CheckCircle2,
  Loader2,
  Library,
  Upload,
  Image as ImageIcon,
  X,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLibraryMaterials, useCreateLibraryMaterial } from "@/hooks/app/use-app-library";
import { useUploadFile } from "@/hooks/common/use-upload";
import { toast } from "sonner";

// ─── Allowed types (mirrors worker dispatch logic in material.ts) ─────────────
export const ALLOWED_MATERIAL_TYPES = [
  { mime: "application/pdf", ext: ".pdf", label: "PDF" },
  {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ext: ".docx",
    label: "DOCX",
  },
  { mime: "text/plain", ext: ".txt", label: "TXT" },
  { mime: "image/jpeg", ext: ".jpg,.jpeg", label: "JPEG" },
  { mime: "image/png", ext: ".png", label: "PNG" },
  { mime: "image/webp", ext: ".webp", label: "WebP" },
  { mime: "image/gif", ext: ".gif", label: "GIF" },
];

const ACCEPT_STRING = ALLOWED_MATERIAL_TYPES.map((t) => t.ext).join(",");
const ALLOWED_MIMES = new Set(ALLOWED_MATERIAL_TYPES.map((t) => t.mime));

function isImage(mime: string) {
  return mime.startsWith("image/");
}

function formatBytes(bytes: number) {
  if (!bytes) return "—";
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface MaterialPickerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when a material has been selected (or uploaded + selected). */
  onSelect: (materialId: string) => void;
  /** Whether to show the Upload tab. Default false. */
  allowUpload?: boolean;
  /** IDs to hide from the library list (e.g. already-added). */
  excludeIds?: string[];
  title?: string;
  description?: string;
  /** Label for the confirm CTA. Default "Select". */
  confirmLabel?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MaterialPickerDialog({
  isOpen,
  onOpenChange,
  onSelect,
  allowUpload = false,
  excludeIds = [],
  title = "Select Material",
  description = "Choose a material from your library.",
  confirmLabel = "Select",
}: MaterialPickerDialogProps) {
  const { data: materials = [], isLoading } = useLibraryMaterials();
  const uploadFile = useUploadFile();
  const createMaterial = useCreateLibraryMaterial();

  const [tab, setTab] = useState<"library" | "upload">("library");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Upload tab state
  const [dragOver, setDragOver] = useState(false);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setSearch("");
    setSelectedId(null);
    setTab("library");
    setPickedFile(null);
    setPreviewUrl(null);
    setFileError(null);
    setUploadTitle("");
    setIsUploading(false);
  }, []);

  const close = useCallback(() => {
    onOpenChange(false);
    reset();
  }, [onOpenChange, reset]);

  // Library list
  const filtered = materials.filter((m) => {
    if (excludeIds.includes(m.id)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (m.title || "").toLowerCase().includes(q) ||
      (m.mimeType || "").toLowerCase().includes(q)
    );
  });

  // File validation
  const validateAndSetFile = useCallback((file: File) => {
    setFileError(null);
    if (!ALLOWED_MIMES.has(file.type)) {
      setFileError(
        `"${file.name}" is not a supported format. Allowed: PDF, DOCX, TXT, or an image.`,
      );
      setPickedFile(null);
      setPreviewUrl(null);
      return;
    }
    setPickedFile(file);
    setUploadTitle(file.name.replace(/\.[^.]+$/, ""));
    if (isImage(file.type)) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  // Library confirm
  const handleLibraryConfirm = () => {
    if (!selectedId) return;
    onSelect(selectedId);
    close();
  };

  // Upload + select
  const handleUpload = async () => {
    if (!pickedFile) return;
    setIsUploading(true);
    try {
      const upload = await uploadFile.mutateAsync({ file: pickedFile });
      const material = await createMaterial.mutateAsync({
        uploadId: upload._id,
        title: uploadTitle.trim() || pickedFile.name,
      });
      toast.success("Material uploaded.");
      onSelect(material.id);
      close();
    } catch (err: any) {
      if (err?.response?.status === 402) {
        toast.error("Daily upload limit reached. Upgrade your plan to upload more.");
      } else {
        toast.error("Upload failed. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 6 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-120 rounded-[28px] bg-white border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "88vh" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[#0C60FC]">
              <Library className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 leading-tight">{title}</h2>
              <p className="text-[10.5px] font-medium text-slate-500 mt-0.5">{description}</p>
            </div>
          </div>
          <button
            onClick={close}
            className="text-slate-400 hover:text-slate-700 transition ml-3 mt-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab switcher — only when upload is allowed */}
        {allowUpload && (
          <div className="px-6 pt-4 pb-0 shrink-0">
            <div className="inline-flex rounded-full bg-slate-100 p-0.5">
              {(["library", "upload"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[11px] font-extrabold transition-all capitalize",
                    tab === t
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  {t === "library" ? "My Library" : "Upload New"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <AnimatePresence mode="wait" initial={false}>
            {tab === "library" ? (
              <motion.div
                key="library"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.14 }}
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
              >
                {/* Search */}
                <div className="px-5 pt-4 pb-3 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search your library…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0C60FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-2 scrollbar-none [&::-webkit-scrollbar]:hidden">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin mb-2" />
                      <p className="text-xs font-semibold">Loading library…</p>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                      <FileText className="h-10 w-10 mb-2 opacity-40" />
                      <p className="text-xs font-bold">
                        {search ? "No matches found" : "Your library is empty"}
                      </p>
                      {!search && allowUpload && (
                        <button
                          onClick={() => setTab("upload")}
                          className="mt-3 text-[11px] font-extrabold text-[#0C60FC] hover:underline"
                        >
                          Upload a material →
                        </button>
                      )}
                    </div>
                  ) : (
                    filtered.map((m) => {
                      const isSelected = selectedId === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setSelectedId(isSelected ? null : m.id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all",
                            isSelected
                              ? "border-[#0C60FC] bg-blue-50 ring-2 ring-blue-100"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                          )}
                        >
                          <div
                            className={cn(
                              "h-9 w-9 flex items-center justify-center rounded-xl shrink-0",
                              isSelected ? "bg-[#0C60FC] text-white" : "bg-slate-100 text-slate-500",
                            )}
                          >
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-xs font-bold truncate",
                                isSelected ? "text-[#0C60FC]" : "text-slate-900",
                              )}
                            >
                              {m.title}
                            </p>
                            <p className="text-[10px] font-medium text-slate-400 mt-0.5 truncate uppercase">
                              {m.mimeType?.split("/").pop()} · {formatBytes(m.size)}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-[#0C60FC] shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={close}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-[11px] font-extrabold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!selectedId}
                    onClick={handleLibraryConfirm}
                    className="rounded-xl bg-slate-950 px-5 py-2 text-[11px] font-extrabold text-white hover:bg-[#0C60FC] transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {confirmLabel}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.14 }}
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto px-5 pt-4 pb-2 space-y-4 scrollbar-none [&::-webkit-scrollbar]:hidden">
                  {/* Drop zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all py-8 px-4",
                      dragOver
                        ? "border-[#0C60FC] bg-blue-50"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100",
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept={ACCEPT_STRING}
                      onChange={handleFilePick}
                    />

                    {!pickedFile ? (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm mb-3">
                          <Upload className="h-5 w-5 text-slate-400" />
                        </div>
                        <p className="text-xs font-extrabold text-slate-700">
                          Drop a file or click to browse
                        </p>
                        <p className="text-[10.5px] font-medium text-slate-400 mt-1">
                          PDF, DOCX, TXT · JPEG, PNG, WebP, GIF · max 50 MB
                        </p>
                      </>
                    ) : (
                      <div className="flex items-center gap-4 w-full">
                        {previewUrl ? (
                          // Image thumbnail
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-20 w-20 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          // Document icon
                          <div className="flex h-20 w-16 flex-col items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm shrink-0">
                            <FileText className="h-7 w-7 text-[#0C60FC] mb-1" />
                            <span className="text-[9px] font-extrabold uppercase text-[#0C60FC] tracking-wider">
                              {pickedFile.name.split(".").pop()?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-extrabold text-slate-900 truncate">
                            {pickedFile.name}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                            {formatBytes(pickedFile.size)}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPickedFile(null);
                              setPreviewUrl(null);
                              setUploadTitle("");
                            }}
                            className="mt-1.5 text-[10px] font-extrabold text-rose-500 hover:text-rose-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Inline error */}
                  {fileError && (
                    <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2.5">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <p className="text-[10.5px] font-semibold text-rose-700">{fileError}</p>
                    </div>
                  )}

                  {/* Title field */}
                  {pickedFile && (
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">
                        Title
                      </label>
                      <input
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="Name this material…"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0C60FC] focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={close}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-[11px] font-extrabold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!pickedFile || isUploading}
                    onClick={handleUpload}
                    className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2 text-[11px] font-extrabold text-white hover:bg-[#0C60FC] transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isUploading && <Loader2 className="h-3 w-3 animate-spin" />}
                    {isUploading ? "Uploading…" : "Upload & Select"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
