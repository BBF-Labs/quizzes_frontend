"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Share2,
  Printer,
  CheckCircle2,
  BookOpen,
  Loader2,
  Layers,
  Compass,
  FileText,
  Lightbulb,
} from "lucide-react";
import { useApp } from "@/hooks/app/use-app-queries";
import {
  useGenerateCourseSummary,
  useAppMaterials,
} from "@/hooks/app/use-app-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface CourseSummaryViewProps {
  sessionId?: string;
  userName?: string;
  courseTitle?: string;
}

export function CourseSummaryView({
  sessionId,
  userName = "Student",
  courseTitle,
}: CourseSummaryViewProps) {
  const router = useRouter();
  const { data: app, isLoading } = useApp(sessionId || "");
  const { data: sessionMaterials } = useAppMaterials(sessionId || "");
  const generateSummaryMutation = useGenerateCourseSummary(sessionId || "");
  const [isGenerating, setIsGenerating] = useState(false);

  const title =
    courseTitle ||
    app?.name ||
    app?.title ||
    "Course Summary";

  // Dedicated CourseSummary document from backend
  const courseSummary = app?.courseSummary;

  // Fallback for previous legacy sessions
  const summaryArtifact = app?.artifacts?.find(
    (a) =>
      a.type === "course_summary" ||
      a.type === "summary" ||
      (a.type === "notes" &&
        (a.title?.toLowerCase().includes("summary") ||
          (a.content as any)?.logicalPillars ||
          (a.content as any)?.keyTakeaways ||
          (a.content as any)?.sections)),
  );

  const completedBlocks = app?.studyPlan?.completedBlocks ?? 0;
  const totalBlocks = app?.studyPlan?.totalBlocks ?? 0;

  const hasMaterials =
    (Array.isArray(sessionMaterials) && sessionMaterials.length > 0) ||
    (Array.isArray(app?.materials) && app.materials.length > 0) ||
    (Array.isArray(app?.materialIds) && app.materialIds.length > 0);

  const formattedDate = courseSummary?.updatedAt
    ? new Date(courseSummary.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : summaryArtifact?.updatedAt
    ? new Date(summaryArtifact.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : app?.startedAt
    ? new Date(app.startedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${title} - Summary`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Summary link copied to clipboard");
      }
    } catch {
      // Ignored if cancelled
    }
  };

  const handleGenerateSummary = async () => {
    if (!sessionId || !hasMaterials) return;
    try {
      setIsGenerating(true);
      await generateSummaryMutation.mutateAsync();
      toast.success("Course summary synthesis job queued! It will update shortly.");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to trigger summary generation";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const chapters = app?.studyPlan?.chapters || [];

  // Parse structured summary content
  const rawContent = courseSummary || summaryArtifact?.content;
  let parsedContent: any = rawContent;
  if (typeof rawContent === "string") {
    try {
      parsedContent = JSON.parse(rawContent);
    } catch {
      parsedContent = rawContent;
    }
  }

  const hasStructuredFields =
    typeof parsedContent === "object" &&
    parsedContent !== null &&
    (Array.isArray(parsedContent.keyTakeaways) ||
      Array.isArray(parsedContent.logicalPillars) ||
      Array.isArray(parsedContent.logicalOverview) ||
      Array.isArray(parsedContent.topicDeepDives) ||
      Array.isArray(parsedContent.sections) ||
      Boolean(parsedContent.overview));

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-8 space-y-8 antialiased pb-32">
      {/* Top Title & Metadata */}
      <div className="space-y-3 border-b border-slate-200/70 pb-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-950 tracking-tight">
              Summary
            </h1>
            {totalBlocks > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>
                  {completedBlocks}/{totalBlocks} blocks
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerateSummary}
              disabled={isGenerating || !sessionId || !hasMaterials}
              title={
                !hasMaterials
                  ? "Upload study materials to synthesize a course summary"
                  : "Synthesize / update course summary"
              }
              className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0C60FC]" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Update</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
              title="Share summary"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
              title="Print summary"
            >
              <Printer className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <p>Last updated {formattedDate}</p>
          <p className="font-sans font-medium text-slate-600 truncate max-w-xs">{title}</p>
        </div>
      </div>

      {/* Main Content */}
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {summaryArtifact && hasStructuredFields ? (
          /* Render parsed editorial structured summary */
          <div className="space-y-8">
            {/* Overview / Introduction */}
            {parsedContent.overview && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Overview</span>
                </div>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-serif">
                  {parsedContent.overview}
                </p>
              </div>
            )}

            {/* Key Takeaways */}
            {Array.isArray(parsedContent.keyTakeaways) &&
              parsedContent.keyTakeaways.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <span>Key Takeaways</span>
                  </div>
                  <div className="space-y-2.5">
                    {parsedContent.keyTakeaways.map((takeaway: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-2xl bg-amber-50/50 border border-amber-200/60 p-3.5 shadow-2xs"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200/70 text-amber-900 text-xs font-bold font-mono">
                          {idx + 1}
                        </span>
                        <p className="text-slate-800 text-xs sm:text-[13px] leading-relaxed font-sans pt-0.5">
                          {takeaway}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Logical Pillars */}
            {(Array.isArray(parsedContent.logicalPillars) ||
              Array.isArray(parsedContent.logicalOverview)) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <Compass className="h-4 w-4 text-indigo-500" />
                  <span>Logical Pillars & Architecture</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {(
                    parsedContent.logicalPillars ||
                    parsedContent.logicalOverview ||
                    []
                  ).map((pillar: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-bold text-indigo-600 font-mono">
                          {pillar.pillarNumber || idx + 1}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm font-sans">
                          {pillar.title}
                        </h3>
                      </div>
                      <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed pl-7 font-sans">
                        {pillar.description ||
                          (Array.isArray(pillar.topics)
                            ? pillar.topics.join(", ")
                            : "")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topic Deep Dives */}
            {Array.isArray(parsedContent.topicDeepDives) &&
              parsedContent.topicDeepDives.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                    <Layers className="h-4 w-4 text-slate-700" />
                    <span>Topic Deep Dives</span>
                  </div>
                  <div className="space-y-3">
                    {parsedContent.topicDeepDives.map((deepDive: any, idx: number) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 space-y-1.5 shadow-2xs"
                      >
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base font-serif">
                          {deepDive.topic || deepDive.title}
                        </h4>
                        <p className="text-slate-700 text-xs sm:text-[13px] leading-relaxed font-sans">
                          {deepDive.content || deepDive.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Sections */}
            {Array.isArray(parsedContent.sections) &&
              parsedContent.sections.length > 0 && (
                <div className="space-y-4">
                  {parsedContent.sections.map((sec: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-2 shadow-2xs"
                    >
                      {sec.title && (
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base font-serif">
                          {sec.title}
                        </h3>
                      )}
                      {sec.body && (
                        <div className="prose prose-slate max-w-none text-slate-700 text-xs sm:text-[13px] leading-relaxed font-sans">
                          <ReactMarkdown>{sec.body}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>
        ) : summaryArtifact ? (
          /* Render raw markdown summary */
          <div className="prose prose-slate max-w-none text-slate-800 font-serif leading-relaxed text-sm sm:text-base">
            {typeof summaryArtifact.content === "string" ? (
              <ReactMarkdown>{summaryArtifact.content}</ReactMarkdown>
            ) : typeof (summaryArtifact.content as any)?.markdown === "string" ? (
              <ReactMarkdown>{(summaryArtifact.content as any).markdown}</ReactMarkdown>
            ) : (
              <p className="text-slate-600 text-sm leading-relaxed">
                {String(summaryArtifact.content)}
              </p>
            )}
          </div>
        ) : (
          /* Dynamic session overview from study plan and session state */
          <div className="space-y-6">
            <div className="prose prose-slate max-w-none text-slate-800 font-serif leading-relaxed text-sm sm:text-base space-y-4">
              <p className="leading-relaxed">
                The course <strong>{title}</strong> is designed to build deep conceptual mastery and practical competence across all core learning objectives through active recall and structured knowledge synthesis.
              </p>

              {chapters.length > 0 ? (
                <div className="pt-4 space-y-4">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-950 tracking-tight">
                    Logical Course Modules
                  </h2>

                  <div className="space-y-4 font-sans text-xs sm:text-sm text-slate-700 leading-normal pl-1">
                    {chapters.map((ch, idx) => (
                      <div
                        key={ch.chapterId || idx}
                        className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-4 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold font-mono">
                            {ch.chapterNumber || idx + 1}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base font-serif">
                            {ch.title}
                          </h3>
                        </div>
                        {ch.description && (
                          <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed">
                            {ch.description}
                          </p>
                        )}
                        {ch.goals && ch.goals.length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-1.5">
                            {ch.goals.map((g, gIdx) => (
                              <span
                                key={g.goalId || gIdx}
                                className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200/80 px-2 py-0.5 text-[11px] font-medium text-slate-700 shadow-2xs"
                              >
                                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                                <span>{g.title}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 mx-auto">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    No summary generated yet
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Z can synthesize all your course materials, documents, and chat notes into an editorial course summary with logical pillars and deep dives.
                  </p>
                  <div className="pt-2 flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateSummary}
                      disabled={isGenerating || !sessionId || !hasMaterials}
                      title={
                        !hasMaterials
                          ? "Upload study materials to synthesize a course summary"
                          : undefined
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Synthesizing summary...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                          <span>Generate Summary with Z</span>
                        </>
                      )}
                    </button>
                    {!hasMaterials && (
                      <p className="text-[11px] text-amber-600 font-medium">
                        Upload at least one study material in the session to synthesize a course summary.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.article>
    </div>
  );
}
