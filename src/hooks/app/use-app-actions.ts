import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import type { CreateSessionInput, ZSession, ZAgentPlan } from "@/types/session";

interface CreateSessionResponse {
  data: ZSession;
  message: string;
  code: string;
}

interface StepResponse {
  message: string;
  code: string;
}

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSessionInput): Promise<ZSession> => {
      const response = await api.post<CreateSessionResponse>("/app", input);
      const session = response.data.data;
      return {
        ...session,
        id:
          typeof (session as any)._id === "string"
            ? (session as any)._id
            : (session as any)._id?.toString() || session.id,
      };
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.lists(),
      });
    },
  });
};

export const useStartSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!sessionId || sessionId === "undefined")
        throw new Error("Invalid session ID for startSession");
      const response = await api.post<StepResponse>(`/app/${sessionId}/start`);
      return response.data;
    },
    onSuccess: (_, sessionId) => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.detail(sessionId),
      });
    },
  });
};

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
      if (!sessionId || sessionId === "undefined")
        throw new Error("Invalid session ID for session message");
      const response = await api.post<StepResponse>(
        `/app/${sessionId}/message`,
        {
          message,
          messageId,
        },
      );
      return response.data;
    },
    onSuccess: (_, { sessionId }) => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.detail(sessionId),
      });
    },
  });
};

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
      if (!sessionId || sessionId === "undefined")
        throw new Error("Invalid session ID for steer");
      const response = await api.post<StepResponse>(`/app/${sessionId}/steer`, {
        instruction,
      });
      return response.data;
    },
    onSuccess: (_, { sessionId }) => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.detail(sessionId),
      });
    },
  });
};

export const useSessionApprove = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!sessionId || sessionId === "undefined")
        throw new Error("Invalid session ID for approve");
      const response = await api.post<StepResponse>(
        `/app/${sessionId}/approve`,
      );
      return response.data;
    },
    onSuccess: (_, sessionId) => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.detail(sessionId),
      });
    },
  });
};

export const useAddSessionMaterial = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (materialId: string) => {
      const response = await api.post(`/app/${sessionId}/materials`, {
        materialId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.detail(sessionId),
      });
      toast.success("Material added to session");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to add material";
      toast.error(message);
    },
  });
};

interface RenameSessionInput {
  sessionId: string;
  name: string;
}

export const useRenameSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, name }: RenameSessionInput) => {
      const response = await api.patch(`/app/${sessionId}/name`, { name });
      return response.data;
    },
    onSuccess: (_, { sessionId }) => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.detail(sessionId),
      });
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.delete(`/app/${sessionId}`);
      return response.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.lists(),
      });
    },
  });
};

export const useResumeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.post(`/app/${sessionId}/resume`);
      return response.data;
    },
    onSuccess: (_, sessionId) => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.detail(sessionId),
      });
    },
  });
};
