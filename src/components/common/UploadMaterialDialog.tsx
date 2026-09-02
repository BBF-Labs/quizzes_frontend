"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateLibraryMaterial } from "@/hooks/app/use-app-library";
import { useUploadFile } from "@/hooks/common/use-upload";
import { toast } from "sonner";
import { ALLOWED_MATERIAL_TYPES } from "@/components/common/MaterialPickerDialog";

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

interface UploadMaterialDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the new materialId on success (optional — can just rely on query invalidation). */
  onSuccess?: (materialId: string) => void;
}

export function UploadMaterialDialog({
  isOpen,
  onOpenChange,
  onSuccess,
}: UploadMaterialDialogProps) {
  const uploadFile = useUploadFile();
  const createMaterial = useCreateLibraryMaterial();

  const [dragOver, setDragOver] = useState(false);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [done, setDone] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setPickedFile(null);
    setPreviewUrl(null);
    setFileError(null);
    setTitle("");
    setIsUploading(false);
    setDone(false);
  }, []);

  const close = useCallback(() => {
    onOpenChange(false);
    setTimeout(reset, 250);
  }, [onOpenChange, reset]);

  const validateAndSet = useCallback((file: File) => {
    setFileError(null);
    if (!ALLOWED_MIMES.has(file.type)) {
      setFileError(
        `"${file.name}" isn't a supported format. Use PDF, DOCX, TXT, or an image (JPEG/PNG/WebP/GIF).`,
      );
      return;
    }
    setPickedFile(file);
    setTitle(file.name.replace(/\.[^.]+$/, ""));
    if (isImage(file.type)) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSet(file);
  };

  const handleUpload = async () => {
    if (!pickedFile) return;
    setIsUploading(true);
    try {
      const upload = await uploadFile.mutateAsync({ file: pickedFile });
      const material = await createMaterial.mutateAsync({
        uploadId: upload._id,
        title: title.trim() || pickedFile.name,
      });
      setDone(true);
      toast.success("Material added to your library.");
      onSuccess?.(material.id);
      setTimeout(close, 800);
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
        className="w-full max-w-110 rounded-[28px] bg-white border border-slate-200/90 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.22em] text-[#0C60FC]">
              My Library
            </p>
            <h2 className="text-base font-extrabold text-slate-900 mt-0.5">Add Material</h2>
          </div>
          <button
            onClick={close}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {done ? (
            // Success state
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <p className="text-sm font-extrabold text-slate-900">Uploaded!</p>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Processing will begin shortly.
              </p>
            </div>
          ) : (
            <>
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !pickedFile && fileInputRef.current?.click()}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all",
                  pickedFile ? "border-slate-200 bg-white p-4 cursor-default" : "cursor-pointer py-10 px-5",
                  dragOver
                    ? "border-[#0C60FC] bg-blue-50"
                    : pickedFile
                    ? "border-slate-200"
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
                    <p className="text-xs font-extrabold text-slate-800">
                      Drop a file or click to browse
                    </p>
                    <p className="text-[10.5px] text-slate-400 font-medium mt-1 text-center">
                      PDF, DOCX, TXT · JPEG, PNG, WebP, GIF
                      <br />
                      Max 50 MB
                    </p>
                  </>
                ) : (
                  <div className="flex items-center gap-4 w-full">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-20 w-20 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="flex h-20 w-16 flex-col items-center justify-center rounded-xl bg-slate-50 border border-slate-200 shrink-0">
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
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {formatBytes(pickedFile.size)}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setPickedFile(null);
                          setPreviewUrl(null);
                          setTitle("");
                        }}
                        className="mt-1.5 text-[10px] font-extrabold text-rose-500 hover:text-rose-700 transition"
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

              {/* Title */}
              {pickedFile && (
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">
                    Material title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. DCIT 305 – Lecture 4"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0C60FC] focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              )}

              {/* Supported formats note */}
              <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
                Supported: <span className="font-bold text-slate-600">PDF, DOCX, TXT</span> (text extraction) and{" "}
                <span className="font-bold text-slate-600">images</span> (OCR). PowerPoint, .doc, .rtf and other formats are not supported.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <div className="px-6 pb-6 flex items-center justify-end gap-2">
            <button
              onClick={close}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-[11px] font-extrabold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              disabled={!pickedFile || isUploading}
              onClick={handleUpload}
              className="flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-2.5 text-[11px] font-extrabold text-white hover:bg-[#0C60FC] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isUploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isUploading ? "Uploading…" : "Upload Material"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
