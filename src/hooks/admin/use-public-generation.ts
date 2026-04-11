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
    lectureTitle: string;
    jobId: string;
  }>;
}

export interface PublicQuizGenerationProgress {
  generationId: string;
  courseId: string;
  completedLectures: number;
  totalLectures: number;
  currentLecture?: string;
  percentComplete: number;
  lectureUpdates: Array<{
    lectureName: string;
    status: "pending" | "processing" | "completed" | "failed";
    questionsGenerated?: number;
    error?: string;
  }>;
}

type LectureStartedEvent = {
  lectureTitle: string;
};

type LectureCompletedEvent = {
  lectureTitle: string;
  questionsGenerated?: number;
  completedLectures: number;
  percentComplete: number;
};

type LectureFailedEvent = {
  lectureTitle: string;
  error?: string;
};

type ProgressEvent = {
  completedLectures: number;
  percentComplete: number;
  currentLecture?: string;
};

type CompletedEvent = {
  totalLectures: number;
};

export const useTriggerPublicQuizGeneration = () => {
  const { socket } = useSocket();
  const [progress, setProgress] = useState<PublicQuizGenerationProgress | null>(
    null,
  );
  const [lectureUpdates, setLectureUpdates] = useState<
    Record<
      string,
      {
        status: "pending" | "processing" | "completed" | "failed";
        questionsGenerated?: number;
        error?: string;
      }
    >
  >({});

  useEffect(() => {
    if (!socket) return;

    // Listen for lecture started
    socket.on(
      EVENT_NAMES.PUBLIC_QUIZ_GENERATION_LECTURE_STARTED ||
        "public_quiz:generation:lecture:started",
      (data: LectureStartedEvent) => {
        setLectureUpdates((prev) => ({
          ...prev,
          [data.lectureTitle]: { status: "processing" },
        }));
      },
    );

    // Listen for lecture completed
    socket.on(
      EVENT_NAMES.PUBLIC_QUIZ_GENERATION_LECTURE_COMPLETED ||
        "public_quiz:generation:lecture:completed",
      (data: LectureCompletedEvent) => {
        setLectureUpdates((prev) => ({
          ...prev,
          [data.lectureTitle]: {
            status: "completed",
            questionsGenerated: data.questionsGenerated,
          },
        }));
        setProgress((prev) =>
          prev
            ? {
                ...prev,
                completedLectures: data.completedLectures,
                percentComplete: data.percentComplete,
              }
            : null,
        );
      },
    );

    // Listen for lecture failed
    socket.on(
      EVENT_NAMES.PUBLIC_QUIZ_GENERATION_LECTURE_FAILED ||
        "public_quiz:generation:lecture:failed",
      (data: LectureFailedEvent) => {
        setLectureUpdates((prev) => ({
          ...prev,
          [data.lectureTitle]: { status: "failed", error: data.error },
        }));
      },
    );

    // Listen for overall progress
    socket.on(
      EVENT_NAMES.PUBLIC_QUIZ_GENERATION_PROGRESS ||
        "public_quiz:generation:progress",
      (data: ProgressEvent) => {
        setProgress((prev) =>
          prev
            ? {
                ...prev,
                completedLectures: data.completedLectures,
                percentComplete: data.percentComplete,
                currentLecture: data.currentLecture,
              }
            : null,
        );
      },
    );

    // Listen for completion
    socket.on(
      EVENT_NAMES.PUBLIC_QUIZ_GENERATION_COMPLETED ||
        "public_quiz:generation:completed",
      (data: CompletedEvent) => {
        setProgress((prev) =>
          prev
            ? {
                ...prev,
                percentComplete: 100,
                completedLectures: data.totalLectures,
              }
            : null,
        );
      },
    );

    return () => {
      socket.off(
        EVENT_NAMES.PUBLIC_QUIZ_GENERATION_LECTURE_STARTED ||
          "public_quiz:generation:lecture:started",
      );
      socket.off(
        EVENT_NAMES.PUBLIC_QUIZ_GENERATION_LECTURE_COMPLETED ||
          "public_quiz:generation:lecture:completed",
      );
      socket.off(
        EVENT_NAMES.PUBLIC_QUIZ_GENERATION_LECTURE_FAILED ||
          "public_quiz:generation:lecture:failed",
      );
      socket.off(
        EVENT_NAMES.PUBLIC_QUIZ_GENERATION_PROGRESS ||
          "public_quiz:generation:progress",
      );
      socket.off(
        EVENT_NAMES.PUBLIC_QUIZ_GENERATION_COMPLETED ||
          "public_quiz:generation:completed",
      );
    };
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
        // Initialize progress tracking
        setProgress({
          generationId: data.generationId,
          courseId: data.details?.[0]?.materialId || "",
          completedLectures: 0,
          totalLectures: data.jobsQueued,
          percentComplete: 0,
          lectureUpdates: [],
        });

        // Pre-populate lectureUpdates with all lectures as pending
        const initialLectures: Record<
          string,
          {
            status: "pending" | "processing" | "completed" | "failed";
            questionsGenerated?: number;
            error?: string;
          }
        > = {};
        if (data.details) {
          data.details.forEach((detail) => {
            initialLectures[detail.lectureTitle] = { status: "pending" };
          });
        }
        setLectureUpdates(initialLectures);
      }
    },
  });

  return {
    ...mutation,
    progress,
    lectureUpdates,
  };
};
