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

export const useSessions = () => {
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

export const useSession = (appId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.app.detail(appId),
    queryFn: async () => {
      const response = await api.get<GetAppResponse>(`/app/${appId}`);
      return response.data.data;
    },
    enabled: enabled && !!appId,
    staleTime: 1000 * 10, // 10 seconds - sessions update frequently
    refetchOnWindowFocus: true, // Re-fetch when user returns to tab
    retry: 2,
  });
};
