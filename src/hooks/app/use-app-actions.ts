import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
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

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSessionInput): Promise<ZSession> => {
      const response = await api.post<CreateSessionResponse>("/app", input);
      const session = response.data.data;
      return {
        ...session,
        id: typeof (session as any)._id === "string" ? (session as any)._id : (session as any)._id?.toString() || session.id,
      };
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.sessions.lists() });
    },
  });
};

export const useStartSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!sessionId || sessionId === "undefined") throw new Error("Invalid session ID for startSession");
      const response = await api.post<StepResponse>(`/app/${sessionId}/start`);
      return response.data;
    },
    onSuccess: (_, sessionId) => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.sessions.detail(sessionId) });
    },
  });
};

export const useSessionStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, step }: { sessionId: string; step: StepInput }) => {
      if (!sessionId || sessionId === "undefined") throw new Error("Invalid session ID for session step");
      const response = await api.post<StepResponse>(`/app/${sessionId}/step`, step);
      return response.data;
    },
    onSuccess: (_, { sessionId }) => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.sessions.detail(sessionId) });
    },
  });
};

export const useEditSessionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, plan }: { sessionId: string; plan: ZAgentPlan }) => {
      if (!sessionId || sessionId === "undefined") throw new Error("Invalid session ID for plan edit");
      const response = await api.post<StepResponse>(`/app/${sessionId}/plan/edit`, plan);
      return response.data;
    },
    onSuccess: (_, { sessionId }) => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.sessions.detail(sessionId) });
    },
  });
};

export const useAddSessionMaterial = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (materialId: string) => {
      const response = await api.post(`/app/${sessionId}/materials`, { materialId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.detail(sessionId) });
      toast.success("Material added to session");
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to add material";
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
