"use client";

import { useState } from "react";
import Link from "next/link";
import { LandingHeader, LandingFooter, MobileNav } from "@/components/landing";
import { Search, Plus, Loader2 } from "lucide-react";
import { QUBI_WAVE_SRC } from "@/lib/constants";
import { usePublicTimetables } from "@/hooks/use-public-exams";

interface ExamPaper {
  id: string;
  dept: string;
  code: string;
  title: string;
  date: string;
  month: string;
  dayNum: string;
  time: string;
  duration: string;
  venue: string;
  colorClass: string;
  dateBadgeBg: string;
  dateBadgeText: string;
}

const FALLBACK_PAPERS: ExamPaper[] = [
  {
    id: "1",
    dept: "cs",
    code: "DCIT 205",
    title: "Algorithms",
    date: "MONDAY",
    month: "Jan",
    dayNum: "12",
    time: "9:00 AM",
    duration: "2 HRS",
    venue: "Great Hall, Main Campus",
    colorClass: "border-blue-200 bg-blue-50/40",
    dateBadgeBg: "bg-[#0C60FC]",
    dateBadgeText: "text-white",
  },
  {
    id: "2",
    dept: "core",
    code: "UGRC 210",
    title: "Academic Writing II",
    date: "TUESDAY",
    month: "Jan",
    dayNum: "13",
    time: "7:30 AM",
    duration: "2 HRS",
    venue: "NNB Block, Rooms 1–6",
    colorClass: "border-slate-200 bg-white",
    dateBadgeBg: "bg-slate-100",
    dateBadgeText: "text-slate-900",
  },
  {
    id: "3",
    dept: "cs",
    code: "DCIT 207",
    title: "Operating Systems",
    date: "WEDNESDAY",
    month: "Jan",
    dayNum: "14",
    time: "2:00 PM",
    duration: "3 HRS",
    venue: "Balme Library Hall",
    colorClass: "border-slate-200 bg-white",
    dateBadgeBg: "bg-violet-50",
    dateBadgeText: "text-violet-700",
  },
  {
    id: "4",
    dept: "math",
    code: "MATH 221",
    title: "Linear Algebra",
    date: "THURSDAY",
    month: "Jan",
    dayNum: "15",
    time: "9:00 AM",
    duration: "2 HRS",
    venue: "Maths Department, Room 12",
    colorClass: "border-slate-200 bg-white",
    dateBadgeBg: "bg-amber-50",
    dateBadgeText: "text-amber-700",
  },
  {
    id: "5",
    dept: "bus",
    code: "BUSA 301",
    title: "Corporate Finance",
    date: "FRIDAY",
    month: "Jan",
    dayNum: "16",
    time: "11:30 AM",
    duration: "2 HRS",
    venue: "UGBS Auditorium",
    colorClass: "border-slate-200 bg-white",
    dateBadgeBg: "bg-emerald-50",
    dateBadgeText: "text-emerald-700",
  },
  {
    id: "6",
    dept: "cs",
    code: "DCIT 201",
    title: "Data Structures",
    date: "MONDAY",
    month: "Jan",
    dayNum: "19",
    time: "11:00 AM",
    duration: "2 HRS",
    venue: "N Block Auditorium",
    colorClass: "border-slate-200 bg-white",
    dateBadgeBg: "bg-cyan-50",
    dateBadgeText: "text-cyan-700",
  },
  {
    id: "7",
    dept: "cs",
    code: "DCIT 203",
    title: "Computer Architecture",
    date: "WEDNESDAY",
    month: "Jan",
    dayNum: "21",
    time: "2:00 PM",
    duration: "2 HRS",
    venue: "JQB 12",
    colorClass: "border-slate-200 bg-white",
    dateBadgeBg: "bg-rose-50",
    dateBadgeText: "text-rose-700",
  },
  {
    id: "8",
    dept: "math",
    code: "MATH 223",
    title: "Statistics",
    date: "FRIDAY",
    month: "Jan",
    dayNum: "23",
    time: "9:00 AM",
    duration: "2 HRS",
    venue: "Great Hall, Main Campus",
    colorClass: "border-slate-200 bg-white",
    dateBadgeBg: "bg-orange-50",
    dateBadgeText: "text-orange-700",
  },
];

