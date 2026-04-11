import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useSocket } from "@/hooks/common/use-socket";
import { EVENT_NAMES } from "@/types/socket-events";

type ApiData<T> = { data: T };

export interface TriggerPublicQuizGenerationPayload {
  courseId: string;
  numberOfQuestions?: number;
}

export interface TriggerPublicQuizGenerationResult {
  success: boolean;
  message: string;
  jobsQueued: number;
  generationId: string;
  details?: Array<{
    materialId: string;
    materialTitle: string;
    sessionId: string;
  }>;
}

export interface PublicQuizGenerationProgress {
  generationId: string;
  courseId: string;
  completedMaterials: number;
  totalMaterials: number;
  currentMaterial?: string;
  percentComplete: number;
  materialUpdates: Record<
    string,
    {
      status: "pending" | "processing" | "completed" | "failed";
      questionsGenerated?: number;
      quizId?: string;
      error?: string;
    }
  >;
}

type MaterialStartedEvent = {
  generationId: string;
  courseId: string;
  materialId: string;
  materialTitle: string;
  status: string;
  stage?: string;
  message?: string;
};

type LectureStartedEvent = {
  generationId: string;
  courseId: string;
  lectureTitle: string;
  lectureIndex: number;
  totalLectures: number;
  stage?: string;
  message?: string;
};

type MaterialCompletedEvent = {
  generationId: string;
  courseId: string;
  materialId: string;
  lectureTitle: string;
  questionsGenerated: number;
  quizId?: string;
  status: string;
  stage?: string;
  message?: string;
};

type MaterialFailedEvent = {
  generationId: string;
  courseId: string;
  lectureTitle: string;
  error?: string;
  stage?: string;
  message?: string;
};

export type PublicQuizExecutionStep = {
  id: string;
  label: string;
  detail?: string;
  status: "pending" | "processing" | "completed" | "failed";
};

