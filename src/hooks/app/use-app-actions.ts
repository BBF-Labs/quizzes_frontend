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

export const useCreateSession = () => {
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

export const useStartSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appId: string) => {
      if (!appId || appId === "undefined")
        throw new Error("Invalid app ID for startApp");
      const response = await api.post<StepResponse>(`/app/${appId}/start`);
      return response.data;
    },
    onSuccess: (_, appId) => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(appId),
      });
    },
  });
};

export const useSessionMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appId,
      message,
      messageId,
    }: {
      appId: string;
      message: string;
      messageId?: string;
    }) => {
      if (!appId || appId === "undefined")
        throw new Error("Invalid app ID for app message");
      const response = await api.post<StepResponse>(
        `/app/${appId}/message`,
        {
          message,
          messageId,
        },
      );
      return response.data;
    },
    onSuccess: (_, { appId }) => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(appId),
      });
    },
  });
};

export const useSessionSteer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appId,
      instruction,
    }: {
      appId: string;
      instruction: string;
    }) => {
      if (!appId || appId === "undefined")
        throw new Error("Invalid app ID for steer");
      const response = await api.post<StepResponse>(`/app/${appId}/steer`, {
        instruction,
      });
      return response.data;
    },
    onSuccess: (_, { appId }) => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(appId),
      });
    },
  });
};

export const useSessionApprove = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appId: string) => {
      if (!appId || appId === "undefined")
        throw new Error("Invalid app ID for approve");
      const response = await api.post<StepResponse>(
        `/app/${appId}/approve`,
      );
      return response.data;
    },
    onSuccess: (_, appId) => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(appId),
      });
    },
  });
};

export const useAddSessionMaterial = (appId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (materialId: string) => {
      const response = await api.post(`/app/${appId}/materials`, {
        materialId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(appId),
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
  appId: string;
  name: string;
}

export const useRenameSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appId, name }: RenameAppInput) => {
      const response = await api.patch(`/app/${appId}/name`, { name });
      return response.data;
    },
    onSuccess: (_, { appId }) => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(appId),
      });
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appId: string) => {
      const response = await api.delete(`/app/${appId}`);
      return response.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.app.lists(),
      });
    },
  });
};

export const useResumeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appId: string) => {
      const response = await api.post(`/app/${appId}/resume`);
      return response.data;
    },
    onSuccess: (_, appId) => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(appId),
      });
    },
  });
};
