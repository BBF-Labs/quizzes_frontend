import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type ApiData<T> = { data: T };

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type PaginatedApiData<T> = { data: T; meta: PaginationMeta };

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

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

export interface AdminQuestion {
  _id: string;
  id: string;
  question: string;
  options: string[];
  answer: string;
  correctAnswer: string;
  type: "mcq" | "true_false" | "short_answer" | "essay" | "fill_in_blank";
  explanation?: string;
  hint?: string;
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
    lectureTitle: string;
    description?: string;
    order: number;
    topics: {
      title: string;
      topicTitle: string;
      order: number;
      questions: AdminQuestion[];
      questionTypes: { type: string; questions: AdminQuestion[] }[];
    }[];
  }[];
}

export interface AddQuestionPayload {
  lectureIndex: number;
  topicIndex: number;
  type: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  hint?: string;
}

// ─── Course hooks ─────────────────────────────────────────────────────────────

export const useAdminCourses = (params: PaginationParams = {}) => {
  const { page = 1, limit = 10, search = "" } = params;
  return useQuery({
    queryKey: ["admin", "courses", page, limit, search],
    queryFn: async () => {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search ? { search } : {}),
      });
      const res = await api.get<PaginatedApiData<AdminCourse[]>>(`/admin/learning/courses?${query}`);
      return {
        data: res.data?.data ?? [],
        pagination: res.data?.meta ?? { total: 0, page, limit, totalPages: 1 },
      };
    },
  });
};

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

export const useAdminQuizzes = (params: PaginationParams & { status?: string } = {}) => {
  const { page = 1, limit = 10, search = "", status = "" } = params;
  return useQuery({
    queryKey: ["admin", "quizzes", page, limit, search, status],
    queryFn: async () => {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
      });
      const res = await api.get<PaginatedApiData<AdminQuiz[]>>(`/admin/learning/quizzes?${query}`);
      return {
        data: res.data?.data ?? [],
        pagination: res.data?.meta ?? { total: 0, page, limit, totalPages: 1 },
      };
    },
  });
};

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

export const useAdminPatchQuiz = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.patch<ApiData<AdminQuizDetail>>(`/admin/learning/quizzes/${id}`, data);
      return res.data?.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "quizzes", id] });
      qc.invalidateQueries({ queryKey: ["admin", "quizzes"] });
    },
  });
};

export const useAdminAddQuizQuestion = (quizId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: AddQuestionPayload) => {
      const res = await api.post<ApiData<AdminQuestion>>(`/admin/learning/quizzes/${quizId}/questions`, data);
      return res.data?.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "quizzes", quizId] }),
  });
};

export const useAdminUpdateQuizQuestion = (quizId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ questionId, data }: { questionId: string; data: Partial<AdminQuestion> & { type?: string } }) => {
      const res = await api.put<ApiData<AdminQuestion>>(`/admin/learning/quizzes/${quizId}/questions/${questionId}`, data);
      return res.data?.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "quizzes", quizId] }),
  });
};

export const useAdminRemoveQuizQuestion = (quizId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (questionId: string) => {
      await api.delete(`/admin/learning/quizzes/${quizId}/questions/${questionId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "quizzes", quizId] }),
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

// ─── Timetable hooks ──────────────────────────────────────────────────────────

export interface AdminTimetable {
  _id: string;
  semester: string;
  academicYear: string;
  isPublished: boolean;
  entries: AdminExamEntry[];
  createdAt: string;
}

export interface AdminExamEntry {
  _id?: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  scheduledAt: string;
  venue: string;
  durationMinutes: number;
}

export const useAdminTimetables = (params: PaginationParams = {}) => {
  const { page = 1, limit = 10, search = "" } = params;
  return useQuery({
    queryKey: ["admin", "timetables", page, limit, search],
    queryFn: async () => {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search ? { search } : {}),
      });
      const res = await api.get<PaginatedApiData<AdminTimetable[]>>(`/admin/learning/timetables?${query}`);
      return {
        data: res.data?.data ?? [],
        pagination: res.data?.meta ?? { total: 0, page, limit, totalPages: 1 },
      };
    },
  });
};

export const useAdminCreateTimetable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AdminTimetable>) => {
      const res = await api.post<ApiData<AdminTimetable>>("/admin/learning/timetables", data);
      return res.data?.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "timetables"] }),
  });
};

export const useAdminPublishTimetable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch<ApiData<AdminTimetable>>(`/admin/learning/timetables/${id}/publish`);
      return res.data?.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "timetables"] }),
  });
};

export const useAdminAddTimetableEntry = (timetableId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: AdminExamEntry) => {
      const res = await api.post<ApiData<AdminTimetable>>(`/admin/learning/timetables/${timetableId}/entries`, data);
      return res.data?.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "timetables"] });
      qc.invalidateQueries({ queryKey: ["admin", "timetables", timetableId] });
    },
  });
};

export const useAdminUpdateTimetableEntry = (timetableId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ entryId, data }: { entryId: string; data: Partial<AdminExamEntry> }) => {
      const res = await api.put<ApiData<AdminTimetable>>(`/admin/learning/timetables/${timetableId}/entries/${entryId}`, data);
      return res.data?.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "timetables"] });
      qc.invalidateQueries({ queryKey: ["admin", "timetables", timetableId] });
    },
  });
};

export const useAdminRemoveTimetableEntry = (timetableId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: string) => {
      await api.delete(`/admin/learning/timetables/${timetableId}/entries/${entryId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "timetables"] });
      qc.invalidateQueries({ queryKey: ["admin", "timetables", timetableId] });
    },
  });
};
