import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import type {
  CreateAppInput,
  ZApp,
  IAppMaterial,
  StudioNote,
  SessionHighlight,
} from "@/types/session";

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

export const useAppHighlights = (sessionId: string) => {
  return useQuery({
    queryKey: [...queryKeys.app.detail(sessionId), "highlights"],
    queryFn: async () => {
      const response = await api.get(`/app/${sessionId}`);
      const raw = response.data;
      const data = (raw as { data: ZApp }).data || (raw as ZApp);
      return (data.highlights || []) as SessionHighlight[];
    },
    enabled: !!sessionId && sessionId !== "undefined",
  });
};

export const useAddHighlight = (sessionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      highlight: Omit<SessionHighlight, "id" | "createdAt">,
    ) => {
      const response = await api.post(
        `/app/${sessionId}/highlights`,
        highlight,
      );
      return response.data;
    },
    onSuccess: (newHighlightData) => {
      const newHighlight = (newHighlightData as any).data || newHighlightData;
      
      queryClient.setQueryData(
        [...queryKeys.app.detail(sessionId), "highlights"],
        (old: SessionHighlight[] | undefined) => {
          if (!old) return [newHighlight];
          return [...old, newHighlight];
        }
      );
    },
  });
};

export const useRemoveHighlight = (sessionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (highlightId: string) => {
      const response = await api.delete(
        `/app/${sessionId}/highlights/${highlightId}`,
      );
      return response.data;
    },
    onSuccess: (_, highlightId) => {
      queryClient.setQueryData(
        [...queryKeys.app.detail(sessionId), "highlights"],
        (old: SessionHighlight[] | undefined) => {
          if (!old) return [];
          return old.filter((h) => h.id !== highlightId);
        }
      );
    },
  });
};

export const useUpdateHighlight = (sessionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      highlightId,
      note,
      color,
    }: {
      highlightId: string;
      note?: string;
      color?: string;
    }) => {
      const response = await api.patch(
        `/app/${sessionId}/highlights/${highlightId}`,
        { note, color },
      );
      return response.data;
    },
    onSuccess: (updatedHighlightData) => {
      const updatedHighlight = (updatedHighlightData as any).data || updatedHighlightData;
      
      queryClient.setQueryData(
        [...queryKeys.app.detail(sessionId), "highlights"],
        (old: SessionHighlight[] | undefined) => {
          if (!old) return [];
          return old.map((h) =>
            h.id === updatedHighlight.id ? { ...h, ...updatedHighlight } : h
          );
        }
      );
    },
  });
};

export const useAppMaterials = (sessionId: string) => {
  return useQuery({
    queryKey: queryKeys.app.materials(sessionId),
    queryFn: async () => {
      const response = await api.get<{ data: IAppMaterial[] } | IAppMaterial[]>(`/app/${sessionId}/materials`);
      const raw = response.data;
      const list = Array.isArray(raw) ? raw : (raw as { data: IAppMaterial[] }).data;
      return Array.isArray(list) ? list : [];
    },
    enabled: !!sessionId && sessionId !== "undefined",
  });
};

export const useAppMaterialContent = (sessionId: string, materialId: string | null) => {
  return useQuery({
    queryKey: [...queryKeys.app.materials(sessionId), materialId, "content"],
    queryFn: async () => {
      if (!materialId) return null;
      const response = await api.get(`/app/${sessionId}/materials/${materialId}/download`, {
        responseType: "blob",
      });
      return response.data as Blob;
    },
    enabled: !!sessionId && !!materialId && sessionId !== "undefined",
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
};

export const useAppMaterial = (sessionId: string, materialId: string | null) => {
  const { data: materials = [] } = useAppMaterials(sessionId);
  return materials.find((m) => m.id === materialId) || null;
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
        queryKey: queryKeys.app.materials(sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(sessionId),
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

interface RenameAppInput {
  sessionId: string;
  name: string;
}

export const useDeleteAppMaterial = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (materialId: string) => {
      const response = await api.delete(`/app/${sessionId}/materials/${materialId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.app.materials(sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(sessionId),
      });
      // Silent success since this usually updates UI instantly
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to delete material";
      console.error("[useDeleteAppMaterial] delete failed", message);
      toast.error(message);
    },
  });
};

export const useCreateStudioNote = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      const response = await api.post(`/app/${sessionId}/studio/notes`, {
        title,
        content,
      });
      return response.data.data;
    },
    onSuccess: (newNote: StudioNote) => {
      queryClient.setQueryData<ZApp>(
        queryKeys.app.detail(sessionId),
        (old) => {
          if (!old) return old;
          // Optimistically add to the session object's notes if they exist
          return {
            ...old,
            studio: {
              ...old.studio,
              notes: [newNote, ...(old.studio?.notes || [])],
            },
          } as any;
        },
      );
      // Also invalidate for safety
      queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(sessionId),
      });
    },
  });
};

export const useUpdateStudioNote = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      noteId,
      title,
      content,
    }: {
      noteId: string;
      title?: string;
      content?: string;
    }) => {
      const response = await api.patch(
        `/app/${sessionId}/studio/notes/${noteId}`,
        { title, content },
      );
      return response.data.data;
    },
    onSuccess: (updatedNote: StudioNote) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(sessionId),
      });
    },
  });
};

export const useDeleteStudioNote = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      await api.delete(`/app/${sessionId}/studio/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(sessionId),
      });
    },
  });
};

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
