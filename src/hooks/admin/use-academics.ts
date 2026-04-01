import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type ApiData<T> = { data: T };

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminCourse {
  _id: string;
  code: string;
  title?: string;
  about: string;
  semester: number;
  creditHours: number;
  year: number;
  isDeleted: boolean;
  createdAt: string;
}

export interface AdminQuiz {
  _id: string;
  title: string;
  description?: string;
  courseId: string;
  status: "draft" | "published" | "archived";
  isAvailable: boolean;
  passingScore: number;
  tags: string[];
  lectureCount?: number;
  questionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminQuizDetail extends AdminQuiz {
  availableFrom?: string;
  availableTo?: string;
  settings: {
    timeLimit?: number;
    shuffleQuestions: boolean;
    showHints: boolean;
    showExplanations: boolean;
  };
  lectures: {
    title: string;
    description?: string;
    order: number;
    topics: {
      title: string;
      order: number;
      questionTypes: { type: string; questions: string[] }[];
    }[];
  }[];
}

// ─── Course hooks ─────────────────────────────────────────────────────────────

export const useAdminCourses = () =>
  useQuery({
    queryKey: ["admin", "courses"],
    queryFn: async () => {
      const res = await api.get<ApiData<AdminCourse[]>>("/admin/learning/courses");
      return res.data?.data ?? [];
    },
  });

export const useAdminCreateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AdminCourse>) => {
      const res = await api.post<ApiData<AdminCourse>>("/admin/learning/courses", data);
      return res.data?.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "courses"] }),
  });
};

// ─── Quiz hooks ───────────────────────────────────────────────────────────────

export const useAdminQuizzes = () =>
  useQuery({
    queryKey: ["admin", "quizzes"],
    queryFn: async () => {
      const res = await api.get<ApiData<AdminQuiz[]>>("/admin/learning/quizzes");
      return res.data?.data ?? [];
    },
  });

export const useAdminQuiz = (id: string, enabled = true) =>
  useQuery({
    queryKey: ["admin", "quizzes", id],
    queryFn: async () => {
      const res = await api.get<ApiData<AdminQuizDetail>>(`/admin/learning/quizzes/${id}`);
      return res.data?.data ?? null;
    },
    enabled: enabled && !!id,
  });

export const useAdminCreateQuiz = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AdminQuiz>) => {
      const res = await api.post<ApiData<AdminQuizDetail>>("/admin/learning/quizzes", data);
      return res.data?.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "quizzes"] }),
  });
};

export const useAdminUpdateQuiz = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AdminQuiz>) => {
      const res = await api.put<ApiData<AdminQuizDetail>>(`/admin/learning/quizzes/${id}`, data);
      return res.data?.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "quizzes"] });
      qc.invalidateQueries({ queryKey: ["admin", "quizzes", id] });
    },
  });
};

export const useAdminDeleteQuiz = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/learning/quizzes/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "quizzes"] }),
  });
};

export const useAdminPublishQuiz = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch<ApiData<AdminQuizDetail>>(
        `/admin/learning/quizzes/${id}/publish`,
      );
      return res.data?.data;
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["admin", "quizzes"] });
      qc.invalidateQueries({ queryKey: ["admin", "quizzes", id] });
    },
  });
};

export const useAdminArchiveQuiz = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch<ApiData<AdminQuizDetail>>(
        `/admin/learning/quizzes/${id}/archive`,
      );
      return res.data?.data;
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["admin", "quizzes"] });
      qc.invalidateQueries({ queryKey: ["admin", "quizzes", id] });
    },
  });
};

export interface GenerateQuizAIPayload {
  quizId?: string;
  courseId: string;
  topic: string;
  numberOfQuestions: number;
  questionTypes: string[];
  difficulty: string;
  lectureTitle?: string;
}

export const useAdminGenerateQuizAI = () =>
  useMutation({
    mutationFn: async (payload: GenerateQuizAIPayload) => {
      const res = await api.post<ApiData<{ jobId: string }>>(
        "/admin/learning/quizzes/generate-ai",
        payload,
      );
      return res.data?.data;
    },
  });
