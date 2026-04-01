import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { SystemQuizSummary, SystemQuizDetail } from "@/types/session";

type ApiData<T> = { data: T };

export const useSystemQuizzes = (search?: string) =>
  useQuery({
    queryKey: [...queryKeys.systemQuizzes.list(), { search }],
    queryFn: async () => {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await api.get<ApiData<SystemQuizSummary[]>>(
        `/learning/quizzes${params}`,
      );
      return res.data?.data ?? [];
    },
  });

export const useSystemQuiz = (id: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.systemQuizzes.detail(id),
    queryFn: async () => {
      const res = await api.get<ApiData<SystemQuizDetail>>(
        `/learning/quizzes/${id}`,
      );
      return res.data?.data ?? null;
    },
    enabled: enabled && !!id,
  });
