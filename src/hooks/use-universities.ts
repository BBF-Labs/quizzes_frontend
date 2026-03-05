"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useUniversities() {
  return useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      const response = await api.get("/institutions/universities");
      return response.data;
    },
  });
}
