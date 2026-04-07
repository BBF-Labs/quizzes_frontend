"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  BookOpen,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  FileIcon,
  Globe,
  X,
  Tag,
} from "lucide-react";
import {
  useLibraryMaterials,
  useCreateLibraryMaterial,
  useDeleteLibraryMaterial,
  useGenerateFlashcards,
  useGenerateQuiz,
  useGenerateMindMap,
  useProcessLibraryMaterial,
} from "@/hooks/app/use-app-library";
import { useSubmitToLibrary } from "@/hooks/app/use-public-library";
import { useCourseSearch } from "@/hooks/common/use-courses";
import { useUploadFile } from "@/hooks/common/use-upload";
import { type MaterialSummary } from "@/types/session";
import { toast } from "sonner";

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
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
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
    "w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg border border-primary/30 bg-card shadow-xl overflow-y-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Globe className="size-3.5 text-primary" />
              <p className="text-[10px] font-mono uppercase tracking-widest text-primary">
                Share to Public Library
              </p>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground/60 max-w-xs truncate">
              {material.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground/40 hover:text-muted-foreground transition-colors mt-0.5"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1.5">
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
            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1.5">
              Description{" "}
              <span className="text-muted-foreground/30">(optional)</span>
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
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1.5">
                Subject{" "}
                <span className="text-muted-foreground/30">(optional)</span>
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
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1.5">
                Year{" "}
                <span className="text-muted-foreground/30">(optional)</span>
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
            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1.5">
              Course{" "}
              <span className="text-muted-foreground/30">(optional)</span>
            </label>
            {selectedCourse ? (
              <div className="flex items-center justify-between border border-primary/30 bg-primary/5 px-3 py-2">
                <span className="text-[12px] font-mono text-foreground">
                  {selectedCourse.code} · {selectedCourse.title}
                </span>
                <button
                  type="button"
                  onClick={() => { set("courseId", ""); set("courseSearch", ""); }}
                  className="text-muted-foreground/40 hover:text-muted-foreground ml-2"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground/40" />
                <input
                  value={form.courseSearch}
                  onChange={(e) => {
                    set("courseSearch", e.target.value);
                    setCoursePickerOpen(true);
                  }}
                  onFocus={() => setCoursePickerOpen(true)}
                  className={`${fieldCls} pl-8`}
                  placeholder="Search by course code or name…"
                />
                {coursePickerOpen && courses.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 border border-border/50 bg-card shadow-lg max-h-48 overflow-y-auto">
                    {courses.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => {
                          set("courseId", c._id);
                          set("courseSearch", `${c.code} · ${c.title}`);
                          setCoursePickerOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-[11px] font-mono hover:bg-primary/5 transition-colors border-b border-border/20 last:border-0"
                      >
                        <span className="text-primary/80">{c.code}</span>
                        <span className="text-muted-foreground ml-2">{c.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1.5">
              Tags{" "}
              <span className="text-muted-foreground/30">
                (comma-separated, optional)
              </span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground/40" />
              <input
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                className={`${fieldCls} pl-8`}
                placeholder="e.g. past paper, algorithms, year 3"
              />
            </div>
          </div>

          <p className="text-[10px] font-mono text-muted-foreground/40 leading-relaxed">
            Your submission will be reviewed before appearing in the public
            library. Do not submit copyrighted material you don&apos;t have rights
            to share.
          </p>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest border border-border/40 hover:bg-secondary/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submit.isPending}
              className="flex-1 px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {submit.isPending ? "Submitting…" : "Submit for Review"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const { data: materials = [], isLoading } = useLibraryMaterials();
  const createMaterial = useCreateLibraryMaterial();
  const deleteMaterial = useDeleteLibraryMaterial();
  const generateFlashcards = useGenerateFlashcards();
  const generateQuiz = useGenerateQuiz();
  const generateMindMap = useGenerateMindMap();
  const processMaterial = useProcessLibraryMaterial();
  const uploadFile = useUploadFile();

  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [submitTarget, setSubmitTarget] = useState<MaterialSummary | null>(null);

  const filteredMaterials = (materials || []).filter((m) =>
    (m.title || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const upload = await uploadFile.mutateAsync({ file });
      await createMaterial.mutateAsync({ uploadId: upload._id, title: file.name });
      toast.success("Material uploaded successfully");
    } catch {
      toast.error("Failed to upload material");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleGenerateFlashcards = async (materialId: string) => {
    try {
      await generateFlashcards.mutateAsync({ materialId });
      toast.success("Flashcard generation started in background");
    } catch {
      toast.error("Failed to start generation");
    }
  };

  const handleGenerateQuiz = async (materialId: string) => {
    try {
      await generateQuiz.mutateAsync({ materialId });
      toast.success("Quiz generation started in background");
    } catch {
      toast.error("Failed to start generation");
    }
  };

  const handleGenerateMindMap = async (materialId: string) => {
    try {
      await generateMindMap.mutateAsync({ materialId });
      toast.success("Mind Map generation started in background");
    } catch {
      toast.error("Failed to start generation");
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

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter leading-none mb-2">
            Library
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Manage your study materials and generate AI content.
          </p>
        </div>

        <label className="group relative flex items-center justify-center gap-2 bg-primary px-4 py-2 cursor-pointer hover:bg-primary/90 transition-all">
          <Plus className="size-4 text-primary-foreground" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-primary-foreground">
            {isUploading ? "Uploading..." : "Add Material"}
          </span>
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
        <input
          type="text"
          placeholder="Search materials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-card/30 border border-border/40 pl-10 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:border-primary/40 transition-all"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <RefreshCw className="size-8 text-primary animate-spin mb-4" />
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Loading library...
          </p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 border border-dashed border-border/40 bg-card/10">
          <BookOpen className="size-12 text-muted-foreground/20 mb-4" />
          <p className="text-sm font-mono text-muted-foreground">
            {searchQuery ? "No matches found" : "Your library is empty"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredMaterials.map((material) => (
              <motion.div
                key={material.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group flex flex-col border border-border/40 bg-card/30 hover:border-primary/40 hover:bg-primary/5 transition-all p-4"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 shrink-0 flex items-center justify-center bg-muted/50 border border-border/40">
                      <FileIcon className="size-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold truncate leading-tight mb-1">
                        {material.title}
                      </h3>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase truncate">
                        {material.mimeType} ·{" "}
                        {(material.size / (1024 * 1024)).toFixed(2)} MB
                        {material.courseCode && ` · ${material.courseCode}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMaterial.mutate(material.id)}
                    className="shrink-0 p-1.5 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
                    title="Delete material"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-3 border-t border-border/10 space-y-2">
                  {/* Status + process/generate row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {material.processingStatus === "ready" ? (
                        <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-500 uppercase tracking-tighter">
                          <CheckCircle2 className="size-2.5" />
                          Ready
                        </span>
                      ) : material.processingStatus === "failed" ? (
                        <span className="flex items-center gap-1 text-[9px] font-mono text-destructive uppercase tracking-tighter">
                          <AlertCircle className="size-2.5" />
                          Error
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[9px] font-mono text-amber-500 uppercase tracking-tighter animate-pulse">
                          <RefreshCw className="size-2.5 animate-spin" />
                          Processing
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {material.processingStatus !== "ready" &&
                      material.processingStatus !== "processing" ? (
                        <button
                          onClick={() => handleProcessMaterial(material.id)}
                          disabled={processMaterial.isPending}
                          className="inline-flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-primary hover:bg-primary/10 disabled:opacity-30 transition-colors"
                        >
                          <RefreshCw className="size-3" />
                          Process
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleGenerateFlashcards(material.id)}
                            disabled={material.processingStatus !== "ready"}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
                          >
                            <Sparkles className="size-3" />
                            Flashcards
                          </button>
                          <div className="w-px h-2 bg-border/40" />
                          <button
                            onClick={() => handleGenerateQuiz(material.id)}
                            disabled={material.processingStatus !== "ready"}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
                          >
                            <Sparkles className="size-3" />
                            Quiz
                          </button>
                          <div className="w-px h-2 bg-border/40" />
                          <button
                            onClick={() => handleGenerateMindMap(material.id)}
                            disabled={material.processingStatus !== "ready"}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
                          >
                            <Sparkles className="size-3" />
                            Mind Map
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Share to Library — only for ready materials */}
                  {material.processingStatus === "ready" && (
                    <button
                      onClick={() => setSubmitTarget(material)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 hover:text-primary hover:bg-primary/5 border border-border/20 hover:border-primary/20 transition-all"
                    >
                      <Globe className="size-3" />
                      Share to Public Library
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Submit Modal */}
      {submitTarget && (
        <SubmitToLibraryModal
          material={submitTarget}
          onClose={() => setSubmitTarget(null)}
        />
      )}
    </div>
  );
}
