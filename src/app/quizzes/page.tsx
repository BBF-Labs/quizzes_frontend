"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { QuizCard } from "@/components/app/quizzes/quiz-card";
import { Search, ArrowRight, Loader2, ChevronDown, X } from "lucide-react";
import { useSystemQuizzes } from "@/hooks/app/use-quizzes";
import { useDebounce } from "@/hooks/common/use-debounce";
import { useQueryParams } from "@/hooks";
import { format } from "date-fns";

interface QuizDisplayItem {
  id: string;
  code: string;
  title: string;
  description: string;
  questionCount: number;
  lectureCount: number;
  passingScore: number;
  date: string;
  codeBg: string;
  codeText: string;
}

const FALLBACK_QUIZZES: QuizDisplayItem[] = [
  {
    id: "dcit-428",
    code: "DCIT 428",
    title: "DCIT 428 Quiz",
    description: "Wireless networks, signals and electromagnetic waves.",
    questionCount: 82,
    lectureCount: 1,
    passingScore: 70,
    date: "JUL 23, 2026",
    codeBg: "bg-blue-50",
    codeText: "text-blue-700",
  },
  {
    id: "dcit-407",
    code: "DCIT 407",
    title: "DCIT 407 Quiz",
    description:
      "Comprehensive Image Processing quiz across the full material.",
    questionCount: 450,
    lectureCount: 11,
    passingScore: 70,
    date: "APR 14, 2026",
    codeBg: "bg-purple-50",
    codeText: "text-purple-700",
  },
  {
    id: "dcit-403",
    code: "DCIT 403",
    title: "DCIT 403 Quiz",
    description: "Intelligent agents, multi-agent systems and methodologies.",
    questionCount: 474,
    lectureCount: 10,
    passingScore: 80,
    date: "APR 11, 2026",
    codeBg: "bg-rose-50",
    codeText: "text-rose-700",
  },
  {
    id: "dcit-401",
    code: "DCIT 401",
    title: "DCIT 401 Quiz",
    description: "General course coverage across five lectures.",
    questionCount: 228,
    lectureCount: 5,
    passingScore: 80,
    date: "APR 6, 2026",
    codeBg: "bg-cyan-50",
    codeText: "text-cyan-700",
  },
  {
    id: "dcit-308",
    code: "DCIT 308",
    title: "DCIT 308 Quiz",
    description: "General quiz covering seven course lectures.",
    questionCount: 155,
    lectureCount: 7,
    passingScore: 70,
    date: "SEP 7, 2025",
    codeBg: "bg-indigo-50",
    codeText: "text-indigo-700",
  },
  {
    id: "dcit-306",
    code: "DCIT 306",
    title: "DCIT 306 Quiz",
    description: "A deep general review across ten lectures.",
    questionCount: 459,
    lectureCount: 10,
    passingScore: 70,
    date: "SEP 4, 2025",
    codeBg: "bg-violet-50",
    codeText: "text-violet-700",
  },
  {
    id: "dcit-214",
    code: "DCIT 214",
    title: "DCIT 214 Quiz",
    description: "General quiz covering five lectures.",
    questionCount: 100,
    lectureCount: 5,
    passingScore: 70,
    date: "SEP 1, 2025",
    codeBg: "bg-amber-50",
    codeText: "text-amber-700",
  },
  {
    id: "dcit-302",
    code: "DCIT 302",
    title: "DCIT 302 Quiz",
    description: "General quiz covering six lectures.",
    questionCount: 207,
    lectureCount: 6,
    passingScore: 70,
    date: "AUG 30, 2025",
    codeBg: "bg-emerald-50",
    codeText: "text-emerald-700",
  },
  {
    id: "dcit-304",
    code: "DCIT 304",
    title: "DCIT 304 Quiz",
    description: "General quiz covering eight lectures.",
    questionCount: 160,
    lectureCount: 8,
    passingScore: 70,
    date: "AUG 29, 2025",
    codeBg: "bg-sky-50",
    codeText: "text-sky-700",
  },
];

const CODE_BG_COLOR_MAP: Record<string, { bg: string; text: string }> = {
  DCIT: { bg: "bg-blue-50", text: "text-blue-700" },
  MATH: { bg: "bg-purple-50", text: "text-purple-700" },
  UGRC: { bg: "bg-emerald-50", text: "text-emerald-700" },
  STAT: { bg: "bg-amber-50", text: "text-amber-700" },
  ECON: { bg: "bg-rose-50", text: "text-rose-700" },
  CBAS: { bg: "bg-cyan-50", text: "text-cyan-700" },
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "JUL 2026";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "JUL 2026";
    return format(d, "MMM d, yyyy").toUpperCase();
  } catch {
    return "JUL 2026";
  }
}

function extractCourseCode(title: string, courseId?: string): string {
  if (courseId && courseId.length <= 10) return courseId.toUpperCase();
  const match = title.match(/([A-Z]{3,4}\s*\d{3})/i);
  if (match) return match[1].toUpperCase();
  return "QUIZ";
}

