"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Plus,
  Trash2,
  BookOpen,
  Layers,
  ListChecks,
  Network,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Globe,
  X,
  Tag,
  Import,
  Loader2,
  FileText,
} from "lucide-react";
import {
  useLibraryMaterials,
  useDeleteLibraryMaterial,
  useGenerateFlashcards,
  useGenerateQuiz,
  useGenerateMindMap,
  useProcessLibraryMaterial,
} from "@/hooks/app/use-app-library";
import { useSubmitToLibrary } from "@/hooks/app/use-public-library";
import { useCourseSearch } from "@/hooks/common/use-courses";
import { type MaterialSummary } from "@/types/session";
import { toast } from "sonner";
import { UploadMaterialDialog } from "@/components/common/UploadMaterialDialog";

// ─── MIME helpers (mirrors src/app/library/page.tsx) ─────────────────────────

function cleanTitle(raw: string) {
  return raw.replace(/\.(pdf|docx?|pptx?|txt|xlsx?|csv|zip)$/i, "").trim();
}

function mimeInfo(mime = "") {
  if (mime.includes("pdf"))
    return {
      label: "PDF",
      icon: FileText,
      bg: "bg-rose-50",
      text: "text-rose-700",
      lineBg: "bg-rose-200/50",
      ring: "ring-rose-200",
      previewBg: "bg-rose-50",
      accent: "text-rose-500",
    };
  if (
    mime.includes("word") ||
    mime.includes("docx") ||
    mime.includes("document")
  )
    return {
      label: "DOCX",
      icon: FileText,
      bg: "bg-blue-50",
      text: "text-blue-700",
      lineBg: "bg-blue-200/50",
      ring: "ring-blue-200",
      previewBg: "bg-blue-50",
      accent: "text-blue-500",
    };
  if (
    mime.includes("presentation") ||
    mime.includes("pptx") ||
    mime.includes("powerpoint")
  )
    return {
      label: "PPTX",
      icon: FileText,
      bg: "bg-orange-50",
      text: "text-orange-700",
      lineBg: "bg-orange-200/50",
      ring: "ring-orange-200",
      previewBg: "bg-orange-50",
      accent: "text-orange-500",
    };
  if (mime.includes("sheet") || mime.includes("xlsx") || mime.includes("csv"))
    return {
      label: "XLSX",
      icon: FileText,
      bg: "bg-green-50",
      text: "text-green-700",
      lineBg: "bg-green-200/50",
      ring: "ring-green-200",
      previewBg: "bg-green-50",
      accent: "text-green-500",
    };
  return {
    label: "FILE",
    icon: FileText,
    bg: "bg-violet-50",
    text: "text-violet-700",
    lineBg: "bg-violet-200/50",
    ring: "ring-violet-200",
    previewBg: "bg-violet-50",
    accent: "text-violet-500",
  };
}

