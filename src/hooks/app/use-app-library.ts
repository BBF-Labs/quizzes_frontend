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
