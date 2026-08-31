import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export type DashboardExamType = "midterm" | "final" | "resit" | "supplementary";
export type DashboardSessionMode = "free" | "structured";
export type DashboardSessionStatus =
  | "active"
  | "paused"
  | "completed"
  | "abandoned";

export interface DashboardCourse {
  courseId: string;
  code: string;
  title: string;
  /** 0–100; null when the course has no upcoming exam */
  progressPercent: number | null;
  daysToExam: number | null;
  examDate: string | null;
  examType: DashboardExamType | null;
}

export interface TodaysBrief {
  windowStart: string;
  sessions: { count: number; totalMinutes: number };
  flashcards: {
    reviewedCount: number;
    averageMastery: number | null;
    weakCount: number;
  };
  quizzes: { attemptedCount: number; averageScore: number | null };
  exams: { upcomingCount: number; daysToNext: number | null };
}

export interface NextExam {
  courseCode: string;
  courseName: string;
  examType: DashboardExamType;
  scheduledAt: string;
  daysLeft: number;
  venue: string | null;
}

export interface RecentWorkItem {
  id: string;
  displayName: string;
  courseCode: string | null;
  courseTitle: string | null;
  mode: DashboardSessionMode;
  status: DashboardSessionStatus;
  updatedAt: string;
  messageCount: number;
}

export interface DashboardPayload {
  courses: DashboardCourse[];
  todaysBrief: TodaysBrief;
  nextExam: NextExam | null;
  recentWork: RecentWorkItem[];
  generatedAt: string;
}

interface DashboardResponse {
  data: DashboardPayload;
  message: string;
}

export const useDashboard = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: async () => {
      const response = await api.get<DashboardResponse>("/app/dashboard");
      return response.data.data;
    },
    // Backend caches for 1 hour; a short client stale-time keeps revisits
    // snappy without hammering the endpoint.
    staleTime: 1000 * 60,
    retry: 2,
  });
};