export const useTriggerPublicQuizGeneration = () => {
  const { socket } = useSocket();
  const currentCourseIdRef = useRef<string>("");
  const [progress, setProgress] = useState<PublicQuizGenerationProgress | null>(
    null,
  );
  const [executionSteps, setExecutionSteps] = useState<
    PublicQuizExecutionStep[]
  >([]);
  const [materialUpdates, setMaterialUpdates] = useState<
    Record<
      string,
      {
        status: "pending" | "processing" | "completed" | "failed";
        questionsGenerated?: number;
        quizId?: string;
        error?: string;
      }
    >
  >({});

  useEffect(() => {
    if (!socket || !progress?.generationId) return;

    const setStep = (
      id: string,
      update: Partial<PublicQuizExecutionStep> & { label?: string },
    ) => {
      setExecutionSteps((prev) => {
        const next = [...prev];
        const index = next.findIndex((step) => step.id === id);
        const current =
          index >= 0
            ? next[index]
            : {
                id,
                label: update.label || id,
                status: "pending" as const,
              };

        const merged = { ...current, ...update } as PublicQuizExecutionStep;
        if (index >= 0) next[index] = merged;
        else next.push(merged);
        return next.slice(-12);
      });
    };

    const appendStep = (step: PublicQuizExecutionStep) => {
      setExecutionSteps((prev) => [...prev, step].slice(-12));
    };

    setStep("outline", {
      label: "Outline Discovery",
      status: "processing",
      detail: "Waiting for the material outline to be extracted.",
    });
    setStep("parallel", {
      label: "Parallel Topic Agents",
      status: "pending",
      detail: "Topic-level workers will start after the outline is ready.",
    });
    setStep("persist", {
      label: "Persist Quiz",
      status: "pending",
      detail: "Saving the finished public quiz and question bank.",
    });

    // Listen for material processing started
    socket.on(
      EVENT_NAMES.PUBLIC_QUIZ_GENERATION_STARTED,
      (data: {
        generationId: string;
        courseId: string;
        totalLectures: number;
        questionsPerLecture: number;
        stage?: string;
        message?: string;
      }) => {
        if (data.generationId !== progress.generationId) return;

        setStep("outline", {
          status: "completed",
          detail: data.message || "Outline extracted.",
        });
        setStep("parallel", {
          status: "processing",
          detail: `${data.totalLectures} lecture sections mapped. Parallel topic agents are starting.`,
        });
        appendStep({
          id: `started-${data.generationId}`,
          label: "Outline discovered",
          detail: `${data.totalLectures} lecture sections identified.`,
          status: "completed",
        });
      },
    );

    socket.on(
      EVENT_NAMES.PUBLIC_QUIZ_GENERATION_PROGRESS,
      (data: {
        generationId: string;
        courseId: string;
        currentLecture?: string;
        currentTopic?: string;
        completedTopics?: number;
        totalTopics?: number;
        percentComplete: number;
        stage?: string;
        message?: string;
      }) => {
        if (data.generationId !== progress.generationId) return;

        if (data.stage === "topic_generation_started" && data.currentLecture) {
          appendStep({
            id: `topic-start:${data.currentLecture}:${data.currentTopic || ""}:${data.completedTopics || 0}`,
            label: "Parallel topic agent started",
            detail:
              data.message ||
              `${data.currentLecture}${data.currentTopic ? ` → ${data.currentTopic}` : ""}`,
            status: "processing",
          });
          setStep("parallel", {
            status: "processing",
            detail:
              data.message ||
              `${data.completedTopics || 0}/${data.totalTopics || 0} topic agents running.`,
          });
        }

        if (
          data.stage === "topic_generation_completed" &&
          data.currentLecture
        ) {
          appendStep({
            id: `topic-done:${data.currentLecture}:${data.currentTopic || ""}:${data.completedTopics || 0}`,
            label: "Parallel topic agent completed",
            detail:
              data.message ||
              `${data.currentLecture}${data.currentTopic ? ` → ${data.currentTopic}` : ""}`,
            status: "completed",
          });
        }

        if (data.stage === "lectures_assembled") {
          setStep("parallel", {
            status: "completed",
            detail: data.message || "Parallel topic agents finished.",
          });
          setStep("persist", {
            status: "processing",
            detail: data.message || "Persisting the final public quiz.",
          });
          appendStep({
            id: `assembled-${data.generationId}`,
            label: "Lecture structure assembled",
            detail:
              data.message ||
              "Lecture structure assembled from parallel agents.",
            status: "completed",
          });
        }
      },
    );

    // Listen for lecture processing started
    socket.on(
      EVENT_NAMES.PUBLIC_QUIZ_GENERATION_LECTURE_STARTED,
      (data: LectureStartedEvent) => {
        if (data.generationId !== progress.generationId) return;

        appendStep({
          id: `lecture-start:${data.lectureIndex}`,
          label: "Lecture discovered",
          detail: data.message || `${data.lectureTitle} queued for generation.`,
          status: "processing",
        });

        setMaterialUpdates((prev) => ({
          ...prev,
          [data.lectureTitle]: { status: "processing" },
        }));
      },
    );

    // Listen for material completed
    socket.on(
      EVENT_NAMES.PUBLIC_QUIZ_GENERATION_LECTURE_COMPLETED ||
        "public_quiz:generation:lecture:completed",
      (data: MaterialCompletedEvent) => {
        if (data.generationId !== progress.generationId) return;

        const materialTitle = data.lectureTitle;
        appendStep({
          id: `lecture-done:${data.lectureTitle}`,
          label: "Lecture generated",
          detail:
            data.message ||
            `${materialTitle} completed with ${data.questionsGenerated} questions.`,
          status: "completed",
        });

        setMaterialUpdates((prev) => ({
          ...prev,
          [materialTitle]: {
            status: "completed",
            questionsGenerated: data.questionsGenerated,
            quizId: data.quizId,
          },
        }));

        // Update overall progress
        setProgress((prev) => {
          if (!prev) return null;
          const completedCount = Object.values({
            ...prev.materialUpdates,
            [materialTitle]: { status: "completed" } as const,
          }).filter(
            (m): m is { status: "completed" } =>
              (m as { status: string }).status === "completed",
          ).length;

          const newPercent = Math.round(
            (completedCount / prev.totalMaterials) * 100,
          );

          return {
            ...prev,
            completedMaterials: completedCount,
            percentComplete: newPercent,
            currentMaterial: undefined,
          };
        });
      },
    );

    // Listen for material failed
    socket.on(
      EVENT_NAMES.PUBLIC_QUIZ_GENERATION_LECTURE_FAILED ||
        "public_quiz:generation:lecture:failed",
      (data: MaterialFailedEvent) => {
        if (data.generationId !== progress.generationId) return;

        const materialTitle = data.lectureTitle;
        appendStep({
          id: `lecture-failed:${materialTitle}`,
          label: "Lecture failed",
          detail: data.error || data.message || "Generation failed.",
          status: "failed",
        });
        setMaterialUpdates((prev) => ({
          ...prev,
          [materialTitle]: { status: "failed", error: data.error },
        }));
      },
    );

    return () => {
      socket.off(EVENT_NAMES.PUBLIC_QUIZ_GENERATION_STARTED);
      socket.off(EVENT_NAMES.PUBLIC_QUIZ_GENERATION_PROGRESS);
      socket.off(EVENT_NAMES.PUBLIC_QUIZ_GENERATION_LECTURE_STARTED);
      socket.off(EVENT_NAMES.PUBLIC_QUIZ_GENERATION_LECTURE_COMPLETED);
      socket.off(EVENT_NAMES.PUBLIC_QUIZ_GENERATION_LECTURE_FAILED);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, progress?.generationId]);

  const mutation = useMutation({
    onMutate: (payload) => {
      currentCourseIdRef.current = payload.courseId;
    },
    mutationFn: async (payload: TriggerPublicQuizGenerationPayload) => {
      const res = await api.post<ApiData<TriggerPublicQuizGenerationResult>>(
        "/admin/learning/public-quizzes/trigger-generation",
        payload,
      );
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      if (data?.generationId) {
        // Initialize progress tracking with materials (not lectures)
        const totalMaterials = data.jobsQueued;

        setProgress({
          generationId: data.generationId,
          courseId: currentCourseIdRef.current,
          completedMaterials: 0,
          totalMaterials,
          percentComplete: 0,
          materialUpdates: {},
        });

        setExecutionSteps([
          {
            id: "queued",
            label: "Generation queued",
            detail: `${totalMaterials} material job${totalMaterials === 1 ? "" : "s"} accepted.`,
            status: "completed",
          },
          {
            id: "outline",
            label: "Outline discovery",
            detail: "Waiting for the AI to extract lecture structure.",
            status: "processing",
          },
          {
            id: "parallel",
            label: "Parallel topic agents",
            detail: "Each lecture will fan out into parallel topic workers.",
            status: "pending",
          },
          {
            id: "persist",
            label: "Persist quiz",
            detail: "Questions, hints, explanations, and tags will be saved.",
            status: "pending",
          },
        ]);

        // Pre-populate materialUpdates with all materials as pending
        const initialMaterials: Record<
          string,
          {
            status: "pending" | "processing" | "completed" | "failed";
            questionsGenerated?: number;
            quizId?: string;
            error?: string;
          }
        > = {};
        if (data.details) {
          data.details.forEach((detail) => {
            initialMaterials[detail.materialTitle] = { status: "pending" };
          });
        }
        setMaterialUpdates(initialMaterials);
      }
    },
  });

  return {
    ...mutation,
    progress,
    materialUpdates,
    executionSteps,
  };
};
