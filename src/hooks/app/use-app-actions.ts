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
      // Starting a session consumes the tutorSessions daily usage counter
      // server-side (enforceUsageLimit runs before the session is created),
      // so the Usage page's counter needs to refresh here too, not just the
      // session list.
      queryClient.invalidateQueries({
        queryKey: queryKeys.billing.status(),
      });
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
      isSystemAction,
      type,
    }: {
      sessionId: string;
      message: string;
      messageId?: string;
      isSystemAction?: boolean;
      type?: "text" | "system_action";
    }) => {
      if (!sessionId || sessionId === "undefined")
        throw new Error("Invalid app ID for app message");
      const response = await api.post<StepResponse>(
        `/app/${sessionId}/message`,
        {
          message,
          messageId,
          isSystemAction: Boolean(isSystemAction),
          type: type || (isSystemAction ? "system_action" : "text"),
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
    // Intentionally NOT nested under app.detail — message sends invalidate the full
    // app.detail tree (prefix match), which would refetch highlights and force a
    // re-render of DocumentReader on every message.
    queryKey: ["session-highlights", sessionId],
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
      const newHighlight = (newHighlightData as { data?: SessionHighlight }).data || (newHighlightData as SessionHighlight);
      
      queryClient.setQueryData(
        ["session-highlights", sessionId],
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
        ["session-highlights", sessionId],
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
      const updatedHighlight = (updatedHighlightData as { data?: SessionHighlight }).data || (updatedHighlightData as SessionHighlight);
      
      queryClient.setQueryData(
        ["session-highlights", sessionId],
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
    // Intentionally NOT nested under app.detail or app.materials — those trees are
    // invalidated on every message send, which would refetch the blob, create a new
    // objectUrl, reload the PDF Document component, and reset the reader scroll position.
    queryKey: ["material-blob", materialId],
    queryFn: async () => {
      if (!materialId) return null;
      const response = await api.get(`/app/${sessionId}/materials/${materialId}/download`, {
        responseType: "blob",
      });
      return response.data as Blob;
    },
    enabled: !!sessionId && !!materialId && sessionId !== "undefined",
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 30,
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
          } as ZApp;
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
      mindMap: unknown;
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

export const useRetryMessage = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      if (!sessionId || sessionId === "undefined")
        throw new Error("Invalid app ID for retry");
      const response = await api.post<StepResponse>(
        `/app/${sessionId}/message/${messageId}/retry`,
      );
      return response.data;
    },
    onMutate: async (messageId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.app.detail(sessionId) });
      const previous = queryClient.getQueryData(queryKeys.app.detail(sessionId));
      queryClient.setQueryData<ZApp>(queryKeys.app.detail(sessionId), (old) => {
        if (!old) return old;
        const idx = old.zMessages.findIndex((m) => m.messageId === messageId);
        if (idx === -1) return old;
        return { ...old, zMessages: old.zMessages.slice(0, idx + 1) };
      });
      return { previous };
    },
    onError: (_err, _messageId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.app.detail(sessionId), context.previous);
      }
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.app.detail(sessionId),
      });
    },
  });
};

export const useRateMessage = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, rating }: { messageId: string; rating: 1 | -1 }) => {
      await api.post(`/app/${sessionId}/messages/${messageId}/rate`, { rating });
    },
    onMutate: async ({ messageId, rating }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.app.detail(sessionId) });
      const previous = queryClient.getQueryData(queryKeys.app.detail(sessionId));
      queryClient.setQueryData<ZApp>(queryKeys.app.detail(sessionId), (old) => {
        if (!old) return old;
        return {
          ...old,
          zMessages: old.zMessages.map((m) =>
            m.messageId === messageId ? { ...m, rating } : m
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.app.detail(sessionId), context.previous);
      }
    },
  });
};

// ─── Study Plan & Chapter Management Hooks ───────────────────────────────────

