import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { ZSession } from "@/types/session";

interface GetSessionResponse {
  data: ZSession;
  message: string;
}

/**
 * Hook to fetch a single study session by ID with auto-refresh on focus.
 * Uses TanStack Query for caching and state management.
 *
 * @param sessionId - The ID of the session to fetch
 * @param enabled - Whether the query should be enabled (default: true)
 */
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
