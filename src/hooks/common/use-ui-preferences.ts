"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  normalizeUiPreferences,
  type UiPreferences,
} from "@/lib/ui-preferences";
import { useAuth } from "@/contexts/auth-context";

export function useUiPreferences() {
  const { isAuthenticated, user } = useAuth();

  const preferencesQuery = useQuery<UiPreferences | null>({
    queryKey: ["ui-preferences", user?.id],
    enabled: Boolean(isAuthenticated && user?.id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await api.get(`/users/preferences`);
      const remotePrefs = response?.data?.data as unknown | undefined;
      if (!remotePrefs) {
        return null;
      }

      return normalizeUiPreferences(remotePrefs);
    },
  });

  const savePreferencesMutation = useMutation({
    mutationFn: async (next: UiPreferences) => {
      await api.put(`/users/preferences`, { uiPreferences: next });
    },
  });

  return {
    remoteUiPreferences: preferencesQuery.data ?? null,
    isFetchingRemoteUiPreferences: preferencesQuery.isFetching,
    isSavingRemoteUiPreferences: savePreferencesMutation.isPending,
    saveRemoteUiPreferences: savePreferencesMutation.mutateAsync,
  };
}
