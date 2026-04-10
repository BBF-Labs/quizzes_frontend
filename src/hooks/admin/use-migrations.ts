import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface IMigration {
  _id: string;
  name: string;
  status: "pending" | "success" | "error";
  errorMessage?: string;
  startTime: string;
  endTime?: string;
  runAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MigrationStatus {
  history: IMigration[];
  pending: string[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useMigrations = (
  options: { page?: number; limit?: number; search?: string } = {},
) => {
  return useQuery({
    queryKey: ["admin", "migrations", options],
    queryFn: async () => {
      const { data } = await api.get<{ data: MigrationStatus }>(
        "/admin/system/migrations",
        { params: options },
      );
      return data.data;
    },
  });
};

export const useRunMigrations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options?: { rerun?: boolean }) => {
      const { data } = await api.post<{ message: string }>(
        "/admin/system/migrations",
        { rerun: options?.rerun === true },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "migrations"] });
    },
  });
};
