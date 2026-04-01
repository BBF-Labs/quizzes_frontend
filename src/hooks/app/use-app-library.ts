import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type {
  FlashcardSetDetail,
  FlashcardSetSummary,
  MindMapDetail,
  MindMapSummary,
  NoteDetail,
  NoteSummary,
  QuizDetail,
  QuizSummary,
  ZGradeResult,
  MaterialSummary,
  MaterialDetail,
} from "@/types/session";

type ApiData<T> = { data: T };

export const useLibraryFlashcards = () =>
  useQuery({
    queryKey: queryKeys.library.flashcards.list(),
    queryFn: async () => {
      const res =
        await api.get<ApiData<FlashcardSetSummary[]>>("/app/flashcards");
      return res.data?.data ?? [];
    },
  });

export const useLibraryFlashcard = (id: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.library.flashcards.detail(id),
    queryFn: async () => {
      const res = await api.get<ApiData<FlashcardSetDetail>>(
        `/app/flashcards/${id}`,
      );
      return res.data.data;
    },
    enabled: enabled && !!id,
  });

export const useDeleteLibraryFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/app/flashcards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.flashcards.root(),
      });
    },
  });
};

export const useLibraryQuizzes = () =>
  useQuery({
    queryKey: queryKeys.library.quizzes.list(),
    queryFn: async () => {
      const res = await api.get<ApiData<QuizSummary[]>>("/app/quizzes");
      return res.data?.data ?? [];
    },
  });

export const useLibraryQuiz = (id: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.library.quizzes.detail(id),
    queryFn: async () => {
      const res = await api.get<ApiData<QuizDetail>>(`/app/quizzes/${id}`);
      return res.data.data;
    },
    enabled: enabled && !!id,
  });

export const useDeleteLibraryQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/app/quizzes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.quizzes.root(),
      });
    },
  });
};

export const useLibraryMindMaps = () =>
  useQuery({
    queryKey: queryKeys.library.mindmaps.list(),
    queryFn: async () => {
      const res = await api.get<ApiData<MindMapSummary[]>>("/app/mindmaps");
      return res.data?.data ?? [];
    },
  });

export const useLibraryMindMap = (id: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.library.mindmaps.detail(id),
    queryFn: async () => {
      const res = await api.get<ApiData<MindMapDetail>>(`/app/mindmaps/${id}`);
      return res.data.data;
    },
    enabled: enabled && !!id,
  });

export const useDeleteLibraryMindMap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/app/mindmaps/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.mindmaps.root(),
      });
    },
  });
};

export const useLibraryNotes = () =>
  useQuery({
    queryKey: queryKeys.library.notes.list(),
    queryFn: async () => {
      const res = await api.get<ApiData<NoteSummary[]>>("/app/notes");
      return res.data?.data ?? [];
    },
  });

export const useLibraryNote = (id: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.library.notes.detail(id),
    queryFn: async () => {
      const res = await api.get<ApiData<NoteDetail>>(`/app/notes/${id}`);
      return res.data.data;
    },
    enabled: enabled && !!id,
  });

export const useDeleteLibraryNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      noteId,
      sessionId,
    }: {
      noteId: string;
      sessionId: string;
    }) => {
      await api.delete(`/app/notes/${sessionId}/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.notes.root(),
      });
    },
  });
};

export const useLibraryMaterials = () =>
  useQuery({
    queryKey: queryKeys.library.materials.list(),
    queryFn: async () => {
      const res = await api.get<ApiData<MaterialSummary[]>>("/app/materials");
      return res.data?.data ?? [];
    },
  });

export const useCreateLibraryMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      uploadId: string;
      title?: string;
      courseId?: string;
    }) => {
      const res = await api.post<ApiData<MaterialDetail>>(
        "/app/materials",
        data,
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.materials.root(),
      });
    },
  });
};

export const useDeleteLibraryMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/app/materials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.materials.root(),
      });
    },
  });
};

export const useProcessLibraryMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/app/materials/${id}/process`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.materials.root(),
      });
    },
  });
};

export const useGenerateFlashcards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { materialId: string; courseId?: string }) => {
      const res = await api.post("/app/flashcards/generate", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.flashcards.root(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.materials.root(),
      });
    },
  });
};

export const useGenerateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      materialId: string;
      courseId?: string;
      settings?: any;
    }) => {
      const res = await api.post("/app/quizzes/generate", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.quizzes.root(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.materials.root(),
      });
    },
  });
};

export const useGradeQuizAnswers = () =>
  useMutation({
    mutationFn: async (data: {
      quizId: string;
      answers: {
        questionId: string;
        question: string;
        answer: string;
        correctAnswer?: string;
      }[];
    }) => {
      // Enqueue the grading job
      const enqueueRes = await api.post<ApiData<{ jobId: string }>>(
        `/app/quizzes/${data.quizId}/grade`,
        { answers: data.answers },
      );
      const jobId = enqueueRes.data.data.jobId;

      // Poll for result (max 30s, 1s interval)
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const pollRes = await api.get<
          ApiData<{ status: "pending" | "complete"; results?: ZGradeResult["results"]; error?: string }>
        >(`/app/quizzes/grade-results/${jobId}`);
        const payload = pollRes.data.data;
        if (payload.status === "complete") {
          if (payload.error) throw new Error(payload.error);
          return { results: payload.results ?? [] } as ZGradeResult;
        }
      }
      throw new Error("Grading timed out. Try again.");
    },
  });

export const useGenerateMindMap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      materialId: string;
      courseId?: string;
      settings?: any;
    }) => {
      const res = await api.post("/app/mindmaps/generate", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.mindmaps.root(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.materials.root(),
      });
    },
  });
};
