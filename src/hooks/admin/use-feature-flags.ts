import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { api } from "@/lib/api";

// ---------------------------------------------------------------------------
// Types — mirror the backend's `IFeatureFlag` / `IFeatureFlagAudit` shapes
// after a `.lean()` round-trip (string IDs, optional fields as null).
// ---------------------------------------------------------------------------

export type FlagType = "boolean" | "percentage" | "select" | "json";

export type FlagAuditAction =
  | "create"
  | "update"
  | "delete"
  | "enable"
  | "disable";

export interface FeatureFlag {
  _id: string;
  key: string;
  name: string;
  description: string;
  type: FlagType;
  enabled: boolean;
  value?: number | string | null;
  options?: string[] | null;
  config?: Record<string, unknown> | null;
  updatedAt: string;
  createdAt: string;
  updatedBy?: string | null;
}

export interface FeatureFlagAuditEntry {
  _id: string;
  flagKey: string;
  action: FlagAuditAction;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  performedBy: string;
  performedAt: string;
  reason?: string | null;
}

export interface AuditPage {
  data: FeatureFlagAuditEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ---------------------------------------------------------------------------
// List — fetches every flag (admin-only endpoint).
// ---------------------------------------------------------------------------

export const useFeatureFlags = () =>
  useQuery({
    queryKey: ["admin", "features"],
    queryFn: async () => {
      const { data } = await api.get<{ data: FeatureFlag[] }>(
        "/admin/system/features",
      );
      return data.data;
    },
    staleTime: 30_000,
  });

// ---------------------------------------------------------------------------
// Toggle — optimistic. We flip `enabled` in the cache before the round-trip
// so the switch feels instant; on error we roll back and toast.
// ---------------------------------------------------------------------------

interface UpdateFlagBody {
  name?: string;
  description?: string;
  enabled?: boolean;
  value?: number | string | null;
  options?: string[] | null;
  config?: Record<string, unknown> | null;
  reason?: string;
}

export const useUpdateFeatureFlag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      key,
      body,
    }: {
      key: string;
      body: UpdateFlagBody;
    }) => {
      const { data } = await api.patch<{ data: FeatureFlag }>(
        `/admin/system/features/${key}`,
        body,
      );
      return data.data;
    },
    // Optimistic update — flip the cached flag immediately.
    onMutate: async ({ key, body }) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "features"] });
      const previous = queryClient.getQueryData<FeatureFlag[]>([
        "admin",
        "features",
      ]);
      if (previous) {
        queryClient.setQueryData<FeatureFlag[]>(
          ["admin", "features"],
          previous.map((f) =>
            f.key === key
              ? {
                  ...f,
                  ...("enabled" in body ? { enabled: !!body.enabled } : {}),
                  ...("value" in body ? { value: body.value ?? null } : {}),
                  ...("options" in body ? { options: body.options ?? null } : {}),
                  ...("config" in body ? { config: body.config ?? null } : {}),
                  ...("name" in body && body.name ? { name: body.name } : {}),
                  ...("description" in body && body.description !== undefined
                    ? { description: body.description }
                    : {}),
                }
              : f,
          ),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["admin", "features"], ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "features"] });
    },
  });
};

// ---------------------------------------------------------------------------
// Create — new flag from scratch. Super-admin only.
// ---------------------------------------------------------------------------

export interface CreateFlagBody {
  key: string;
  name: string;
  description: string;
  type: FlagType;
  enabled?: boolean;
  value?: number | string | null;
  options?: string[];
  config?: Record<string, unknown>;
  reason?: string;
}

export const useCreateFeatureFlag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateFlagBody) => {
      const { data } = await api.post<{ data: FeatureFlag }>(
        "/admin/system/features",
        body,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "features"] });
    },
  });
};

// ---------------------------------------------------------------------------
// Delete — removes a flag entirely (and its audit history).
// ---------------------------------------------------------------------------

export const useDeleteFeatureFlag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      key,
      reason,
    }: {
      key: string;
      reason?: string;
    }) => {
      await api.delete(`/admin/system/features/${key}`, {
        data: reason ? { reason } : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "features"] });
    },
  });
};

// ---------------------------------------------------------------------------
// Audit history — paginated by flag key.
// ---------------------------------------------------------------------------

export const useFeatureFlagAudit = (
  key: string | null,
  page: number,
  limit = 20,
) =>
  useQuery({
    queryKey: ["admin", "features", "audit", key, page, limit],
    queryFn: async () => {
      const { data } = await api.get<{ data: AuditPage }>(
        `/admin/system/features/${key}/audit`,
        { params: { page, limit } },
      );
      return data.data;
    },
    enabled: !!key,
    placeholderData: keepPreviousData,
  });