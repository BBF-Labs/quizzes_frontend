import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { ZSessionSummary, ZSession } from "@/types/session";

interface ListSessionsResponse {
  data: ZSessionSummary[];
  message: string;
}

interface GetSessionResponse {
  data: ZSession;
  message: string;
}

export const useSessions = () => {
  return useQuery({
    queryKey: queryKeys.sessions.lists(),
    queryFn: async () => {
      const response = await api.get<ListSessionsResponse>("/app");
      return response.data.data ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

export const useSession = (sessionId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.sessions.detail(sessionId),
    queryFn: async () => {
      const response = await api.get<GetSessionResponse>(`/app/${sessionId}`);
      return response.data.data;
    },
    enabled: enabled && !!sessionId,
    staleTime: 1000 * 10, // 10 seconds - sessions update frequently
    refetchOnWindowFocus: true, // Re-fetch when user returns to tab
    retry: 2,
  });
};
