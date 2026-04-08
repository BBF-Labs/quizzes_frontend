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
    staleTime: 5 * 60 * 1000,
    throwOnError: false,
  });
}

export function isInvalidSessionError(error: unknown): boolean {
  if (error instanceof Error && error.message === "UNAUTHENTICATED") return true;
  const axiosError = error as any;
  const status = axiosError?.response?.status;
  return status === 401 || status === 403;
}
