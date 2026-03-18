import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type {
  CreateSessionInput,
  ZSession,
  StepInput,
  ZAgentPlan,
} from "@/types/session";

interface CreateSessionResponse {
  data: ZSession;
  message: string;
  code: string;
}

interface StepResponse {
  message: string;
  code: string;
}

/**
 * Hook to create a new study session.
 */
export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSessionInput): Promise<ZSession> => {
      const response = await api.post<CreateSessionResponse>(
        "/sessions",
        input,
      );
      const session = response.data.data;
      // Map _id to id for frontend consistency
      return {
        ...session,
        id: (session as any)._id || session.id,
      };
    },
    onSuccess: () => {
      // Invalidate sessions list to refetch
      return queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.lists(),
      });
    },
  });
};

/**
 * Hook to start a study session.
 */
export const useStartSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.post<StepResponse>(
        `/sessions/${sessionId}/start`,
      );
      return response.data;
    },
    onSuccess: (_, sessionId) => {
      // Invalidate this session's detail query to refetch latest state
      return queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.detail(sessionId),
      });
    },
  });
};

/**
 * Hook to submit a step in an active session.
 */
export const useSessionStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      step,
    }: {
      sessionId: string;
      step: StepInput;
    }) => {
      const response = await api.post<StepResponse>(
        `/sessions/${sessionId}/step`,
        step,
      );
      return response.data;
    },
    onSuccess: (_, { sessionId }) => {
      // Invalidate this session's detail query
      return queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.detail(sessionId),
      });
    },
  });
};

/**
 * Hook to edit a session plan (before approval).
 */
export const useEditSessionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      plan,
    }: {
      sessionId: string;
      plan: ZAgentPlan;
    }) => {
      const response = await api.post<StepResponse>(
        `/sessions/${sessionId}/plan/edit`,
        plan,
      );
      return response.data;
    },
    onSuccess: (_, { sessionId }) => {
      // Invalidate this session's detail query
      return queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.detail(sessionId),
      });
    },
  });
};
