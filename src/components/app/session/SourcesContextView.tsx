"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Upload,
  FolderPlus,
  FileText,
  Calendar,
  Target,
  Languages,
  Sparkles,
  ArrowRight,
  Loader2,
  X,
  CheckCircle2,
  BookOpen,
  Layers,
  ListChecks,
  Compass,
  FileSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppMaterials, useAddAppMaterial } from "@/hooks/app/use-app-actions";
import { useLibraryMaterials } from "@/hooks/app/use-app-library";
import { queryKeys } from "@/lib/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/session";
import { toast } from "sonner";
import { ExercisesModal } from "./ExercisesModal";
import type { IAppMaterial } from "@/types/session";

interface SourcesContextViewProps {
  sessionId: string;
}

/* Dedicated crisp PDF icon badge */
function PdfIconBadge({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center justify-center shrink-0", className)}>
      <svg viewBox="0 0 20 24" fill="none" className="h-5 w-4.5 drop-shadow-2xs">
        <path
          d="M3 0C1.34315 0 0 1.34315 0 3V21C0 22.6569 1.34315 24 3 24H17C18.6569 24 20 22.6569 20 21V6L14 0H3Z"
          fill="#FF4B4B"
        />
        <path d="M14 0L20 6H14V0Z" fill="#D92D20" />
        <rect x="2.5" y="10" width="15" height="10" rx="1.5" fill="#D92D20" fillOpacity="0.8" />
        <text
          x="10"
          y="17"
          fill="white"
          fontSize="6.5"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
        >
          PDF
        </text>
      </svg>
    </div>
  );
}

