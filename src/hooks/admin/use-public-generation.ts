import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
};

type MaterialCompletedEvent = {
  generationId: string;
  courseId: string;
  materialId: string;
  lectureTitle: string;
  questionsGenerated: number;
  quizId?: string;
  status: string;
};

type MaterialFailedEvent = {
  generationId: string;
  courseId: string;
  lectureTitle: string;
  error?: string;
};

export const useTriggerPublicQuizGeneration = () => {
  const { socket } = useSocket();
  const [progress, setProgress] = useState<PublicQuizGenerationProgress | null>(
    null,
  );
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
    if (!socket || !progress) return;

    // Listen for material processing started
    socket.on(
      EVENT_NAMES.PUBLIC_QUIZ_GENERATION_LECTURE_STARTED ||
        "public_quiz:generation:lecture:started",
      (data: MaterialStartedEvent) => {
        if (data.generationId !== progress.generationId) return;

        setMaterialUpdates((prev) => ({
          ...prev,
          [data.materialTitle]: { status: "processing" },
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
        setMaterialUpdates((prev) => ({
          ...prev,
          [materialTitle]: { status: "failed", error: data.error },
        }));
      },
    );

    return () => {
      socket.off(EVENT_NAMES.PUBLIC_QUIZ_GENERATION_LECTURE_STARTED);
      socket.off(EVENT_NAMES.PUBLIC_QUIZ_GENERATION_LECTURE_COMPLETED);
      socket.off(EVENT_NAMES.PUBLIC_QUIZ_GENERATION_LECTURE_FAILED);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const mutation = useMutation({
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
          courseId: data.details?.[0]?.materialId || "",
          completedMaterials: 0,
          totalMaterials,
          percentComplete: 0,
          materialUpdates: {},
        });

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
  };
};
