import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface IMigration {
  name: string;
  runAt: string;
}

export interface MigrationStatus {
  executed: IMigration[];
  pending: string[];
}

export const useMigrations = () => {
  return useQuery({
    queryKey: ["admin", "migrations"],
    queryFn: async () => {
      const { data } = await api.get<{ data: MigrationStatus }>(
        "/admin/system/migrations",
      );
      return data.data;
    },
  });
};

export const useRunMigrations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ message: string }>(
        "/admin/system/migrations",
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "migrations"] });
    },
  });
};
