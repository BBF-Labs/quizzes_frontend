import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import type { CreateAppInput, ZApp } from "@/types/session";

interface CreateAppResponse {
  data: ZApp;
  message: string;
  code: string;
}

interface StepResponse {
  message: string;
  code: string;
}

export const useCreateApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAppInput): Promise<ZApp> => {
      const response = await api.post<CreateAppResponse>("/app", input);
      const app = response.data.data;
      return {
        ...app,
        id:
          typeof (app as ZApp & { _id?: string })._id === "string"
            ? (app as ZApp & { _id?: string })._id!
            : (app as ZApp & { _id?: string | number })._id?.toString() || app.id,
      };
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.app.lists(),
      });
    },
  });
};

export const useStartApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!sessionId || sessionId === "undefined")
        throw new Error("Invalid app ID for startApp");
      const response = await api.post<StepResponse>(`/app/${sessionId}/start`);
      return response.data;
    },
    onSuccess: (_, sessionId) => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(sessionId),
      });
    },
  });
};

export const useAppMessage = () => {
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
        throw new Error("Invalid app ID for app message");
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
        queryKey: queryKeys.app.detail(sessionId),
      });
    },
  });
};

export const useAppSteer = () => {
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
        throw new Error("Invalid app ID for steer");
      const response = await api.post<StepResponse>(`/app/${sessionId}/steer`, {
        instruction,
      });
      return response.data;
    },
    onSuccess: (_, { sessionId }) => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(sessionId),
      });
    },
  });
};

export const useAppApprove = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!sessionId || sessionId === "undefined")
        throw new Error("Invalid app ID for approve");
      const response = await api.post<StepResponse>(
        `/app/${sessionId}/approve`,
      );
      return response.data;
    },
    onSuccess: (_, sessionId) => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(sessionId),
      });
    },
  });
};

export const useAddAppMaterial = (sessionId: string) => {
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
        queryKey: queryKeys.app.detail(sessionId),
      });
      toast.success("Material added to app");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to add material";
      toast.error(message);
    },
  });
};

interface RenameAppInput {
  sessionId: string;
  name: string;
}

export const useRenameApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, name }: RenameAppInput) => {
      const response = await api.patch(`/app/${sessionId}/name`, { name });
      return response.data;
    },
    onSuccess: (_, { sessionId }) => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(sessionId),
      });
    },
  });
};

export const useDeleteApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.delete(`/app/${sessionId}`);
      return response.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.app.lists(),
      });
    },
  });
};

export const useResumeApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.post(`/app/${sessionId}/resume`);
      return response.data;
    },
    onSuccess: (_, sessionId) => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(sessionId),
      });
    },
  });
};

export const useUpdateAppMindMap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      mindMap,
    }: {
      sessionId: string;
      mindMap: any;
    }) => {
      const response = await api.patch(`/app/${sessionId}/studio/mindmap`, {
        mindMap,
      });
      return response.data;
    },
    onSuccess: (_, { sessionId }) => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(sessionId),
      });
    },
  });
};

// Aliases for backward compatibility
export const useCreateSession = useCreateApp;
export const useStartSession = useStartApp;
export const useSessionMessage = useAppMessage;
export const useSessionSteer = useAppSteer;
export const useSessionApprove = useAppApprove;
export const useAddSessionMaterial = useAddAppMaterial;