export default function TimetablePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // TanStack Query integration
  const { data: apiData, isLoading } = usePublicTimetables(searchQuery, "", page, 20);

  const entriesFromApi = apiData?.entries ?? [];
  const totalCount = apiData?.pagination?.total ?? (entriesFromApi.length > 0 ? entriesFromApi.length : FALLBACK_PAPERS.length);

  // Format backend API entries into UI papers if available
  const formattedPapers: ExamPaper[] = entriesFromApi.length > 0
    ? entriesFromApi.map((entry, idx) => {
        const d = entry.scheduledAt ? new Date(entry.scheduledAt) : new Date();
        const monthStr = d.toLocaleString("default", { month: "short" });
        const dayStr = String(d.getDate());
        const dayOfWeekStr = d.toLocaleString("default", { weekday: "short" }).toUpperCase();
        const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        const colors = [
          { colorClass: "border-blue-200 bg-blue-50/40", dateBadgeBg: "bg-[#0C60FC]", dateBadgeText: "text-white" },
          { colorClass: "border-slate-200 bg-white", dateBadgeBg: "bg-slate-100", dateBadgeText: "text-slate-900" },
          { colorClass: "border-slate-200 bg-white", dateBadgeBg: "bg-violet-50", dateBadgeText: "text-violet-700" },
          { colorClass: "border-slate-200 bg-white", dateBadgeBg: "bg-[#E9FFD3]", dateBadgeText: "text-emerald-800" },
        ];
        const style = colors[idx % colors.length];

        return {
          id: entry._id || String(idx),
          dept: entry.courseCode ? entry.courseCode.split(" ")[0].toLowerCase() : "cs",
          code: entry.courseCode || "EXAM",
          title: entry.courseName || entry.label || "Course Exam",
          date: dayOfWeekStr,
          month: monthStr,
          dayNum: dayStr,
          time: timeStr,
          duration: `${entry.durationMinutes || 120} MIN`,
          venue: entry.venues && entry.venues.length > 0 ? entry.venues.map((v) => v.venue).join(", ") : "Main Campus",
          ...style,
        };
      })
    : FALLBACK_PAPERS;

  const displayPapers = formattedPapers.filter((paper) => {
    const q = searchQuery.trim().toLowerCase();
    return (
      !q ||
      paper.code.toLowerCase().includes(q) ||
      paper.title.toLowerCase().includes(q) ||
      paper.venue.toLowerCase().includes(q)
    );
  });

  return (
    <div className="overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <LandingHeader />

      <main>
        {/* Hero Section */}
        <section className="soft-grid relative overflow-hidden px-5 pb-16 pt-32 lg:pb-24 lg:pt-44">
          <div className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-violet-100/70 blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_.85fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-2 text-xs font-bold text-blue-700 shadow-sm">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  Synced with UG timetable
                </div>
                <h1 className="display mt-6 max-w-3xl text-balance text-5xl font-bold leading-[1.03] tracking-[-.045em] text-slate-950 sm:text-6xl lg:text-7xl">
                  Find your paper.<br />
                  <span className="text-[#0C60FC]">Know where to be.</span>
                </h1>
                <p className="hand mt-3 max-w-xl text-2xl text-[#0C60FC]">
                  no more blurry PDFs in the group chat ↓
                </p>
                <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
                  The whole University of Ghana exam schedule, typed out properly and searchable. Type your course code and you&apos;ll have your date, time and room in a second — free, no account needed.
                </p>
              </div>

              <div className="relative">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-3xl font-bold">{totalCount}</p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">papers searchable</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-3xl font-bold">46</p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">departments covered</p>
                  </div>
                  <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={QUBI_WAVE_SRC} alt="Qubi" className="h-16 w-16 shrink-0 object-contain" />
                    <div>
                      <p className="hand text-lg leading-none text-[#0C60FC]">I&apos;ll find it for you!</p>
                      <p className="mt-1 text-[11px] font-semibold text-slate-500">Try a course code like DCIT 205.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Box */}
            <form onSubmit={(e) => e.preventDefault()} className="mt-10 flex max-w-4xl flex-col gap-2 rounded-[22px] border border-slate-200 bg-white p-2 shadow-[0_18px_60px_rgba(15,23,42,.1)] sm:flex-row" style={{ borderRadius: "22px" }}>
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[#0C60FC]" />
                ) : (
                  <Search className="h-5 w-5 text-slate-400" />
                )}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a course code or title — e.g. DCIT 205"
                  className="min-w-0 flex-1 bg-transparent py-3.5 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="squishy rounded-xl bg-[#0C60FC] px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Search
              </button>
            </form>

            {/* Quick Filter Chips */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500">
              <span>Popular right now:</span>
              {["DCIT", "MATH", "UGRC", "BUSA"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchQuery(tag)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 transition hover:border-blue-300 hover:text-[#0C60FC]"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Value Props Bar */}
        <section className="border-y border-slate-200 bg-[#F7F9FC] px-5 py-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-2"><b className="text-emerald-500">✓</b> Free to use, always</span>
            <span className="flex items-center gap-2"><b className="text-emerald-500">✓</b> No login required</span>
            <span className="flex items-center gap-2"><b className="text-emerald-500">✓</b> Synced with UG timetable</span>
            <span className="flex items-center gap-2"><b className="text-emerald-500">✓</b> Verified against official source</span>
          </div>
        </section>

        {/* Timetable Results Grid */}
        <section className="px-5 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,.08)] sm:p-7" style={{ borderRadius: "30px" }}>
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="hand text-2xl text-[#0C60FC]">here&apos;s the list ↓</p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                    Semester one, all in one place
                  </h2>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Showing {displayPapers.length} papers · times in GMT
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/signup"
                    className="squishy rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#0C60FC]"
                  >
                    Tell me if it changes →
                  </Link>
                </div>
              </div>

              {isLoading ? (
                <div className="py-16 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#0C60FC]" />
                  <p className="mt-3 text-xs font-bold text-slate-400">Fetching the latest schedule…</p>
                </div>
              ) : displayPapers.length === 0 ? (
                <p className="py-12 text-center text-sm font-semibold text-slate-400">
                  Nothing matched that search. Try searching just the course code (e.g. &quot;DCIT&quot;).
                </p>
              ) : (
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {displayPapers.map((paper) => (
                    <article
                      key={paper.id}
                      className={`paper rounded-2xl border p-4 transition sm:p-5 ${paper.colorClass}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl ${paper.dateBadgeBg} ${paper.dateBadgeText}`}>
                          <span className="text-[9px] font-bold uppercase opacity-80">{paper.month}</span>
                          <b className="text-xl leading-none">{paper.dayNum}</b>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between gap-2">
                            <div>
                              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#0C60FC]">
                                {paper.date} · {paper.time}
                              </p>
                              <h3 className="mt-1 text-sm font-extrabold text-slate-900">
                                {paper.code} · {paper.title}
                              </h3>
                            </div>
                            <span className="h-fit rounded-full bg-white px-2 py-1 text-[9px] font-bold text-slate-500 shadow-sm">
                              {paper.duration}
                            </span>
                          </div>
                          <p className="mt-3 text-[11px] font-semibold text-slate-500">
                            ⌖ {paper.venue}
                          </p>
                          <Link
                            href="/signup"
                            className="mt-3 inline-flex items-center gap-1 text-[10px] font-extrabold text-[#0C60FC] hover:underline"
                          >
                            <Plus className="h-3 w-3" /> Remind me
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* How It Works Steps */}
        <section className="bg-[#F7F9FC] px-5 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="hand text-3xl text-[#0C60FC]">it&apos;s pretty simple ✦</p>
              <h2 className="mt-2 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                Three steps and you&apos;re sorted.
              </h2>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              <article className="rounded-[28px] border border-slate-200 bg-[#FFF8EF] p-7" style={{ borderRadius: "28px" }}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFE6CC] text-lg font-extrabold">
                  1
                </div>
                <h3 className="mt-8 text-xl font-bold">Type your course code</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  DCIT, MATH, UGRC — whatever you&apos;re sitting. Partial codes work fine.
                </p>
              </article>
              <article className="rounded-[28px] border border-slate-200 bg-[#F1F6FF] p-7" style={{ borderRadius: "28px" }}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-200 text-lg font-extrabold">
                  2
                </div>
                <h3 className="mt-8 text-xl font-bold">Check the day and room</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Date, start time, how long it runs and where to show up. That&apos;s it.
                </p>
              </article>
              <article className="rounded-[28px] border border-slate-200 bg-[#F7F4FF] p-7" style={{ borderRadius: "28px" }}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DED7FF] text-lg font-extrabold">
                  3
                </div>
                <h3 className="mt-8 text-xl font-bold">Save it if you like</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Keep only your papers and we&apos;ll nudge you when something changes.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="px-5 pb-20 pt-10">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-[#0C60FC] px-6 py-16 text-center text-white sm:px-12" style={{ borderRadius: "36px" }}>
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#DFFF61]/25 blur-3xl" />
            <div className="relative">
              <h2 className="text-balance text-4xl font-bold sm:text-5xl">
                You found the date. Now be ready for it.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-blue-100">
                Qz builds the revision around your exam dates, so the last two weeks feel calm instead of frantic.
              </p>
              <Link
                href="/signup"
                className="squishy mt-8 inline-flex rounded-2xl bg-white px-7 py-4 text-sm font-extrabold text-[#0C60FC] transition hover:-translate-y-0.5"
              >
                Start free with Qz →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
      <MobileNav />
    </div>
  );
}