export function SourcesContextView({ sessionId }: SourcesContextViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: materials = [], isLoading } = useAppMaterials(sessionId);
  const { data: libraryMaterials = [] } = useLibraryMaterials();
  const addMaterialMutation = useAddAppMaterial(sessionId);

  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedGoal, setSelectedGoal] = useState("Getting top grades only");
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);

  // Drawer states
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [drawerMode, setDrawerMode] = useState<"summary" | "blocks">("summary");
  const [blocksFilter, setBlocksFilter] = useState<"all" | "active">("all");
  const [blocksSearch, setBlocksSearch] = useState("");
  const [isExercisesModalOpen, setIsExercisesModalOpen] = useState(false);

  const uploadFile = useCallback(
    (file: File) => {
      return new Promise<void>((resolve, reject) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          `${process.env.NEXT_PUBLIC_API_URL || ""}/app/${sessionId}/materials`
        );

        const token = getAccessToken();
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        xhr.onload = () => {
          setIsUploading(false);
          if (xhr.status >= 200 && xhr.status < 300) {
            queryClient.invalidateQueries({
              queryKey: queryKeys.app.materials(sessionId),
            });
            queryClient.invalidateQueries({
              queryKey: queryKeys.app.detail(sessionId),
            });
            toast.success(`"${file.name}" uploaded to session`);
            resolve();
          } else {
            toast.error("Upload failed");
            reject(new Error("Upload failed"));
          }
        };

        xhr.onerror = () => {
          setIsUploading(false);
          toast.error("Network error during upload");
          reject(new Error("Network error"));
        };

        xhr.send(formData);
      });
    },
    [sessionId, queryClient]
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file);
  };

  const handleAttachFromLibrary = async () => {
    if (!selectedLibraryId) return;
    try {
      await addMaterialMutation.mutateAsync(selectedLibraryId);
      toast.success("Material attached to this session");
      setIsLibraryModalOpen(false);
      setSelectedLibraryId(null);
    } catch {
      toast.error("Failed to attach material from library");
    }
  };

  const filteredMaterials = (materials || []).filter((m) =>
    (m.filename || m.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedMaterial: IAppMaterial | undefined = (materials || []).find(
    (m) => m.id === selectedDocId
  );

  const summary = selectedMaterial?.summary;
  const knowledgeBlocks = summary?.knowledgeBlocks || [];
  const filteredBlocks = knowledgeBlocks.filter((b) => {
    if (blocksFilter === "active" && b.isActive === false) return false;
    if (blocksSearch.trim().length > 0) {
      const q = blocksSearch.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.summary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Available library items not yet attached to this session
  const existingMaterialIds = new Set((materials || []).map((m) => m.id));
  const availableLibraryItems = (libraryMaterials || []).filter(
    (item) => !existingMaterialIds.has(item.id)
  );

  return (
    <div className="w-full h-full px-8 py-6 antialiased flex flex-col min-h-0 bg-[#FDFCFB]">
      <div className="flex-1 flex gap-8 min-h-0 w-full overflow-hidden">
        {/* ─── Left Canvas: Sources List ───────────────────────────────────── */}
        <div
          className={cn(
            "flex flex-col min-h-0 space-y-4 transition-all duration-200 overflow-y-auto scrollbar-none",
            selectedDocId ? "flex-1 shrink-0" : "w-full"
          )}
        >
          {/* Top Title & Filters */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif font-bold text-slate-950">
                Session Sources
              </h1>
              <span className="text-xs text-slate-400 font-mono">
                ({materials.length} attached)
              </span>
            </div>

            {/* Filter Tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
                <Calendar className="h-3 w-3 text-slate-400" />
                <span>Active Session Context</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
                <Target className="h-3 w-3 text-slate-400" />
                <span>{selectedGoal}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
                <Languages className="h-3 w-3 text-slate-400" />
                <span>{selectedLanguage}</span>
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between gap-4 pt-1 w-full">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search attached sources..."
                className="w-full rounded-full bg-slate-50/50 border border-slate-200/90 pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-hidden focus:border-[#0C60FC] focus:bg-white shadow-2xs"
              />
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLibraryModalOpen(true)}
                className="rounded-full bg-white hover:bg-slate-100/90 border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                title="Attach materials from your library"
              >
                <FolderPlus className="h-3.5 w-3.5 text-slate-500" />
                <span>Add from Library</span>
              </button>

              <label className="rounded-full bg-black hover:bg-slate-850 px-4 py-1.5 text-xs font-bold text-white shadow-2xs cursor-pointer flex items-center gap-1.5 transition">
                {isUploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                <span>Upload sources</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.pptx,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Materials Table or Empty State */}
          {materials.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-12 text-center space-y-4 my-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mx-auto">
                <BookOpen className="h-7 w-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-bold text-slate-900 text-base">
                  No sources attached to this session
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Attach lecture notes, slides, or PDFs from your library, or upload directly from your device to anchor Z's explanations in your curriculum.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLibraryModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 shadow-2xs transition cursor-pointer"
                >
                  <FolderPlus className="h-3.5 w-3.5 text-slate-600" />
                  <span>Choose from Library</span>
                </button>

                <label className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer transition">
                  {isUploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  <span>Upload Document</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.pptx,.txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 w-full">
              {/* Table Header */}
              <div className="flex items-center justify-between px-3 pt-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-full">
                <span className={cn(!selectedDocId ? "w-2/5" : "flex-1")}>Name</span>
                {!selectedDocId && (
                  <>
                    <span className="w-1/6">Status</span>
                    <span className="w-1/6">Type</span>
                    <span className="w-1/6">Size</span>
                    <span className="w-1/6 text-right">Action</span>
                  </>
                )}
              </div>

              {/* Table Rows */}
              {filteredMaterials.map((mat) => {
                const fileName = mat.filename || mat.title || "Document.pdf";
                const isSelected = selectedDocId === mat.id;
                const isReady = mat.processingStatus === "ready";
                const sizeStr =
                  mat.size > 0
                    ? `${(mat.size / (1024 * 1024)).toFixed(1)} MB`
                    : "—";

                return (
                  <div
                    key={mat.id}
                    onClick={() => {
                      setSelectedDocId(mat.id);
                      setDrawerMode("summary");
                    }}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-2xl transition-all duration-150 cursor-pointer group w-full border",
                      isSelected
                        ? "bg-[#EAE7DF] border-slate-300/90 shadow-xs"
                        : "bg-white/60 hover:bg-[#F2EFE8] hover:border-slate-300/80 hover:shadow-xs border-slate-100/80"
                    )}
                  >
                    {/* Left: PDF Icon + File name */}
                    <div className={cn("flex items-center gap-2.5 min-w-0 pr-3", !selectedDocId ? "w-2/5" : "flex-1")}>
                      <span className="text-slate-300 group-hover:text-slate-600 text-xs">
                        ⋮
                      </span>
                      <PdfIconBadge />
                      <span className="text-xs font-semibold text-slate-950 truncate group-hover:text-[#0C60FC] transition">
                        {fileName}
                      </span>
                    </div>

                    {!selectedDocId && (
                      <>
                        {/* Status */}
                        <div className="w-1/6">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold",
                              isReady
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                isReady ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                              )}
                            />
                            <span className="capitalize">{mat.processingStatus || "ready"}</span>
                          </span>
                        </div>

                        {/* Type */}
                        <div className="w-1/6">
                          <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium">
                            <span>{mat.type?.toUpperCase() || "PDF"}</span>
                          </span>
                        </div>

                        {/* Size */}
                        <div className="w-1/6">
                          <span className="text-xs text-slate-400 font-mono">{sizeStr}</span>
                        </div>

                        {/* Right Actions */}
                        <div className="w-1/6 flex items-center justify-end gap-2.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsExercisesModalOpen(true);
                            }}
                            className="flex items-center justify-center p-1.5 rounded-lg hover:bg-white transition"
                            title="Generate custom exercises"
                          >
                            <div className="grid grid-cols-2 gap-0.5 h-3.5 w-3.5">
                              <div className="h-1.5 w-1.5 rounded-xs bg-[#FF5722]" />
                              <div className="h-1.5 w-1.5 rounded-xs bg-[#3B82F6]" />
                              <div className="h-1.5 w-1.5 rounded-xs bg-[#F59E0B]" />
                              <div className="h-1.5 w-1.5 rounded-xs bg-[#10B981]" />
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/study-session/${sessionId}/session`);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200/90 hover:bg-slate-950 hover:text-white px-3.5 py-1 text-xs font-bold text-slate-800 transition shadow-2xs"
                          >
                            <span>Learn</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Right Side Document Drawer ─────────────────────────────────── */}
        <AnimatePresence>
          {selectedDocId && selectedMaterial && (
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-1/2 shrink-0 min-w-0 h-[calc(100vh-80px)] rounded-[30px] border border-slate-200/90 bg-white shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Panel Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-2 min-w-0">
                  <PdfIconBadge />
                  <h2 className="text-xs sm:text-sm font-bold text-slate-950 truncate">
                    {selectedMaterial.filename || selectedMaterial.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExercisesModalOpen(true)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Exercises
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDocId(null)}
                    className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Tab Switcher: Overview vs Knowledge Blocks */}
              <div className="px-6 pt-3 pb-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setDrawerMode("summary")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition",
                    drawerMode === "summary"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-200/70"
                  )}
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Overview & Pillars</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDrawerMode("blocks")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition",
                    drawerMode === "blocks"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-200/70"
                  )}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Knowledge Blocks ({knowledgeBlocks.length})</span>
                </button>
              </div>

              {/* Panel Body */}
              <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-7 space-y-6 scrollbar-thin">
                {drawerMode === "summary" ? (
                  <div className="space-y-6">
                    {/* Status badge */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Attached to active learning session</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {selectedMaterial.pageCount ? `${selectedMaterial.pageCount} pages` : ""}{" "}
                        {selectedMaterial.wordCount ? `• ${selectedMaterial.wordCount.toLocaleString()} words` : ""}
                      </span>
                    </div>

                    {/* Overview */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Document Summary
                      </h3>
                      {summary?.overview ? (
                        <p className="text-slate-700 text-xs sm:text-[13px] leading-relaxed font-sans bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
                          {summary.overview}
                        </p>
                      ) : (
                        <p className="text-slate-400 text-xs italic bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200">
                          Summary extraction will appear once material processing is complete.
                        </p>
                      )}
                    </div>

                    {/* Logical Overview Pillars */}
                    {summary?.logicalOverview && summary.logicalOverview.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Logical Pillars & Core Themes
                        </h3>
                        <div className="space-y-2.5">
                          {summary.logicalOverview.map((pillar, idx) => (
                            <div
                              key={idx}
                              className="rounded-2xl border border-slate-200/80 bg-white p-3.5 space-y-2 shadow-2xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-bold text-indigo-600">
                                  {pillar.pillarNumber || idx + 1}
                                </span>
                                <h4 className="text-xs font-bold text-slate-900">
                                  {pillar.title}
                                </h4>
                              </div>
                              {pillar.topics && pillar.topics.length > 0 && (
                                <div className="flex flex-wrap gap-1 pl-7">
                                  {pillar.topics.map((topic, tIdx) => (
                                    <span
                                      key={tIdx}
                                      className="rounded-md bg-slate-50 border border-slate-200/70 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                                    >
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Topic Deep Dives */}
                    {summary?.topicDeepDives && summary.topicDeepDives.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Topic Deep Dives
                        </h3>
                        <div className="space-y-2">
                          {summary.topicDeepDives.map((deepDive, idx) => (
                            <div
                              key={idx}
                              className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1"
                            >
                              <h4 className="text-xs font-bold text-slate-900">
                                {deepDive.title}
                              </h4>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {deepDive.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-xs font-bold text-slate-900">Next Actions</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/study-session/${sessionId}/session`)}
                          className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                          <span>Ask Z about this document</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ─── Knowledge Blocks View ─── */
                  <div className="space-y-4">
                    {/* Filter & Search Toolbar */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full">
                        <button
                          type="button"
                          onClick={() => setBlocksFilter("all")}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[11px] font-bold transition",
                            blocksFilter === "all"
                              ? "bg-white text-slate-900 shadow-2xs"
                              : "text-slate-600"
                          )}
                        >
                          All ({knowledgeBlocks.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setBlocksFilter("active")}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[11px] font-bold transition",
                            blocksFilter === "active"
                              ? "bg-white text-slate-900 shadow-2xs"
                              : "text-slate-600"
                          )}
                        >
                          Active
                        </button>
                      </div>

                      <div className="relative flex-1 max-w-[180px]">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                        <input
                          type="text"
                          value={blocksSearch}
                          onChange={(e) => setBlocksSearch(e.target.value)}
                          placeholder="Search blocks..."
                          className="w-full rounded-full bg-slate-50 border border-slate-200 pl-7 pr-3 py-1 text-xs text-slate-900 placeholder:text-slate-400 outline-hidden focus:bg-white"
                        />
                      </div>
                    </div>

                    {filteredBlocks.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-1.5 bg-slate-50/50">
                        <FileSearch className="h-6 w-6 text-slate-300 mx-auto" />
                        <p className="text-xs font-semibold text-slate-600">
                          No knowledge blocks found
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {knowledgeBlocks.length === 0
                            ? "Knowledge blocks will appear here once the document is processed."
                            : "No blocks match your search query."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredBlocks.map((block, idx) => (
                          <div
                            key={block.blockId || idx}
                            className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-2 shadow-2xs hover:border-slate-300 transition"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-50 text-[10px] font-bold text-amber-700">
                                  #{idx + 1}
                                </span>
                                <h4 className="text-xs font-bold text-slate-900">
                                  {block.title}
                                </h4>
                              </div>

                              {block.pageReferences && block.pageReferences.length > 0 && (
                                <span className="rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-mono shrink-0">
                                  p. {block.pageReferences.join(", ")}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed">
                              {block.summary}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Add from Library Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {isLibraryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-[28px] bg-white border border-slate-200 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Attach from Your Library
                  </h2>
                  <p className="text-xs text-slate-500">
                    Select an existing textbook or note to link to this study session.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLibraryModalOpen(false)}
                  className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {availableLibraryItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-2">
                  <FolderPlus className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">
                    No unattached library items available.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Upload new sources directly to this session.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  {availableLibraryItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedLibraryId(item.id)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer",
                        selectedLibraryId === item.id
                          ? "bg-indigo-50/70 border-indigo-300"
                          : "bg-slate-50/70 border-slate-200/80 hover:bg-slate-100"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <PdfIconBadge />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.courseTitle || "Library Material"}
                          </span>
                        </div>
                      </div>

                      <span className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center shrink-0">
                        {selectedLibraryId === item.id && (
                          <span className="h-2 w-2 rounded-full bg-indigo-600" />
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLibraryModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAttachFromLibrary}
                  disabled={!selectedLibraryId || addMaterialMutation.isPending}
                  className="rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {addMaterialMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Attaching...</span>
                    </>
                  ) : (
                    <span>Attach to Session</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exercises Modal */}
      <ExercisesModal
        isOpen={isExercisesModalOpen}
        onClose={() => setIsExercisesModalOpen(false)}
        sessionId={sessionId}
      />
    </div>
  );
}