function formatBytes(bytes: number) {
  if (!bytes) return "—";
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Submit to Library Modal ──────────────────────────────────────────────────

interface SubmitForm {
  title: string;
  description: string;
  subject: string;
  year: string;
  tags: string;
  courseId: string;
  courseSearch: string;
}

function SubmitToLibraryModal({
  material,
  onClose,
}: {
  material: MaterialSummary;
  onClose: () => void;
}) {
  const submit = useSubmitToLibrary();
  const [form, setForm] = useState<SubmitForm>({
    title: material.title,
    description: "",
    subject: material.courseTitle ?? "",
    year: "",
    tags: "",
    courseId: "",
    courseSearch: material.courseCode ?? material.courseTitle ?? "",
  });

  const { data: courses = [] } = useCourseSearch(form.courseSearch);
  const [coursePickerOpen, setCoursePickerOpen] = useState(false);
  const selectedCourse = courses.find((c) => c._id === form.courseId);

  const set = (k: keyof SubmitForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submit.mutateAsync({
        materialId: material.id,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        subject: form.subject.trim() || undefined,
        year: form.year ? Number(form.year) : undefined,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        courseId: form.courseId || undefined,
      });
      toast.success("Submitted for review. We'll publish it shortly.");
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Submission failed";
      toast.error(msg);
    }
  };

  const fieldCls =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#0C60FC]" />
              <p className="text-[10px] font-extrabold uppercase tracking-[.22em] text-[#0C60FC]">
                Share to Public Library
              </p>
            </div>
            <p className="truncate text-[11px] font-semibold text-slate-500 max-w-xs">
              {material.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 text-slate-400 transition hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              Title *
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={fieldCls}
              placeholder="e.g. DCIT 305 – Data Structures Past Questions"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              Description <span className="text-slate-300">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              className={`${fieldCls} resize-none`}
              placeholder="Brief description of what this material covers…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Subject */}
            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                Subject <span className="text-slate-300">(optional)</span>
              </label>
              <input
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
                className={fieldCls}
                placeholder="e.g. Data Structures"
              />
            </div>

            {/* Year */}
            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                Year <span className="text-slate-300">(optional)</span>
              </label>
              <input
                type="number"
                min={2000}
                max={new Date().getFullYear()}
                value={form.year}
                onChange={(e) => set("year", e.target.value)}
                className={fieldCls}
                placeholder={String(new Date().getFullYear())}
              />
            </div>
          </div>

          {/* Course search */}
          <div className="relative">
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              Course <span className="text-slate-300">(optional)</span>
            </label>
            {selectedCourse ? (
              <div className="flex items-center justify-between rounded-xl border border-[#0C60FC]/30 bg-blue-50 px-3 py-2.5">
                <span className="text-[12px] font-bold text-slate-900">
                  {selectedCourse.code} · {selectedCourse.title}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    set("courseId", "");
                    set("courseSearch", "");
                  }}
                  className="ml-2 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={form.courseSearch}
                  onChange={(e) => {
                    set("courseSearch", e.target.value);
                    setCoursePickerOpen(true);
                  }}
                  onFocus={() => setCoursePickerOpen(true)}
                  className={`${fieldCls} pl-9`}
                  placeholder="Search by course code or name…"
                />
                {coursePickerOpen && courses.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                    {courses.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => {
                          set("courseId", c._id);
                          set("courseSearch", `${c.code} · ${c.title}`);
                          setCoursePickerOpen(false);
                        }}
                        className="w-full border-b border-slate-100 px-3 py-2 text-left text-[12px] font-semibold transition last:border-0 hover:bg-slate-50"
                      >
                        <span className="font-bold text-[#0C60FC]">
                          {c.code}
                        </span>
                        <span className="ml-2 text-slate-600">{c.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              Tags{" "}
              <span className="text-slate-300">
                (comma-separated, optional)
              </span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                className={`${fieldCls} pl-9`}
                placeholder="e.g. past paper, algorithms, year 3"
              />
            </div>
          </div>

          <p className="text-[10px] leading-relaxed text-slate-400">
            Your submission will be reviewed before appearing in the public
            library. Do not submit copyrighted material you don&apos;t have
            rights to share.
          </p>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submit.isPending}
              className="flex-1 rounded-xl bg-slate-950 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-white transition hover:bg-[#0C60FC] disabled:opacity-50"
            >
              {submit.isPending ? "Submitting…" : "Submit for Review"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Status Pill ──────────────────────────────────────────────────────────────

function StatusPill({
  status,
  processingStatus,
  libraryStatus,
  isImported,
}: {
  status?: string;
  processingStatus: MaterialSummary["processingStatus"];
  libraryStatus?: MaterialSummary["libraryStatus"];
  isImported?: boolean;
}) {
  const pills: { label: string; cls: string; key: string }[] = [];

  if (processingStatus === "ready") {
    pills.push({
      key: "ready",
      label: "Ready",
      cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    });
  } else if (processingStatus === "failed") {
    pills.push({
      key: "failed",
      label: "Failed",
      cls: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    });
  } else if (
    processingStatus === "processing" ||
    processingStatus === "pending"
  ) {
    pills.push({
      key: "processing",
      label: processingStatus === "pending" ? "Queued" : "Processing",
      cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    });
  }

  if (libraryStatus === "published") {
    pills.push({
      key: "published",
      label: "Published",
      cls: "bg-blue-50 text-[#0C60FC] ring-1 ring-blue-200",
    });
  } else if (libraryStatus === "pending_review") {
    pills.push({
      key: "review",
      label: "In review",
      cls: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    });
  } else if (libraryStatus === "rejected") {
    pills.push({
      key: "rejected",
      label: "Rejected",
      cls: "bg-rose-50 text-rose-600 ring-1 ring-rose-200 line-through opacity-70",
    });
  }

  if (isImported) {
    pills.push({
      key: "imported",
      label: "Imported",
      cls: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    });
  }

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {pills.map((p) => (
        <span
          key={p.key}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${p.cls}`}
        >
          {p.key === "ready" && <CheckCircle2 className="h-3 w-3" />}
          {p.key === "failed" && <AlertCircle className="h-3 w-3" />}
          {p.key === "processing" && (
            <RefreshCw className="h-3 w-3 animate-spin" />
          )}
          {p.key === "published" && <Globe className="h-3 w-3" />}
          {p.key === "review" && <Globe className="h-3 w-3" />}
          {p.key === "rejected" && <Globe className="h-3 w-3" />}
          {p.key === "imported" && <Import className="h-3 w-3" />}
          {p.label}
        </span>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "ready" | "processing" | "failed";

export default function LibraryPage() {
  const { data: materials = [], isLoading } = useLibraryMaterials();
  const deleteMaterial = useDeleteLibraryMaterial();
  const generateFlashcards = useGenerateFlashcards();
  const generateQuiz = useGenerateQuiz();
  const generateMindMap = useGenerateMindMap();
  const processMaterial = useProcessLibraryMaterial();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [submitTarget, setSubmitTarget] = useState<MaterialSummary | null>(
    null,
  );

  // Counts for the stat strip and filter chips
  const counts = useMemo(() => {
    const list = materials ?? [];
    return {
      total: list.length,
      ready: list.filter((m) => m.processingStatus === "ready").length,
      processing: list.filter(
        (m) =>
          m.processingStatus === "processing" ||
          m.processingStatus === "pending",
      ).length,
      failed: list.filter((m) => m.processingStatus === "failed").length,
    };
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    const list = materials ?? [];
    const q = searchQuery.trim().toLowerCase();
    return list.filter((m) => {
      if (statusFilter === "ready" && m.processingStatus !== "ready")
        return false;
      if (
        statusFilter === "processing" &&
        m.processingStatus !== "processing" &&
        m.processingStatus !== "pending"
      )
        return false;
      if (statusFilter === "failed" && m.processingStatus !== "failed")
        return false;
      if (
        q &&
        !(m.title || "").toLowerCase().includes(q) &&
        !(m.courseCode || "").toLowerCase().includes(q) &&
        !(m.courseTitle || "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [materials, searchQuery, statusFilter]);

  const handleGenerateFlashcards = async (materialId: string) => {
    try {
      await generateFlashcards.mutateAsync({ materialId });
      toast.success("Flashcard generation started in background");
    } catch (err: any) {
      if (err?.response?.status === 402) {
        toast.error(
          "Daily flashcard limit reached. Upgrade your plan or use credits.",
        );
      } else {
        toast.error("Failed to start generation");
      }
    }
  };

  const handleGenerateQuiz = async (materialId: string) => {
    try {
      await generateQuiz.mutateAsync({ materialId });
      toast.success("Quiz generation started in background");
    } catch (err: any) {
      if (err?.response?.status === 402) {
        toast.error(
          "Daily quiz limit reached. Upgrade your plan or use credits.",
        );
      } else {
        toast.error("Failed to start generation");
      }
    }
  };

  const handleGenerateMindMap = async (materialId: string) => {
    try {
      await generateMindMap.mutateAsync({ materialId });
      toast.success("Mind Map generation started in background");
    } catch (err: any) {
      if (err?.response?.status === 402) {
        toast.error(
          "Daily mind map limit reached. Upgrade your plan or use credits.",
        );
      } else {
        toast.error("Failed to start generation");
      }
    }
  };

  const handleProcessMaterial = async (materialId: string) => {
    try {
      await processMaterial.mutateAsync(materialId);
      toast.success("Material added to processing queue");
    } catch {
      toast.error("Failed to start processing");
    }
  };

  const handleDeleteMaterial = async (material: MaterialSummary) => {
    if (
      !window.confirm(
        `Delete "${material.title}"? This also removes its generated quizzes, flashcards and mind maps.`,
      )
    )
      return;
    try {
      await deleteMaterial.mutateAsync(material.id);
      toast.success("Material deleted");
    } catch {
      toast.error("Failed to delete material");
    }
  };

  return (
    <div className="qz-app min-h-full bg-[#F7F9FC] text-slate-900 antialiased">
      {/* Header / Hero (mirrors the public library page shape) */}
      <header className="border-b border-slate-200 bg-white px-6 pt-8 pb-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#0C60FC]">
              My Library
            </p>
            <h1 className="display mt-2 text-3xl font-bold leading-tight sm:text-4xl">
              Your study materials.
            </h1>
            <p className="hand mt-1 text-xl text-[#0C60FC]">
              upload, generate & share ✦
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1.5">
              {counts.total} total
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
              {counts.ready} ready
            </span>
            {counts.processing > 0 && (
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                {counts.processing} processing
              </span>
            )}
            {counts.failed > 0 && (
              <span className="rounded-full bg-rose-50 px-3 py-1.5 text-rose-700">
                {counts.failed} failed
              </span>
            )}
          </div>
        </div>

        {/* Search + Upload row */}
        <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-3xl flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, course code or name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <button
            onClick={() => setIsUploadDialogOpen(true)}
            className="squishy group inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0C60FC]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Material</span>
          </button>
        </div>

        {/* Status filter chips */}
        <div className="mx-auto mt-5 flex max-w-7xl flex-wrap gap-2">
          {[
            { id: "all" as const, label: "All", count: counts.total },
            { id: "ready" as const, label: "Ready", count: counts.ready },
            {
              id: "processing" as const,
              label: "Processing",
              count: counts.processing,
            },
            { id: "failed" as const, label: "Failed", count: counts.failed },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                statusFilter === tab.id
                  ? "bg-slate-950 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${
                  statusFilter === tab.id
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* Grid */}
      <section className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#0C60FC]" />
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                Loading your library…
              </p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20">
              <BookOpen className="mb-4 h-12 w-12 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">
                {searchQuery || statusFilter !== "all"
                  ? "No matches found"
                  : "Your library is empty"}
              </p>
              <p className="mt-1 max-w-sm text-center text-xs font-semibold text-slate-500">
                {searchQuery || statusFilter !== "all"
                  ? "Try a different search or filter."
                  : "Upload a PDF, DOCX, PPTX or spreadsheet to start generating flashcards, quizzes and mind maps."}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <button
                  type="button"
                  onClick={() => setIsUploadDialogOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-[#0C60FC]"
                >
                  <Plus className="h-4 w-4" />
                  Upload your first material
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredMaterials.map((material) => {
                  const info = mimeInfo(material.mimeType);
                  const isReady = material.processingStatus === "ready";
                  const canGenerate =
                    isReady &&
                    !generateFlashcards.isPending &&
                    !generateQuiz.isPending &&
                    !generateMindMap.isPending;
                  const canShare =
                    isReady &&
                    !material.isImported &&
                    (!material.libraryStatus ||
                      material.libraryStatus === "rejected");
                  const TitleIcon = info.icon;

                  return (
                    <motion.article
                      key={material.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="play-card flex flex-col rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm min-w-0"
                      style={{ borderRadius: "26px" }}
                    >
                      {/* Top row: MIME badge + delete */}
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold ${info.bg} ${info.text}`}
                        >
                          <TitleIcon className="h-3 w-3 shrink-0" strokeWidth={2.25} />
                          {info.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteMaterial(material)}
                          disabled={deleteMaterial.isPending}
                          className="rounded-xl p-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                          title="Delete material"
                          aria-label="Delete material"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Title + meta */}
                      <h3 className="mt-4 truncate text-base font-bold text-slate-900" title={cleanTitle(material.title)}>
                        {cleanTitle(material.title)}
                      </h3>
                      <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                        {[
                          material.courseCode,
                          formatBytes(material.size),
                          format(new Date(material.createdAt), "MMM d"),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>

                      {/* Preview block */}
                      <div className={`mt-4 rounded-xl ${info.previewBg} p-3`}>
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ${info.ring} ${info.text}`}
                          >
                            <TitleIcon
                              className="h-4 w-4"
                              strokeWidth={2.25}
                              aria-hidden="true"
                            />
                          </span>
                          <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
                            <div
                              className={`h-2 w-full rounded-full ${info.lineBg}`}
                            />
                            <div
                              className={`h-2 w-10/12 rounded-full ${info.lineBg} opacity-75`}
                            />
                            <div
                              className={`h-2 w-7/12 rounded-full ${info.lineBg} opacity-50`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Status pills */}
                      <div className="mt-4">
                        <StatusPill
                          processingStatus={material.processingStatus}
                          libraryStatus={material.libraryStatus}
                          isImported={material.isImported}
                        />
                      </div>

                      {/* Actions */}
                      <div className="mt-auto pt-5">
                        {!isReady ? (
                          <button
                            type="button"
                            onClick={() => handleProcessMaterial(material.id)}
                            disabled={
                              processMaterial.isPending ||
                              material.processingStatus === "processing" ||
                              material.processingStatus === "pending"
                            }
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#0C60FC] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <RefreshCw
                              className={`h-3.5 w-3.5 ${
                                material.processingStatus === "processing" ||
                                material.processingStatus === "pending"
                                  ? "animate-spin"
                                  : ""
                              }`}
                            />
                            {material.processingStatus === "failed"
                              ? "Retry processing"
                              : material.processingStatus === "processing" ||
                                  material.processingStatus === "pending"
                                ? "Processing…"
                                : "Process material"}
                          </button>
                        ) : (
                          <>
                            <div className="grid grid-cols-3 gap-2 min-w-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handleGenerateFlashcards(material.id)
                                }
                                disabled={!canGenerate}
                                className="inline-flex h-9 min-w-0 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 transition hover:border-[#0C60FC]/40 hover:bg-blue-50 hover:text-[#0C60FC] disabled:cursor-not-allowed disabled:opacity-40"
                                title="Generate flashcards"
                              >
                                <Layers className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                                <span className="truncate">Cards</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleGenerateQuiz(material.id)}
                                disabled={!canGenerate}
                                className="inline-flex h-9 min-w-0 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 transition hover:border-[#0C60FC]/40 hover:bg-blue-50 hover:text-[#0C60FC] disabled:cursor-not-allowed disabled:opacity-40"
                                title="Generate quiz"
                              >
                                <ListChecks className="h-3.5 w-3.5 shrink-0 text-[#0C60FC]" />
                                <span className="truncate">Quiz</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleGenerateMindMap(material.id)
                                }
                                disabled={!canGenerate}
                                className="inline-flex h-9 min-w-0 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 transition hover:border-[#0C60FC]/40 hover:bg-blue-50 hover:text-[#0C60FC] disabled:cursor-not-allowed disabled:opacity-40"
                                title="Generate mind map"
                              >
                                <Network className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                <span className="truncate">Map</span>
                              </button>
                            </div>
                            {canShare && (
                              <button
                                type="button"
                                onClick={() => setSubmitTarget(material)}
                                className="mt-2 flex h-8 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 px-3 text-[11px] font-bold text-slate-500 transition hover:border-[#0C60FC]/40 hover:bg-blue-50/50 hover:text-[#0C60FC]"
                              >
                                <Globe className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">Share to Public Library</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* Submit Modal */}
      {submitTarget && (
        <SubmitToLibraryModal
          material={submitTarget}
          onClose={() => setSubmitTarget(null)}
        />
      )}

      {/* Upload Material Dialog with Preview & Type Guard */}
      <UploadMaterialDialog
        isOpen={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
      />
    </div>
  );
}
