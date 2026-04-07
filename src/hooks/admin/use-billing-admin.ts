import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type ApiData<T> = { data: T };

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminPromoCode {
  _id: string;
  code: string;
  type: "percentage" | "flat";
  value: number;
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromoCodePayload {
  code: string;
  type: "percentage" | "flat";
  value: number;
  expiresAt?: string | null;
  maxUses?: number | null;
}

export interface AdminPayment {
  _id: string;
  userId: string;
  amount: number;
  reference: string;
  date: string;
  isValid: boolean;
  method: string;
  status: "abandoned" | "failed" | "ongoing" | "pending" | "processing" | "queued" | "success" | "reversed";
  type: "course" | "quiz" | "duration" | "credits" | "default" | "plan";
  package?: string;
  creditsAdded: number;
  createdAt: string;
}

export interface AdminPackage {
  _id: string;
  name: string;
  tier?: "cooked" | "cruising" | "locked_in";
  durationType?: "daily" | "weekly" | "semester";
  priceGHS?: number;
  price: number;
  isActive: boolean;
  limits?: {
    tutorSessionsPerDay?: number | null;
    quizGenerationsPerDay?: number | null;
    flashcardSetsPerDay?: number | null;
    mindMapsPerDay?: number | null;
    materialUploadsPerDay?: number | null;
    pdfExport?: boolean;
    analyticsLevel?: "basic" | "full";
    priorityProcessing?: boolean;
    earlyFeatureAccess?: boolean;
    bonusCreditsOnSignup?: number;
  };
}

// ─── Promo Code hooks ─────────────────────────────────────────────────────────

export function useAdminPromoCodes() {
  return useQuery({
    queryKey: ["admin", "promo-codes"],
    queryFn: async () => {
      const res = await api.get<ApiData<AdminPromoCode[]>>(
        "/admin/subscriptions/promo-codes",
      );
      return res.data?.data ?? [];
    },
    staleTime: 1000 * 30,
  });
}

export function useAdminCreatePromoCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePromoCodePayload) => {
      const res = await api.post<ApiData<AdminPromoCode>>(
        "/admin/subscriptions/promo-codes",
        payload,
      );
      return res.data?.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "promo-codes"] }),
  });
}

export function useAdminUpdatePromoCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreatePromoCodePayload> & { isActive?: boolean } }) => {
      const res = await api.patch<ApiData<AdminPromoCode>>(
        `/admin/subscriptions/promo-codes/${id}`,
        data,
      );
      return res.data?.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "promo-codes"] }),
  });
}

export function useAdminDeactivatePromoCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<ApiData<AdminPromoCode>>(
        `/admin/subscriptions/promo-codes/${id}`,
      );
      return res.data?.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "promo-codes"] }),
  });
}

// ─── Payment hooks ────────────────────────────────────────────────────────────

export function useAdminPayments(params: { status?: string; type?: string } = {}) {
  return useQuery({
    queryKey: ["admin", "payments", params],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params.status) query.set("status", params.status);
      if (params.type) query.set("type", params.type);
      const res = await api.get<ApiData<AdminPayment[]>>(
        `/admin/subscriptions/payments?${query}`,
      );
      return res.data?.data ?? [];
    },
    staleTime: 1000 * 30,
  });
}

// ─── Package hooks ────────────────────────────────────────────────────────────

export function useAdminPackages() {
  return useQuery({
    queryKey: ["admin", "packages"],
    queryFn: async () => {
      const res = await api.get<ApiData<AdminPackage[]>>(
        "/admin/subscriptions/packages",
      );
      return res.data?.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
}
