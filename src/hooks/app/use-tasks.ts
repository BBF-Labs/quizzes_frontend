"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type {
  CreateTaskInput,
  ITask,
  ITasksResponse,
  UpdateTaskInput,
} from "@/types/task";

export function useTasks(status?: "active" | "completed") {
  return useQuery({
    queryKey: queryKeys.tasks.list(status),
    queryFn: async () => {
      const response = await api.get<{ data: ITasksResponse }>("/app/tasks", {
        params: status ? { status } : undefined,
      });
      return response.data.data;
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const response = await api.post<{ data: ITask }>("/app/tasks", input);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.root });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      input,
    }: {
      taskId: string;
      input: UpdateTaskInput;
    }) => {
      const response = await api.patch<{ data: ITask }>(
        `/app/tasks/${taskId}`,
        input,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.root });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      await api.delete(`/app/tasks/${taskId}`);
      return taskId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.root });
    },
  });
}
