import {
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";

type AuthQueryOptions<TQueryFnData, TError, TData> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData>,
  "enabled"
> & {
  enabled?: boolean;
};

export function useAuthQuery<TQueryFnData, TError = Error, TData = TQueryFnData>(
  options: AuthQueryOptions<TQueryFnData, TError, TData>,
): UseQueryResult<TData, TError> {
  const { isAuthenticated, isHydrating, isValidating } = useAuth();

  return useQuery({
    ...options,
    enabled:
      (options.enabled ?? true) &&
      isAuthenticated &&
      !isHydrating &&
      !isValidating,
  });
}
