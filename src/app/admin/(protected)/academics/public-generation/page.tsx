"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  ScrollText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Play,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAdminCourses, AdminCourse } from "@/hooks/admin/use-academics";
import {
  useTriggerPublicQuizGeneration,
  TriggerPublicQuizGenerationResult,
  type PublicQuizExecutionStep,
} from "@/hooks/admin";

type GenerationMutationError = {
  message?: string;
};

type LectureStatus = {
  status: "pending" | "processing" | "completed" | "failed";
  questionsGenerated?: number;
  error?: string;
};

export default function PublicGenerationPage() {
  const [courseSearch, setCourseSearch] = useState("");
  const [debouncedCourseSearch, setDebouncedCourseSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedCourseSearch(courseSearch), 300);
    return () => clearTimeout(t);
  }, [courseSearch]);

  const { data: coursesResponse } = useAdminCourses({
    limit: 50,
    search: debouncedCourseSearch,
  });

  const {
    mutate: triggerGeneration,
    isPending,
    progress,
    materialUpdates,
    executionSteps,
  } = useTriggerPublicQuizGeneration();

  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(40);
  const [jobResult, setJobResult] =
    useState<TriggerPublicQuizGenerationResult | null>(null);

  const courses: AdminCourse[] = coursesResponse?.data ?? [];
  const selectedCourse = courses.find((c) => c._id === selectedCourseId);

  const handleTrigger = async () => {
    if (!selectedCourseId) {
      toast.error("Please select a course");
      return;
    }

    const finalQuestionCount = Math.max(35, Math.min(45, questionCount));

    triggerGeneration(
      {
        courseId: selectedCourseId,
        numberOfQuestions: finalQuestionCount,
      },
      {
        onSuccess: (data: TriggerPublicQuizGenerationResult) => {
          if (data.success) {
            setJobResult(data);
            toast.success(data.message);
          } else {
            toast.error(data.message || "Failed to trigger generation");
          }
        },
        onError: (error: GenerationMutationError) => {
          toast.error(error?.message || "Failed to trigger generation");
        },
      },
    );
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-block border border-primary/60 px-2 py-1 mb-3 bg-primary/5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
            Quiz Generation
          </span>
        </div>
        <h1 className="text-3xl font-mono font-bold tracking-[0.2em] uppercase">
          Public Quiz Generation
        </h1>
        <p className="text-xs font-mono text-muted-foreground mt-1 tracking-widest uppercase">
          Trigger on-demand comprehensive quiz generation for courses using AI
          synthesis across all materials
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <div className="border border-border/50 bg-card/40 p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold tracking-widest uppercase">
              Select Course
            </label>
            <Combobox
              value={selectedCourseId}
              onValueChange={(value) => {
                const id = String(value || "");
                setSelectedCourseId(id);
                const selected = courses.find((course) => course._id === id);
                setCourseSearch(
                  selected ? `${selected.code} - ${selected.title || ""}` : "",
                );
              }}
            >
              <ComboboxInput
                placeholder="Search course..."
                className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors h-8.5 uppercase tracking-widest"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                disabled={isPending || progress !== null}
              />
              <ComboboxContent className="font-mono border-border/40">
                <ComboboxEmpty className="font-mono text-[10px] uppercase p-2">
                  No courses found
                </ComboboxEmpty>
                <ComboboxList className="max-h-60 no-scrollbar">
                  {courses.map((course) => (
                    <ComboboxItem
                      key={course._id}
                      value={course._id}
                      className="text-[10px] uppercase tracking-tighter"
                      disabled={isPending || progress !== null}
                    >
                      <span className="font-bold text-primary mr-2">
                        {course.code}
                      </span>
                      <span className="truncate">{course.title}</span>
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          {selectedCourse && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="border-l-2 border-primary/40 pl-4 py-2 space-y-1"
            >
              <p className="text-xs font-mono text-muted-foreground">
                <strong>Course:</strong> {selectedCourse.code}
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                <strong>Title:</strong> {selectedCourse.title}
              </p>
            </motion.div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold tracking-widest uppercase">
                Questions Per Lecture
              </label>
              <span className="text-sm font-mono font-bold text-primary">
                {questionCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="range"
                min="35"
                max="45"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                disabled={isPending || progress !== null}
                className="flex-1 h-2"
              />
            </div>
            <p className="text-[10px] font-mono text-muted-foreground/60">
              Range: 35-45 questions (recommended: 40)
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTrigger}
            disabled={!selectedCourseId || isPending || progress !== null}
            className={cn(
              "w-full border font-mono text-xs font-bold tracking-widest uppercase py-2 px-3 transition-all duration-200",
              isPending || !selectedCourseId || progress
                ? "border-border/30 bg-card/20 text-muted-foreground/50 cursor-not-allowed"
                : "border-primary/50 bg-primary/5 hover:border-primary hover:bg-primary/10 text-primary hover:text-primary",
            )}
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="size-3 animate-spin" />
                Triggering...
              </div>
            ) : progress ? (
              <div className="flex items-center justify-center gap-2">
                <Play className="size-3" />
                Generation In Progress
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Zap className="size-3" />
                Trigger Generation
              </div>
            )}
          </motion.button>
        </div>

        {progress && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border border-primary/30 bg-primary/5 p-5 space-y-5"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono font-bold uppercase tracking-widest">
                  Overall Progress
                </p>
                <span className="text-sm font-mono font-bold text-primary">
                  {progress.percentComplete.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-background/40 border border-border/30 h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentComplete}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-[10px] font-mono text-muted-foreground">
                Completed {progress.completedMaterials} of{" "}
                {progress.totalMaterials} materials
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                Deterministic Execution
              </p>
              <div className="space-y-2 border border-border/30 bg-card/30 p-3 max-h-72 overflow-y-auto">
                {executionSteps.map((step: PublicQuizExecutionStep) => (
                  <div key={step.id} className="flex items-start gap-3">
                    {step.status === "processing" && (
                      <Loader2 className="size-3 text-primary animate-spin shrink-0 mt-0.5" />
                    )}
                    {step.status === "completed" && (
                      <CheckCircle2 className="size-3 text-green-500 shrink-0 mt-0.5" />
                    )}
                    {step.status === "failed" && (
                      <AlertCircle className="size-3 text-destructive shrink-0 mt-0.5" />
                    )}
                    {step.status === "pending" && (
                      <div className="size-3 border border-muted-foreground/30 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-foreground truncate">
                        {step.label}
                      </p>
                      {step.detail && (
                        <p className="text-[9px] font-mono text-muted-foreground/70 leading-relaxed">
                          {step.detail}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {Object.entries(materialUpdates).length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                  Material Status
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Object.entries(materialUpdates).map(
                    ([materialName, status]) => {
                      const typedStatus = status as LectureStatus;
                      return (
                        <div
                          key={materialName}
                          className="flex items-center gap-2 border border-border/30 bg-card/40 p-2"
                        >
                          {typedStatus.status === "processing" && (
                            <Loader2 className="size-3 text-blue-500 animate-spin shrink-0" />
                          )}
                          {typedStatus.status === "completed" && (
                            <CheckCircle2 className="size-3 text-green-500 shrink-0" />
                          )}
                          {typedStatus.status === "failed" && (
                            <AlertCircle className="size-3 text-destructive shrink-0" />
                          )}
                          {typedStatus.status === "pending" && (
                            <div className="size-3 border border-muted-foreground/30 rounded-full shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-mono text-muted-foreground truncate">
                              {materialName}
                            </p>
                            {typedStatus.questionsGenerated && (
                              <p className="text-[9px] font-mono text-muted-foreground/60">
                                {typedStatus.questionsGenerated} questions
                              </p>
                            )}
                            {typedStatus.error && (
                              <p className="text-[9px] font-mono text-destructive">
                                {typedStatus.error}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {jobResult && !progress && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "border p-5 space-y-3",
              jobResult.success
                ? "border-green-500/30 bg-green-500/5"
                : "border-destructive/30 bg-destructive/5",
            )}
          >
            <div className="flex items-start gap-3">
              {jobResult.success ? (
                <CheckCircle2 className="size-4 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                <p
                  className={cn(
                    "text-xs font-mono font-bold uppercase tracking-widest",
                    jobResult.success ? "text-green-500" : "text-destructive",
                  )}
                >
                  {jobResult.message}
                </p>
                {jobResult.success && jobResult.jobsQueued > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono text-muted-foreground">
                      Total Jobs Queued:{" "}
                      <span className="font-bold">{jobResult.jobsQueued}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <div className="border border-border/50 bg-card/20 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <ScrollText className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-2 text-xs font-mono">
              <p className="font-bold uppercase tracking-widest">
                How it works
              </p>
              <ul className="space-y-1 text-muted-foreground/80 list-disc list-inside">
                <li>Finds upcoming exams for the selected course</li>
                <li>Matches published library materials by course code/name</li>
                <li>Extracts lecture/topic outline before generation starts</li>
                <li>Starts parallel topic agents per lecture section</li>
                <li>
                  Streams deterministic execution and progress in real time
                </li>
                <li>
                  Generates objective-heavy questions with hints and
                  explanations
                </li>
                <li>
                  Persists questions, lectures, tags, and publishes the public
                  quiz
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
