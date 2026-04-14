import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export type LibraryStatus = "pending_review" | "published" | "rejected";

export interface AdminLibraryItem {
  _id: string;
  title: string;
  description?: string;
  subject?: string;
  year?: number;
  tags: string[];
  useCount: number;
  status: LibraryStatus;
  publishedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  quizGenerated?: boolean;
  quizGeneratedAt?: string;
  materialId: {
    _id: string;
    originalName: string;
    mimeType: string;
    size: number;
    pageCount: number;
    wordCount: number;
    contentType?: "material" | "questions";
  };
  submittedBy?: { _id: string; name: string; username: string };
  universityId?: { _id: string; name: string };
  courseId?: { _id: string; title: string; code: string };
}

interface AdminLibraryResponse {
  data: AdminLibraryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useAdminLibrary(filters: { status?: LibraryStatus | "all"; search?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.adminLibrary.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "all") params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);
      if (filters.page) params.set("page", String(filters.page));
      if (filters.limit) params.set("limit", String(filters.limit));
      const res = await api.get<{ data: AdminLibraryItem[]; pagination: AdminLibraryResponse["pagination"] }>(
        `/admin/learning/library?${params.toString()}`
      );
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useReviewLibraryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, rejectionReason }: { id: string; action: "publish" | "reject"; rejectionReason?: string }) => {
      const res = await api.patch(`/admin/learning/library/${id}/review`, { action, rejectionReason });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminLibrary.root });
    },
  });
}
