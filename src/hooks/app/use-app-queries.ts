import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { ZAppSummary, ZApp } from "@/types/session";

interface ListAppsResponse {
  data: ZAppSummary[];
  message: string;
}

interface GetAppResponse {
  data: ZApp;
  message: string;
}

export const useApps = () => {
  return useQuery({
    queryKey: queryKeys.app.lists(),
    queryFn: async () => {
      const response = await api.get<ListAppsResponse>("/app");
      return response.data.data ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

export const useApp = (sessionId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.app.detail(sessionId),
    queryFn: async () => {
      const response = await api.get<GetAppResponse>(`/app/${sessionId}`);
      return response.data.data;
    },
    enabled: enabled && !!sessionId,
    staleTime: 1000 * 10, // 10 seconds - sessions update frequently
    refetchOnWindowFocus: true, // Re-fetch when user returns to tab
    retry: 2,
  });
};

// Aliases for backward compatibility
export const useSession = useApp;
export const useSessions = useApps;

export interface AnalyticsSummary {
  sessionsByPhase: Record<string, number>;
  totalMessagesSent: number;
  artifactsByType: Record<string, number>;
  avgSessionDurationMinutes: number;
  studyDaysThisMonth: number;
  totalSessions: number;
  completedSessions: number;
  positiveRatings: number;
  negativeRatings: number;
}

export const useAnalyticsSummary = () => {
  return useQuery({
    queryKey: queryKeys.analytics.summary(),
    queryFn: async () => {
      const res = await api.get<{ data: AnalyticsSummary }>("/app/analytics/summary");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
