import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { ZSessionSummary } from "@/types/session";

interface ListSessionsResponse {
  data: ZSessionSummary[];
  message: string;
}

/**
 * Hook to fetch the list of study sessions for the authenticated user.
 * Uses TanStack Query for caching and state management.
 */
export const useSessions = () => {
  return useQuery({
    queryKey: queryKeys.sessions.lists(),
    queryFn: async () => {
      const response = await api.get<ListSessionsResponse>("/sessions");
      return response.data.data ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
