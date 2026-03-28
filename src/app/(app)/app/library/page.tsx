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
} from "lucide-react";
import {
  useLibraryMaterials,
  useCreateLibraryMaterial,
  useDeleteLibraryMaterial,
  useGenerateFlashcards,
  useGenerateQuiz,
  useGenerateMindMap,
} from "@/hooks/app/use-app-library";
import { useUploadFile } from "@/hooks/common/use-upload";
import { toast } from "sonner";

export default function LibraryPage() {
  const { data: materials = [], isLoading } = useLibraryMaterials();
  const createMaterial = useCreateLibraryMaterial();
  const deleteMaterial = useDeleteLibraryMaterial();
  const generateFlashcards = useGenerateFlashcards();
  const generateQuiz = useGenerateQuiz();
  const generateMindMap = useGenerateMindMap();
  const uploadFile = useUploadFile();

  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const filteredMaterials = (materials || []).filter((m) =>
    (m.title || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const upload = await uploadFile.mutateAsync({ file });
      await createMaterial.mutateAsync({
        uploadId: upload._id,
        title: file.name,
      });
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

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter leading-none mb-2">
            Library
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Manage your study materials and generate AI content.
          </p>
        </div>

        <label className="group relative flex items-center justify-center gap-2 bg-primary px-4 py-2 cursor-pointer hover:bg-primary/90 transition-all rounded(--radius)">
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

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <RefreshCw className="size-8 text-primary animate-spin mb-4" />
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Loading library...
          </p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 border border-dashed border-border/40 rounded-(--radius) bg-card/10">
          <BookOpen className="size-12 text-muted-foreground/20 mb-4" />
          <p className="text-sm font-mono text-muted-foreground">
            {searchQuery ? "No matches found" : "Your library is empty"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 flex items-center justify-center bg-muted/50 border border-border/40">
                      <FileIcon className="size-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold truncate leading-tight mb-1">
                        {material.title.length > 35
                          ? material.title.slice(0, 35) + "..."
                          : material.title}
                      </h3>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">
                        {material.mimeType} •{" "}
                        {(material.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMaterial.mutate(material.id)}
                    className="p-1.5 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all rounded-sm"
                    title="Delete material"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/10">
                  <div className="flex items-center gap-1.5">
                    {material.processingStatus === "ready" ? (
                      <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-500 uppercase tracking-tighter">
                        <CheckCircle2 className="size-2.5" />
                        Ready
                      </div>
                    ) : material.processingStatus === "failed" ? (
                      <div className="flex items-center gap-1 text-[9px] font-mono text-destructive uppercase tracking-tighter">
                        <AlertCircle className="size-2.5" />
                        Error
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[9px] font-mono text-amber-500 uppercase tracking-tighter animate-pulse">
                        <RefreshCw className="size-2.5 animate-spin" />
                        Processing
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleGenerateFlashcards(material.id)}
                      disabled={material.processingStatus !== "ready"}
                      className="inline-flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
                    >
                      <Sparkles className="size-3" />
                      Flashcards
                    </button>
                    <div className="w-px h-2 bg-border/40" />
                    <button
                      onClick={() => handleGenerateQuiz(material.id)}
                      disabled={material.processingStatus !== "ready"}
                      className="inline-flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
                    >
                      <Sparkles className="size-3" />
                      Quiz
                    </button>
                    <div className="w-px h-2 bg-border/40" />
                    <button
                      onClick={() => handleGenerateMindMap(material.id)}
                      disabled={material.processingStatus !== "ready"}
                      className="inline-flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
                    >
                      <Sparkles className="size-3" />
                      Mind Map
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
