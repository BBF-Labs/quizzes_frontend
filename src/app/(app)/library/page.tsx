"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  BookOpen,
  Tag,
  Users,
  Search,
  Calendar,
  Download,
  Plus,
  Check,
  LoaderCircle,
  Zap,
  X,
} from "lucide-react";
import {
  usePublicLibrary,
  type LibraryFilters,
  type LibraryItem,
  getLibraryDownloadUrl,
  useImportMaterial,
} from "@/hooks/app/use-public-library";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/common/use-debounce";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function mimeLabel(mime: string): string {
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("word") || mime.includes("docx")) return "DOCX";
  if (mime.includes("presentation") || mime.includes("pptx")) return "PPTX";
  if (mime.includes("text")) return "TXT";
  return "FILE";
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function LibraryCard({
  item,
  onStudy,
}: {
  item: LibraryItem;
  onStudy: (id: string) => void;
}) {
  const { user } = useAuth();
  const importMutation = useImportMaterial();
  const [isAdded, setIsAdded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border/40 bg-card/20 flex flex-col"
    >
      {/* Top */}
      <div className="px-4 pt-4 pb-3 flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-primary/60 border border-primary/20 px-1.5 py-0.5">
              {mimeLabel(item.materialId.mimeType)}
            </span>
            {item.year && (
              <span className="text-[9px] font-mono text-muted-foreground/50">
                {item.year}
              </span>
            )}
          </div>
          {item.useCount > 0 && (
            <span className="text-[9px] font-mono text-muted-foreground/40 flex items-center gap-1">
              <Users className="size-2.5" />
              {item.useCount}
            </span>
          )}
        </div>

        <h3 className="text-[13px] font-bold text-foreground leading-snug mb-1">
          {item.title}
        </h3>

        {item.description && (
          <p className="text-[11px] font-mono text-muted-foreground/60 leading-relaxed line-clamp-2 mb-2">
            {item.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-col gap-1 mt-2">
          {item.universityId && (
            <p className="text-[10px] font-mono text-muted-foreground/50 flex items-center gap-1.5">
              <BookOpen className="size-3 shrink-0" />
              {item.universityId.shortName ?? item.universityId.name}
            </p>
          )}
          {item.courseId && (
            <p className="text-[10px] font-mono text-muted-foreground/50 flex items-center gap-1.5">
              <FileText className="size-3 shrink-0" />
              {item.courseId.code} · {item.courseId.title}
            </p>
          )}
          {item.subject && !item.courseId && (
            <p className="text-[10px] font-mono text-muted-foreground/50 flex items-center gap-1.5">
              <Tag className="size-3 shrink-0" />
              {item.subject}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-3 mt-3">
          {item.materialId.pageCount > 0 && (
            <span className="text-[9px] font-mono text-muted-foreground/40">
              {item.materialId.pageCount}p
            </span>
          )}
          {item.materialId.wordCount > 0 && (
            <span className="text-[9px] font-mono text-muted-foreground/40">
              {(item.materialId.wordCount / 1000).toFixed(0)}k words
            </span>
          )}
          <span className="text-[9px] font-mono text-muted-foreground/40">
            {fileSize(item.materialId.size)}
          </span>
        </div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.slice(0, 4).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[8px] h-4 px-1.5 font-mono"
              >
                {tag}
              </Badge>
            ))}
            {item.tags.length > 4 && (
              <span className="text-[8px] font-mono text-muted-foreground/40 self-center">
                +{item.tags.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action */}
      <div className="px-4 pb-4 pt-2 border-t border-border/20 mt-auto flex gap-2">
        <Button
          size="sm"
          className="flex-1 h-8 text-[10px] font-mono gap-1.5"
          onClick={() => onStudy(item._id)}
        >
          <Zap className="size-3" />
          Study with Z
        </Button>
        {user && (
          <Button
            size="sm"
            variant="outline"
            className={cn(
              "h-8 px-3 text-[9px] font-mono gap-1.5 border-border/40 transition-all",
              isAdded && "text-primary border-primary/20 bg-primary/5",
            )}
            disabled={importMutation.isPending || isAdded}
            onClick={() =>
              importMutation.mutate(item._id, {
                onSuccess: () => {
                  setIsAdded(true);
                  toast.success("Material added to your library");
                },
                onError: (err: any) => {
                  if (err.response?.status === 409) {
                    setIsAdded(true);
                    toast.info("Already in your library");
                  } else {
                    toast.error("Failed to add to library");
                  }
                },
              })
            }
          >
            {importMutation.isPending ? (
              <LoaderCircle className="size-3 animate-spin" />
            ) : isAdded ? (
              <Check className="size-3" />
            ) : (
              <Plus className="size-3" />
            )}
            {isAdded ? "Added" : "Add to Library"}
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 border-border/40 hover:bg-primary/5 hover:border-primary/20 transition-all"
          title="Download Source File"
          onClick={() => window.open(getLibraryDownloadUrl(item._id), "_blank")}
        >
          <Download className="size-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicLibraryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<LibraryFilters>({});
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  const activeFilters: LibraryFilters = {
    ...filters,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    page,
    limit: 18,
  };

  const { data, isLoading } = usePublicLibrary(activeFilters);
  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const clearFilters = () => {
    setSearch("");
    setFilters({});
    setPage(1);
  };

  const hasActiveFilters =
    search ||
    Object.keys(filters).some((k) => filters[k as keyof LibraryFilters]);

  const handleStudy = (id: string) => {
    // Route to app, passing the library item id as a material to load
    router.push(`/app?libraryMaterialId=${id}`);
  };

  return (
    <div className="min-h-full px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary/70 mb-1">
            Public Library
          </p>
          <h1 className="text-2xl font-black tracking-tight mb-1">
            Study Materials
          </h1>
          <p className="text-[12px] font-mono text-muted-foreground/60">
            Curated lecture notes, past papers, and resources from universities
            across Ghana.
          </p>
        </motion.div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
            <Input
              placeholder="Search materials, courses, topics..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 font-mono text-[11px]"
            />
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-[10px] font-mono shrink-0"
              onClick={clearFilters}
            >
              <X className="size-3" />
              Clear
            </Button>
          )}
        </div>

        {/* Results count */}
        {!isLoading && pagination && (
          <p className="text-[10px] font-mono text-muted-foreground/40 mb-4">
            {pagination.total}{" "}
            {pagination.total === 1 ? "material" : "materials"} found
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-52 animate-pulse bg-card/40 border border-border/30"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="size-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-[11px] font-mono text-muted-foreground/40 uppercase tracking-widest">
              No materials found
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 text-[10px] font-mono text-primary/60 hover:text-primary transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <LibraryCard key={item._id} item={item} onStudy={handleStudy} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[10px] font-mono"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-[10px] font-mono text-muted-foreground/50">
              {page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[10px] font-mono"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
