import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type {
  CreateSessionInput,
  ZSession,
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
      console.log("[useCreateSession] Request:", input);
      const response = await api.post<CreateSessionResponse>(
        "/app/sessions",
        input,
      );
      console.log("[useCreateSession] Raw Response:", response.data);
      const session = response.data.data;
      // Map _id to id for frontend consistency, converting to string if needed
      return {
        ...session,
        id:
          typeof (session as { _id?: string })._id === "string"
            ? (session as { _id?: string })._id!
            : (session as { _id?: string | number })._id?.toString() || session.id,
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
      if (!sessionId || sessionId === "undefined") {
        throw new Error("Invalid session ID for startSession");
      }
      console.log(`[useStartSession] Request: sessionId=${sessionId}`);
      const response = await api.post<StepResponse>(`/app/${sessionId}/start`);
      console.log("[useStartSession] Raw Response:", response.data);
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
 * Hook to submit a plain-text message in an active session.
 */
export const useSessionMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      message,
      messageId,
    }: {
      sessionId: string;
      message: string;
      messageId?: string;
    }) => {
      if (!sessionId || sessionId === "undefined") {
        throw new Error("Invalid session ID for session message");
      }
      console.log("[useSessionMessage] Request:", { sessionId, messageId, length: message.length });
      const response = await api.post<StepResponse>(
        `/app/${sessionId}/message`,
        { message, messageId },
      );
      console.log("[useSessionMessage] Raw Response:", response.data);
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
 * Hook to send a steering instruction for a session plan.
 */
export const useSessionSteer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      instruction,
    }: {
      sessionId: string;
      instruction: string;
    }) => {
      if (!sessionId || sessionId === "undefined") {
        throw new Error("Invalid session ID for steer");
      }
      const response = await api.post<StepResponse>(
        `/app/${sessionId}/steer`,
        { instruction },
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
 * Hook to approve a session plan.
 */
export const useSessionApprove = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!sessionId || sessionId === "undefined") {
        throw new Error("Invalid session ID for approve");
      }
      const response = await api.post<StepResponse>(
        `/app/${sessionId}/approve`,
      );
      return response.data;
    },
    onSuccess: (_, sessionId) => {
      // Invalidate this session's detail query
      return queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.detail(sessionId),
      });
    },
  });
};
