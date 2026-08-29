"use client";

import { useState } from "react";
import Link from "next/link";
import { LandingHeader, LandingFooter, MobileNav } from "@/components/landing";
import {
  Search,
  Bookmark,
  Loader2,
  Download,
  Plus,
  Check,
  LogIn,
  FileText,
} from "lucide-react";
import {
  usePublicLibrary,
  useImportMaterial,
  getLibraryDownloadUrl,
  type LibraryFilters,
} from "@/hooks/app/use-public-library";
import { useDebounce } from "@/hooks/common/use-debounce";
import { useAuth } from "@/contexts/auth-context";
import { useQueryParams } from "@/hooks";
import { PaginationController } from "@/components/common/pagination-controller";
import { toast } from "sonner";

interface Resource {
  id: string;
  libraryItemId?: string; // present for real API items
  badge: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  subtitle: string;
  stats: string;
  ctaText: string;
  preview: React.ReactNode;
}

const FALLBACK_RESOURCES: Resource[] = [
  {
    id: "1",
    badge: "OFFICIAL QUIZ",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    title: "Cellular Respiration Essentials",
    subtitle: "Biology · 20 questions · ~14 min",
    stats: "4.9 ★ · 1.2k takes",
    ctaText: "Take quiz →",
    preview: (
      <div className="rounded-xl bg-[#F7F9FC] p-3">
        <p className="text-[11px] font-bold">Where does glycolysis occur?</p>
        <div className="mt-2 grid grid-cols-2 gap-1.5 text-[9px] font-semibold">
          <span className="rounded-md bg-white p-1.5 ring-1 ring-slate-200">
            Nucleus
          </span>
          <span className="rounded-md bg-[#0C60FC] p-1.5 text-white">
            Cytoplasm ✓
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "2",
    badge: "PRACTICE QUIZ",
    badgeBg: "bg-violet-50",
    badgeText: "text-violet-700",
    title: "Constitutional Law: Key Cases & Precedents",
    subtitle: "Law · 25 questions · ~20 min",
    stats: "4.8 ★ · 850 takes",
    ctaText: "Take quiz →",
    preview: (
      <div className="rounded-xl bg-[#F5F0FF] p-3">
        <p className="text-[11px] font-bold text-slate-900">
          Which doctrine was established in Marbury v. Madison?
        </p>
        <div className="mt-2 grid grid-cols-2 gap-1.5 text-[9px] font-semibold">
          <span className="rounded-md bg-white p-1.5 ring-1 ring-slate-200">
            Federalism
          </span>
          <span className="rounded-md bg-violet-600 p-1.5 text-white">
            Judicial Review ✓
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "3",
    badge: "CORE QUIZ",
    badgeBg: "bg-lime-100",
    badgeText: "text-lime-800",
    title: "Data Structures & Algorithm Complexity",
    subtitle: "Computer Science · 30 questions · ~25 min",
    stats: "4.9 ★ · 2.4k takes",
    ctaText: "Take quiz →",
    preview: (
      <div className="rounded-xl bg-lime-50/70 p-3">
        <p className="text-[11px] font-bold text-slate-900">
          What is the average time complexity of QuickSort?
        </p>
        <div className="mt-2 grid grid-cols-2 gap-1.5 text-[9px] font-semibold">
          <span className="rounded-md bg-white p-1.5 ring-1 ring-slate-200">
            O(n²)
          </span>
          <span className="rounded-md bg-lime-700 p-1.5 text-white">
            O(n log n) ✓
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "4",
    badge: "EXAM PREP",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-800",
    title: "Thermodynamics & Heat Transfer Principles",
    subtitle: "Engineering · 20 questions · ~15 min",
    stats: "4.7 ★ · 940 takes",
    ctaText: "Take quiz →",
    preview: (
      <div className="rounded-xl bg-[#FFF8EF] p-3">
        <p className="text-[11px] font-bold text-slate-900">
          Which statement defines the 1st Law of Thermodynamics?
        </p>
        <div className="mt-2 grid grid-cols-2 gap-1.5 text-[9px] font-semibold">
          <span className="rounded-md bg-white p-1.5 ring-1 ring-slate-200">
            Entropy increases
          </span>
          <span className="rounded-md bg-amber-600 p-1.5 text-white">
            Energy is conserved ✓
          </span>
        </div>
      </div>
    ),
  },
];

export default function LibraryPage() {
  const { getParam, getNumberParam, setQueryParams } = useQueryParams();
  const searchQuery = getParam("search", "");
  const page = Math.max(1, getNumberParam("page", 1));
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  const setSearchQuery = (q: string) =>
    setQueryParams({ search: q || null, page: 1 });
  const setPage = (p: number) => setQueryParams({ page: p > 1 ? p : null });

  const { user } = useAuth();
  const importMutation = useImportMaterial();

  const debouncedSearch = useDebounce(searchQuery, 400);

  const filters: LibraryFilters = {
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    page,
    limit: 12,
  };

  // TanStack Query integration
  const { data: apiData, isLoading } = usePublicLibrary(filters);

  const itemsFromApi = apiData?.data ?? [];
  const totalCount = apiData?.pagination?.total ?? itemsFromApi.length;
  const totalPages = apiData?.pagination?.totalPages ?? 1;

  const toggleSave = (id: string) => {
    setSavedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // --- helpers ---------------------------------------------------------------

  /** Strip common file extensions from a display title */
  function cleanTitle(raw: string) {
    return raw.replace(/\.(pdf|docx?|pptx?|txt|xlsx?|csv|zip)$/i, "").trim();
  }

  /** Resolve badge label + colours from a MIME type */
  function mimeInfo(mime = "") {
    if (mime.includes("pdf"))
      return {
        label: "PDF",
        icon: FileText,
        bg: "bg-rose-50",
        text: "text-rose-700",
        lineBg: "bg-rose-200/50",
        tagRing: "ring-rose-200",
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
        tagRing: "ring-blue-200",
        previewBg: "bg-blue-50",
        accent: "text-blue-400",
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
        tagRing: "ring-orange-200",
        previewBg: "bg-orange-50",
        accent: "text-orange-400",
      };
    if (mime.includes("sheet") || mime.includes("xlsx") || mime.includes("csv"))
      return {
        label: "XLSX",
        icon: FileText,
        bg: "bg-green-50",
        text: "text-green-700",
        lineBg: "bg-green-200/50",
        tagRing: "ring-green-200",
        previewBg: "bg-green-50",
        accent: "text-green-500",
      };
    return {
      label: "FILE",
      icon: FileText,
      bg: "bg-violet-50",
      text: "text-violet-700",
      lineBg: "bg-violet-200/50",
      tagRing: "ring-violet-200",
      previewBg: "bg-violet-50",
      accent: "text-violet-400",
    };
  }

  /** Rich preview JSX per file type */
  function buildPreview(item: (typeof itemsFromApi)[0]) {
    const mime = item.materialId?.mimeType ?? "";
    const info = mimeInfo(mime);
    const tags = item.tags?.slice(0, 3) ?? [];
    const pages = (item.materialId as any)?.pageCount ?? 0;
    const words = (item.materialId as any)?.wordCount ?? 0;
    const bytes = (item.materialId as any)?.size ?? 0;
    const isPptx =
      mime.includes("presentation") ||
      mime.includes("pptx") ||
      mime.includes("powerpoint");
    const sizeLbl =
      bytes > 0
        ? bytes < 1024 * 1024
          ? `${(bytes / 1024).toFixed(0)} KB`
          : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
        : null;

    const metaLine = (pages > 0 || words > 0 || sizeLbl) && (
      <p className={`mt-1.5 text-[9px] font-bold ${info.accent}`}>
        {pages > 0 && `${pages} ${isPptx ? "slides" : "pages"}  `}
        {words > 0 && !isPptx && `${(words / 1000).toFixed(0)}k words  `}
        {sizeLbl}
      </p>
    );

    const tagRow = tags.length > 0 && (
      <div className="mt-2 flex flex-wrap gap-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`rounded-md bg-white px-2 py-0.5 text-[9px] font-bold text-slate-600 ring-1 ${info.tagRing}`}
          >
            {tag}
          </span>
        ))}
      </div>
    );

    const Icon = info.icon;

    if (isPptx) {
      return (
        <div className={`rounded-xl ${info.previewBg} p-3`}>
          <div className="grid grid-cols-3 gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex aspect-[4/3] items-center justify-center rounded-lg bg-white text-xs font-extrabold shadow-sm ring-1 ${info.tagRing} ${info.text}`}
              >
                {s}
              </div>
            ))}
          </div>
          {metaLine}
          {tagRow}
        </div>
      );
    }

    return (
      <div className={`rounded-xl ${info.previewBg} p-3`}>
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ${info.tagRing} ${info.text}`}
          >
            <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className={`h-2 w-full rounded-full ${info.lineBg}`} />
            <div
              className={`h-2 w-10/12 rounded-full ${info.lineBg} opacity-75`}
            />
            <div
              className={`h-2 w-7/12 rounded-full ${info.lineBg} opacity-50`}
            />
            {metaLine}
          </div>
        </div>
        {item.description && (
          <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-relaxed text-slate-600">
            {item.description}
          </p>
        )}
        {tagRow}
      </div>
    );
  }

  // --- build resource list ----------------------------------------------------
  const displayResources: Resource[] =
    itemsFromApi.length > 0
      ? itemsFromApi.map((item) => {
          const mime = item.materialId?.mimeType ?? "";
          const info = mimeInfo(mime);
          const course = item.courseId?.code ? `${item.courseId.code} · ` : "";
          const subject =
            item.courseId?.title ?? item.subject ?? "Study material";
          const uni =
            item.universityId?.shortName ??
            item.universityId?.name ??
            "University";
          const year = (item as any).year ? ` · ${(item as any).year}` : "";
          const uses = item.useCount ?? 0;
          return {
            id: item._id,
            libraryItemId: item._id,
            badge:
              info.label === "PDF" || info.label === "DOCX"
                ? "COMMUNITY QUIZ"
                : info.label,
            badgeBg: "bg-blue-50",
            badgeText: "text-blue-700",
            title: cleanTitle(item.title),
            subtitle: `${course}${subject} · ${uni}${year}`,
            stats: uses > 0 ? `${uses.toLocaleString()} takes` : "New Quiz",
            ctaText: "Take quiz →",
            preview: buildPreview(item),
          };
        })
      : FALLBACK_RESOURCES.filter((res) => {
          const q = searchQuery.trim().toLowerCase();
          return (
            !q ||
            res.title.toLowerCase().includes(q) ||
            res.subtitle.toLowerCase().includes(q)
          );
        });

  return (
    <div className="overflow-x-hidden bg-[#F7F9FC] text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <LandingHeader />

      <main>
        {/* Hero Section */}
        <section className="soft-grid relative overflow-hidden px-5 pb-12 pt-32 lg:pb-16 lg:pt-44">
          <div className="pointer-events-none absolute -left-20 top-24 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#0C60FC]">
                  Public Study Library
                </p>
                <h1 className="display mt-3 text-4xl font-bold leading-tight sm:text-6xl">
                  Borrow a head start.
                </h1>
                <p className="hand mt-2 text-2xl text-[#0C60FC]">
                  quizzes from top students ✦
                </p>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                {totalCount.toLocaleString()} community quizzes · updated live
              </p>
            </div>

            {/* Search Bar */}
            <div className="mt-8">
              <div className="relative max-w-3xl">
                {isLoading ? (
                  <Loader2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-[#0C60FC]" />
                ) : (
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                )}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by quiz topic, course or keyword — e.g. Biology, Law, DCIT…"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm font-semibold outline-none shadow-sm transition placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Pick Up Where You Left Off — auth users only */}
        {user && !user.email && (
          <section className="px-5 pb-8">
            <div className="mx-auto max-w-7xl">
              <div
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                style={{ borderRadius: "24px" }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Pick up where you left off{" "}
                    <span className="hand text-[#0C60FC]">
                      you were so close
                    </span>
                  </h2>
                  <Link
                    href="/app/library"
                    className="text-xs font-extrabold text-[#0C60FC]"
                  >
                    See all →
                  </Link>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-[#F7F9FC] p-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-base shadow-sm">
                      🃏
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">
                        Constitutional Law
                      </p>
                      <div className="mt-1.5 h-1.5 rounded-full bg-slate-200">
                        <div className="h-full w-[14%] rounded-full bg-violet-500" />
                      </div>
                      <p className="mt-1 text-[10px] font-semibold text-slate-400">
                        Card 12 of 84
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-[#F7F9FC] p-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-base shadow-sm">
                      📝
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">
                        Cellular Respiration
                      </p>
                      <div className="mt-1.5 h-1.5 rounded-full bg-slate-200">
                        <div className="h-full w-[15%] rounded-full bg-[#0C60FC]" />
                      </div>
                      <p className="mt-1 text-[10px] font-semibold text-slate-400">
                        Question 3 of 20
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-[#F7F9FC] p-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-base shadow-sm">
                      📄
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">
                        Thermodynamics Notes
                      </p>
                      <div className="mt-1.5 h-1.5 rounded-full bg-slate-200">
                        <div className="h-full w-[58%] rounded-full bg-amber-500" />
                      </div>
                      <p className="mt-1 text-[10px] font-semibold text-slate-400">
                        Page 19 of 32
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Resources Grid */}
        <section className="px-5 pb-24">
          <div className="mx-auto max-w-7xl">
            {isLoading ? (
              <div className="py-16 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#0C60FC]" />
                <p className="mt-3 text-xs font-bold text-slate-400">
                  Fetching public study materials…
                </p>
              </div>
            ) : displayResources.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm font-semibold text-slate-500">
                No matching study materials found. Try searching another
                keyword.
              </div>
            ) : (
              <>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {displayResources.map((res) => {
                  const isSaved = !!savedIds[res.id];
                  const isApiItem = !!res.libraryItemId;

                  return (
                    <article
                      key={res.id}
                      className="play-card flex flex-col rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm"
                      style={{ borderRadius: "26px" }}
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${res.badgeBg} ${res.badgeText}`}
                        >
                          {res.badge}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleSave(res.id)}
                          className="text-slate-300 transition hover:text-[#0C60FC]"
                          aria-label="Save resource"
                        >
                          <Bookmark
                            className={`h-5 w-5 ${isSaved ? "fill-[#0C60FC] text-[#0C60FC]" : ""}`}
                          />
                        </button>
                      </div>

                      <h3 className="mt-5 text-lg font-bold text-slate-900">
                        {res.title}
                      </h3>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {res.subtitle}
                      </p>

                      <div className="mt-4">{res.preview}</div>

                      {/* Actions */}
                      <div className="mt-auto pt-5">
                        {isApiItem ? (
                          <div className="flex items-center gap-2">
                            {/* Download — everyone */}
                            <button
                              type="button"
                              onClick={() =>
                                window.open(
                                  getLibraryDownloadUrl(res.libraryItemId!),
                                  "_blank",
                                )
                              }
                              className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-[11px] font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </button>

                            {/* Add to Library — auth only */}
                            {user ? (
                              <button
                                type="button"
                                disabled={
                                  importMutation.isPending ||
                                  !!savedIds[`imported-${res.id}`]
                                }
                                onClick={() =>
                                  importMutation.mutate(res.libraryItemId!, {
                                    onSuccess: () => {
                                      setSavedIds((p) => ({
                                        ...p,
                                        [`imported-${res.id}`]: true,
                                      }));
                                      toast.success("Added to your library");
                                    },
                                    onError: (err: any) => {
                                      if (err.response?.status === 409) {
                                        setSavedIds((p) => ({
                                          ...p,
                                          [`imported-${res.id}`]: true,
                                        }));
                                        toast.info("Already in your library");
                                      } else {
                                        toast.error("Could not add to library");
                                      }
                                    },
                                  })
                                }
                                className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl text-[11px] font-extrabold transition ${
                                  savedIds[`imported-${res.id}`]
                                    ? "border border-[#0C60FC]/20 bg-blue-50 text-[#0C60FC]"
                                    : "bg-slate-950 text-white hover:bg-[#0C60FC]"
                                }`}
                              >
                                {importMutation.isPending ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : savedIds[`imported-${res.id}`] ? (
                                  <Check className="h-3.5 w-3.5" />
                                ) : (
                                  <Plus className="h-3.5 w-3.5" />
                                )}
                                {savedIds[`imported-${res.id}`]
                                  ? "In library"
                                  : "Add to library"}
                              </button>
                            ) : (
                              <Link
                                href="/login"
                                className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-950 text-[11px] font-extrabold text-white transition hover:bg-[#0C60FC]"
                              >
                                <LogIn className="h-3.5 w-3.5" />
                                Sign in to save
                              </Link>
                            )}
                          </div>
                        ) : (
                          /* Fallback mock items — single CTA */
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>{res.stats}</span>
                            <Link
                              href="/signup"
                              className="font-extrabold text-[#0C60FC] hover:underline"
                            >
                              {res.ctaText}
                            </Link>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
                </div>
                {totalPages > 1 && (
                  <PaginationController
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    className="mt-6"
                    buttonSize="md"
                  />
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <LandingFooter />
      <MobileNav />
    </div>
  );
}