function getCodeStyles(code: string) {
  const prefix = code.split(" ")[0] || "";
  return (
    CODE_BG_COLOR_MAP[prefix] ?? { bg: "bg-blue-50", text: "text-blue-700" }
  );
}

function QuizzesPageContent() {
  const { getParam, getNumberParam, setQueryParams } = useQueryParams();

  const searchQuery = getParam("search", "");
  const activeCategory = getParam("category", "all");
  const sortBy = getParam("sort", "newest");
  const page = Math.max(1, getNumberParam("page", 1));

  const setSearchQuery = (val: string) =>
    setQueryParams({ search: val || null, page: 1 });
  const setActiveCategory = (val: string) =>
    setQueryParams({ category: val === "all" ? null : val, page: 1 });
  const setSortBy = (val: string) =>
    setQueryParams({ sort: val === "newest" ? null : val });
  const setPage = (p: number) =>
    setQueryParams({ page: p > 1 ? p : null });

  const debouncedSearch = useDebounce(searchQuery, 350);

  // TanStack Query backend integration
  const { data: apiData, isLoading } = useSystemQuizzes({
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    tags:
      activeCategory !== "all" && activeCategory !== "200_plus"
        ? activeCategory
        : undefined,
  });

  const apiQuizzes = apiData?.quizzes ?? [];
  const pagination = apiData?.pagination;
  const totalCount = pagination?.total ?? apiQuizzes.length;
  const totalPages =
    (pagination?.totalPages ?? Math.ceil(totalCount / 12)) || 1;

  // Category pills derived from live API data only
  const categoryPills = useMemo(() => {
    const pills: Array<{ id: string; label: string; count?: number }> = [
      { id: "all", label: "All quizzes", count: apiQuizzes.length },
    ];
    const csCount = apiQuizzes.filter((q) =>
      extractCourseCode(q.title, q.courseId).startsWith("DCIT"),
    ).length;
    if (csCount > 0)
      pills.push({ id: "cs", label: "Computer Science", count: csCount });
    const genCount = apiQuizzes.filter((q) =>
      extractCourseCode(q.title, q.courseId).startsWith("UGRC"),
    ).length;
    if (genCount > 0)
      pills.push({ id: "general", label: "General studies", count: genCount });
    const count200 = apiQuizzes.filter(
      (q) => (q.questionCount ?? 0) >= 200,
    ).length;
    if (count200 > 0)
      pills.push({ id: "200_plus", label: "200+ questions", count: count200 });
    return pills;
  }, [apiQuizzes]);

  // Map real API quizzes only — no fallbacks
  const displayQuizzes: QuizDisplayItem[] = useMemo(() => {
    let mapped = apiQuizzes.map((q) => {
      const code = extractCourseCode(q.title, q.courseId);
      const styles = getCodeStyles(code);
      return {
        id: q._id,
        code,
        title: q.title,
        description:
          q.description ||
          "Curated course quiz built from official lecture material.",
        questionCount: q.questionCount ?? 0,
        lectureCount: q.lectureCount ?? 1,
        passingScore: q.passingScore ?? 70,
        date: formatDate(q.createdAt),
        codeBg: styles.bg,
        codeText: styles.text,
      };
    });

    // Local search filter
    const query = debouncedSearch.trim().toLowerCase();
    if (query) {
      mapped = mapped.filter(
        (q) =>
          q.title.toLowerCase().includes(query) ||
          q.code.toLowerCase().includes(query) ||
          q.description.toLowerCase().includes(query),
      );
    }

    // Category filter
    if (activeCategory === "200_plus") {
      mapped = mapped.filter((q) => q.questionCount >= 200);
    } else if (activeCategory === "cs") {
      mapped = mapped.filter((q) => q.code.startsWith("DCIT"));
    } else if (activeCategory === "general") {
      mapped = mapped.filter((q) => q.code.startsWith("UGRC"));
    }

    // Sort
    if (sortBy === "questions") {
      mapped.sort((a, b) => b.questionCount - a.questionCount);
    } else if (sortBy === "score") {
      mapped.sort((a, b) => b.passingScore - a.passingScore);
    }

    return mapped;
  }, [apiQuizzes, debouncedSearch, activeCategory, sortBy]);

  // Aggregate total question count
  const totalQuestionsCount = useMemo(
    () => displayQuizzes.reduce((acc, q) => acc + q.questionCount, 0),
    [displayQuizzes],
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
  };

  return (
    <div className="overflow-x-hidden text-slate-900 selection:bg-[#0C60FC] selection:text-white">
      <main className="relative">
        {/* Hero Section */}
        <section className="soft-grid relative overflow-hidden px-5 pb-12 pt-12 lg:pb-16 lg:pt-16">
          <div className="pointer-events-none absolute -left-20 top-24 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                <p className="hand text-base font-semibold text-[#0C60FC]">
                  <Link href="/library" className="hover:underline">
                    Public library
                  </Link>{" "}
                  / Quizzes
                </p>
                <h1 className="display mt-2 text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                  Official <br />
                  <span className="hand text-[#0C60FC]">quizzes.</span>
                </h1>
                <p className="mt-4 max-w-xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
                  Curated and reviewed by the Qz team. Test what you know with
                  quizzes built from real university lecture material.
                </p>
              </div>

              {/* Stat Metric Cards Top Right */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="min-w-[120px] rounded-2xl border border-slate-200/80 bg-white/90 p-5 text-center shadow-sm backdrop-blur-sm">
                  <b className="display text-3xl font-extrabold text-slate-950 block leading-none">
                    {totalCount.toLocaleString()}
                  </b>
                  <span className="mt-2 block text-[9px] font-extrabold tracking-widest text-slate-400 uppercase">
                    AVAILABLE
                  </span>
                </div>

                <div className="min-w-[130px] rounded-2xl border border-slate-200/80 bg-white/90 p-5 text-center shadow-sm backdrop-blur-sm">
                  <b className="display text-3xl font-extrabold text-slate-950 block leading-none">
                    {totalQuestionsCount.toLocaleString()}
                  </b>
                  <span className="mt-2 block text-[9px] font-extrabold tracking-widest text-slate-400 uppercase">
                    QUESTIONS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <section className="px-5 pb-24">
          <div className="mx-auto max-w-7xl">
            {/* Outer Container Card */}
            <div className="rounded-[32px] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
              {/* Header Toolbar */}
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
                    Choose a course
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    {displayQuizzes.length} quizzes shown · Page {page} of{" "}
                    {totalPages}
                  </p>
                </div>

                {/* Search & Sort controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Search course, topic or keyword..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-9 text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#0C60FC] focus:bg-white focus:ring-4 focus:ring-blue-100/60 transition"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setPage(1);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label="Clear search"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none rounded-2xl border border-slate-200 bg-white py-2.5 pl-4 pr-9 text-xs font-bold text-slate-700 outline-none focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100 transition cursor-pointer"
                    >
                      <option value="newest">Sort: Newest</option>
                      <option value="questions">Sort: Most Questions</option>
                      <option value="score">Sort: Highest Pass Score</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Filter Category Pills */}
              <div className="mt-6 flex flex-wrap gap-2">
                {categoryPills.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`rounded-full px-4 py-2 text-xs font-extrabold transition flex items-center gap-1.5 ${
                        isActive
                          ? "bg-[#0A0D14] text-white shadow-sm"
                          : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/60 ring-1 ring-slate-200/60"
                      }`}
                    >
                      <span>{cat.label}</span>
                      {cat.count !== undefined && cat.id !== "all" && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-200/80 text-slate-600"
                          }`}
                        >
                          {cat.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quiz Cards Grid */}
              <div className="mt-8">
                {isLoading ? (
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="rounded-[28px] border border-slate-200/80 bg-white p-6 animate-pulse space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="h-6 w-20 rounded-full bg-slate-100" />
                          <div className="h-4 w-24 rounded bg-slate-100" />
                        </div>
                        <div className="h-6 w-3/4 rounded bg-slate-100" />
                        <div className="h-4 w-full rounded bg-slate-100" />
                        <div className="h-4 w-2/3 rounded bg-slate-100" />
                        <div className="grid grid-cols-3 gap-2 pt-2">
                          <div className="h-16 rounded-2xl bg-slate-100" />
                          <div className="h-16 rounded-2xl bg-slate-100" />
                          <div className="h-16 rounded-2xl bg-slate-100" />
                        </div>
                        <div className="h-12 rounded-2xl bg-slate-100 mt-2" />
                      </div>
                    ))}
                  </div>
                ) : displayQuizzes.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-16 text-center">
                    <p className="text-sm font-bold text-slate-500">
                      No quizzes found.
                    </p>
                    {(searchQuery || activeCategory !== "all") && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setActiveCategory("all");
                        }}
                        className="mt-3 text-xs font-extrabold text-[#0C60FC] hover:underline"
                      >
                        Reset all filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {displayQuizzes.map((quiz) => (
                      <QuizCard key={quiz.id} {...quiz} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Pagination Controller */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm">
                <span className="text-xs font-bold text-slate-600">
                  <b>Page {page}</b> of {totalPages} · {totalCount} quizzes
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`h-9 w-9 rounded-xl text-xs font-extrabold transition ${
                          p === page
                            ? "bg-[#0A0D14] text-white shadow-sm"
                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function QuizzesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC]">
          <Loader2 className="h-8 w-8 animate-spin text-[#0C60FC]" />
        </div>
      }
    >
      <QuizzesPageContent />
    </Suspense>
  );
}
