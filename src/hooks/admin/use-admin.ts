import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { IUpload } from "@/hooks";

export interface IAdminStats {
  users: number;
  waitlist: number;
  newsletter: number;
  campaigns: number;
}

export interface IAudienceEntry {
  _id: string;
  email: string;
  name?: string;
  university?: string;
  source: string;
  isWaitlist: boolean;
  isNewsletter: boolean;
  newsletterStatus?: string;
  waitlistStatus?: string;
  createdAt: string;
  role?: string;
  isSubscribed?: boolean;
  isBanned?: boolean;
}

export interface IPaginatedAudience {
  data: IAudienceEntry[];
  total: number;
  page: number;
  limit: number;
}

function normalizePaginatedAudience(
  payload: unknown,
  options: { page?: number; limit?: number },
): IPaginatedAudience {
  if (Array.isArray(payload)) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const pageSize = payload.length;

    // Some endpoints currently return data arrays without total metadata.
    // Estimate totals so pager controls can still move forward/backward.
    const estimatedTotal =
      pageSize === limit
        ? page * limit + 1
        : (page - 1) * limit + pageSize;

    return {
      data: payload as IAudienceEntry[],
      total: estimatedTotal,
      page,
      limit,
    };
  }

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    const nestedData = obj.data;
    const data = Array.isArray(nestedData)
      ? (nestedData as IAudienceEntry[])
      : Array.isArray(obj.items)
        ? (obj.items as IAudienceEntry[])
        : [];

    return {
      data,
      total: typeof obj.total === "number" ? obj.total : data.length,
      page: typeof obj.page === "number" ? obj.page : (options.page ?? 1),
      limit: typeof obj.limit === "number" ? obj.limit : (options.limit ?? 10),
    };
  }

  return {
    data: [],
    total: 0,
    page: options.page ?? 1,
    limit: options.limit ?? 10,
  };
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const response = await api.get("/admin/system/stats");
      return response.data.data as IAdminStats;
    },
  });
}

export function useSubscribers(
  options: {
    page?: number;
    limit?: number;
    search?: string;
    newsletterStatus?: string;
  } = {},
) {
  return useQuery({
    queryKey: ["admin", "subscribers", options],
    queryFn: async () => {
      const response = await api.get("/admin/system/subscribers", {
        params: options,
      });
      const payload = response.data?.data ?? response.data;
      return normalizePaginatedAudience(payload, options);
    },
  });
}

export function useWaitlist(
  options: {
    page?: number;
    limit?: number;
    search?: string;
    waitlistStatus?: string;
  } = {},
) {
  return useQuery({
    queryKey: ["admin", "waitlist", options],
    queryFn: async () => {
      const response = await api.get("/admin/system/waitlist", {
        params: options,
      });
      const payload = response.data?.data ?? response.data;
      return normalizePaginatedAudience(payload, options);
    },
  });
}

export function useUsers(
  options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  } = {},
) {
  return useQuery({
    queryKey: ["admin", "users", options],
    queryFn: async () => {
      const response = await api.get("/admin/users/users", { params: options });
      const payload = response.data?.data ?? response.data;
      return normalizePaginatedAudience(payload, options); // Reuse for now or define IUserPayload
    },
  });
}

export function useCheckProfile() {
  return useMutation({
    mutationFn: async (data: {
      username?: string;
      currentPassword?: string;
    }) => {
      const response = await api.post("/users/check", data);
      return response.data.data;
    },
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: async (data: {
      username?: string;
      password?: string;
      currentPassword?: string;
      profilePicture?: string | IUpload;
    }) => {
      const response = await api.put("/admin/users/profile", data);
      return response.data.data;
    },
  });
}
