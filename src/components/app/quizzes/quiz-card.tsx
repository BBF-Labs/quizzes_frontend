"use client";

import Link from "next/link";
import { ArrowRight, Trash2 } from "lucide-react";
import { format } from "date-fns";

export interface QuizCardProps {
  id: string;
  title: string;
  description?: string;
  href?: string;
  takeHref?: string;
  courseTitle?: string;
  courseCode?: string;
  questionCount: number;
  lectureCount?: number;
  passingScore?: number;
  averageScore?: number;
  tags?: string[];
  createdAt?: string;
  date?: string;
  codeBg?: string;
  codeText?: string;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

function formatDateStr(iso?: string, fallbackDate?: string): string {
  if (fallbackDate) return fallbackDate;
  if (!iso) return "JUL 2026";
  try {
    return format(new Date(iso), "MMM d, yyyy").toUpperCase();
  } catch {
    return iso.toUpperCase();
  }
}

const CODE_BG_COLOR_MAP: Record<string, { bg: string; text: string }> = {
  DCIT: { bg: "bg-blue-50", text: "text-blue-700" },
  MATH: { bg: "bg-purple-50", text: "text-purple-700" },
  UGRC: { bg: "bg-emerald-50", text: "text-emerald-700" },
  STAT: { bg: "bg-amber-50", text: "text-amber-700" },
  ECON: { bg: "bg-rose-50", text: "text-rose-700" },
  CBAS: { bg: "bg-cyan-50", text: "text-cyan-700" },
};

function getCodeStyles(code: string) {
  const prefix = code.split(" ")[0] || "";
  return (
    CODE_BG_COLOR_MAP[prefix] ?? { bg: "bg-blue-50", text: "text-blue-700" }
  );
}

export function QuizCard({
  id,
  title,
  description,
  href,
  takeHref,
  courseTitle,
  courseCode,
  questionCount,
  lectureCount = 1,
  passingScore = 70,
  createdAt,
  date,
  codeBg,
  codeText,
  onDelete,
  isDeleting,
}: QuizCardProps) {
  const isFallback = !id || (id.includes("-") && id.length < 20); // placeholder IDs like "dcit-407"
  const targetHref = href || `/quizzes/${id}`;
  const code =
    courseCode ||
    courseTitle ||
    title.match(/([A-Z]{3,4}\s*\d{3})/i)?.[1]?.toUpperCase() ||
    "QUIZ";
  const styles = getCodeStyles(code);
  const badgeBg = codeBg || styles.bg;
  const badgeText = codeText || styles.text;
  const displayDate = formatDateStr(createdAt, date);

  return (
    <article
      className="play-card group relative flex flex-col justify-between rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300"
      style={{ borderRadius: "28px" }}
    >
      {/* Delete button (optional) */}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(id);
          }}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-rose-600 transition-colors disabled:opacity-20 z-10"
          aria-label="Delete quiz"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      <div>
        {/* Code Pill & Date */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${badgeBg} ${badgeText}`}
          >
            {code}
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {displayDate}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-4 text-xl font-extrabold tracking-tight text-slate-950">
          {title}
        </h3>

        {/* Description */}
        <p className="mt-1.5 text-xs font-semibold leading-relaxed text-slate-500 line-clamp-2 min-h-[36px]">
          {description ||
            "Curated course quiz built from official lecture material."}
        </p>

        {/* 3 Metric Boxes */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-slate-50 p-3 text-center border border-slate-100">
            <b className="block text-lg font-black text-slate-950 leading-tight">
              {questionCount}
            </b>
            <span className="mt-0.5 block text-[9px] font-extrabold tracking-wider text-slate-400 uppercase">
              QUESTIONS
            </span>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3 text-center border border-slate-100">
            <b className="block text-lg font-black text-slate-950 leading-tight">
              {lectureCount}
            </b>
            <span className="mt-0.5 block text-[9px] font-extrabold tracking-wider text-slate-400 uppercase">
              {lectureCount === 1 ? "LECTURE" : "LECTURES"}
            </span>
          </div>

          <div className="rounded-2xl bg-[#F4FEE4] p-3 text-center border border-lime-200/60">
            <b className="block text-lg font-black text-emerald-800 leading-tight">
              {passingScore}%
            </b>
            <span className="mt-0.5 block text-[9px] font-extrabold tracking-wider text-emerald-700/80 uppercase">
              TO PASS
            </span>
          </div>
        </div>
      </div>

      {/* CTA Action */}
      {isFallback ? (
        <div className="mt-6 flex w-full items-center justify-center rounded-2xl bg-slate-100 px-5 py-3.5 text-xs font-extrabold text-slate-400 cursor-not-allowed">
          <span>Coming soon</span>
        </div>
      ) : (
        <Link
          href={targetHref}
          className="squishy mt-6 flex w-full items-center justify-between rounded-2xl bg-[#0A0D14] px-5 py-3.5 text-xs font-extrabold text-white transition hover:bg-[#0C60FC] hover:shadow-md"
        >
          <span>Start quiz</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </article>
  );
}
