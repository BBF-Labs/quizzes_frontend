import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useSessionValidation(enabled: boolean) {
  return useQuery({
    queryKey: [...queryKeys.authSession, "validation"],
    queryFn: async () => {
      await api.get("/users/onboarding/status");
      return true;
    },
    enabled,
    retry: false,
    staleTime: 30_000,
    throwOnError: false,
  });
}

export function isInvalidSessionError(error: unknown): boolean {
  const axiosError = error as AxiosError;
  const status = axiosError?.response?.status;
  return status === 401 || status === 403;
}
