import { useQuery, useMutation} from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { SystemQuizSummary, SystemQuizDetail } from "@/types/session";

type ApiData<T> = { data: T; meta?: PaginationMeta };

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QuizzesListParams {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string;
}

export const useSystemQuizzes = (params?: QuizzesListParams) =>
  useQuery({
    queryKey: [...queryKeys.systemQuizzes.list(), params],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set("page", String(params.page));
      if (params?.limit) qs.set("limit", String(params.limit));
      if (params?.search) qs.set("search", params.search);
      if (params?.tags) qs.set("tags", params.tags);
      const query = qs.toString() ? `?${qs.toString()}` : "";
      const res = await api.get<ApiData<SystemQuizSummary[]>>(
        `/learning/quizzes${query}`,
      );
      return {
        quizzes: res.data?.data ?? [],
        pagination: res.data?.meta ?? null,
      };
    },
  });

export const useSystemQuiz = (id: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.systemQuizzes.detail(id),
    queryFn: async () => {
      const res = await api.get<{ data: SystemQuizDetail }>(
        `/learning/quizzes/${id}`,
      );
      return res.data?.data ?? null;
    },
    enabled: enabled && !!id,
  });

export const useStartSystemQuiz = () =>
  useMutation({
    mutationFn: async (quizId: string) => {
      const res = await api.post<{ data: SystemQuizDetail }>(
        `/learning/quizzes/${quizId}/start`,
      );
      return res.data.data;
    },
  });

export const useConfirmSystemQuizAttempt = () =>
  useMutation({
    mutationFn: async (quizId: string) => {
      await api.post(`/learning/quizzes/${quizId}/confirm-attempt`);
    },
  });