export const useToggleBlockCompletion = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blockId: string) => {
      const response = await api.patch(`/app/${sessionId}/study-plan/blocks/${blockId}/toggle`);
      return response.data;
    },
    onMutate: async (blockId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.app.detail(sessionId) });
      const previous = queryClient.getQueryData<ZApp>(queryKeys.app.detail(sessionId));

      if (previous?.studyPlan) {
        const updatedChapters = (previous.studyPlan.chapters || []).map((ch) => {
          const updatedSteps = (ch.steps || []).map((st) => {
            const updatedPrereqs = (st.prerequisites || []).map((b) =>
              b.blockId === blockId
                ? { ...b, completed: !b.completed, isCompleted: !b.completed }
                : b,
            );
            const stepCompletedCount = updatedPrereqs.filter(
              (b) => b.completed || b.isCompleted,
            ).length;
            return {
              ...st,
              prerequisites: updatedPrereqs,
              completedBlocks: stepCompletedCount,
              isCompleted:
                updatedPrereqs.length > 0 &&
                stepCompletedCount === updatedPrereqs.length,
            };
          });

          const updatedGoals = (ch.goals || []).map((g) => ({
            ...g,
            knowledgeBlocks: (g.knowledgeBlocks || []).map((b) =>
              b.blockId === blockId
                ? { ...b, completed: !b.completed, isCompleted: !b.isCompleted }
                : b,
            ),
          }));

          let chapterTotal = 0;
          let chapterCompleted = 0;
          for (const st of updatedSteps) {
            for (const b of st.prerequisites || []) {
              chapterTotal++;
              if (b.completed || b.isCompleted) chapterCompleted++;
            }
          }

          return {
            ...ch,
            steps: updatedSteps,
            goals: updatedGoals,
            totalBlocks: chapterTotal || ch.totalBlocks,
            completedBlocks: chapterCompleted,
          };
        });

        let completedBlocks = 0;
        let totalBlocks = 0;
        for (const ch of updatedChapters) {
          completedBlocks += ch.completedBlocks ?? 0;
          totalBlocks += ch.totalBlocks ?? 0;
        }

        queryClient.setQueryData<ZApp>(queryKeys.app.detail(sessionId), {
          ...previous,
          studyPlan: {
            ...previous.studyPlan,
            chapters: updatedChapters,
            totalBlocks,
            completedBlocks,
          },
        });
      }

      return { previous };
    },
    onError: (_err, _blockId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.app.detail(sessionId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.app.detail(sessionId) });
    },
  });
};

export const useAddChapter = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const response = await api.post(`/app/${sessionId}/study-plan/chapters`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.app.detail(sessionId) });
    },
  });
};

export const useUpdateChapter = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chapterId,
      ...data
    }: {
      chapterId: string;
      title?: string;
      description?: string;
    }) => {
      const response = await api.patch(`/app/${sessionId}/study-plan/chapters/${chapterId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.app.detail(sessionId) });
    },
  });
};

export const useAddChapterGoal = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chapterId,
      ...data
    }: {
      chapterId: string;
      title: string;
      knowledgeBlocks?: string[];
    }) => {
      const response = await api.post(
        `/app/${sessionId}/study-plan/chapters/${chapterId}/goals`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.app.detail(sessionId) });
    },
  });
};

export const useUpdateChapterGoal = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chapterId,
      goalId,
      ...data
    }: {
      chapterId: string;
      goalId: string;
      title?: string;
      status?: "pending" | "active" | "completed" | "skipped";
    }) => {
      const response = await api.patch(
        `/app/${sessionId}/study-plan/chapters/${chapterId}/goals/${goalId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.app.detail(sessionId) });
    },
  });
};

export const useDeleteChapterGoal = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chapterId,
      goalId,
    }: {
      chapterId: string;
      goalId: string;
    }) => {
      const response = await api.delete(
        `/app/${sessionId}/study-plan/chapters/${chapterId}/goals/${goalId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.app.detail(sessionId) });
    },
  });
};

export const useContinueJourney = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload?: Record<string, unknown>) => {
      const response = await api.post(`/app/${sessionId}/continue`, payload || {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.app.detail(sessionId) });
    },
  });
};

export const useRespondToDirectiveArtifact = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      artifactId,
      response,
      actionType,
    }: {
      artifactId: string;
      response: unknown;
      actionType?: string;
    }) => {
      const res = await api.patch(`/app/${sessionId}/artifacts/${artifactId}/respond`, {
        response,
        actionType,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.app.detail(sessionId) });
    },
  });
};

export const useGenerateStudyPlan = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload?: { goal?: string; instruction?: string } | string) => {
      const body =
        typeof payload === "string"
          ? { goal: payload }
          : payload || {};
      const response = await api.post(`/app/${sessionId}/study-plan/generate`, body);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.app.detail(sessionId) });
    },
  });
};

export const useGenerateCourseSummary = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post(`/app/${sessionId}/course-summary/generate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.app.detail(sessionId) });
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

