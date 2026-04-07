import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export interface LibraryFilters {
  universityId?: string;
  courseId?: string;
  subject?: string;
  year?: number;
  tags?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface LibraryItem {
  _id: string;
  title: string;
  description?: string;
  subject?: string;
  year?: number;
  tags: string[];
  useCount: number;
  publishedAt: string;
  materialId: {
    _id: string;
    originalName: string;
    mimeType: string;
    size: number;
    pageCount: number;
    wordCount: number;
  };
  universityId?: { _id: string; name: string; shortName?: string };
  courseId?: { _id: string; title: string; code: string };
}

export interface LibraryResponse {
  data: LibraryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function usePublicLibrary(filters: LibraryFilters = {}) {
  return useQuery({
    queryKey: queryKeys.publicLibrary.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== "") params.set(k, String(v));
      });
      const res = await api.get<{ data: LibraryItem[]; pagination: LibraryResponse["pagination"] }>(
        `/learning/library?${params.toString()}`
      );
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function usePublicLibraryItem(id: string) {
  return useQuery({
    queryKey: queryKeys.publicLibrary.detail(id),
    queryFn: async () => {
      const res = await api.get<{ data: LibraryItem }>(`/learning/library/${id}`);
      return res.data?.data;
    },
    enabled: !!id,
  });
}

export function useSubmitToLibrary() {
  return useMutation({
    mutationFn: async (payload: {
      materialId: string;
      title: string;
      description?: string;
      universityId?: string;
      courseId?: string;
      subject?: string;
      year?: number;
      tags?: string[];
    }) => {
      const res = await api.post("/learning/library/submit", payload);
      return res.data;
    },
  });
}
