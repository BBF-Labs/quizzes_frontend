import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/contexts/auth-context";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PlanTier = "cooked" | "cruising" | "locked_in";
export type PlanDuration = "daily" | "weekly" | "semester";

export interface TierLimits {
  tutorSessionsPerDay: number | null;
  quizGenerationsPerDay: number | null;
  flashcardSetsPerDay: number | null;
  mindMapsPerDay: number | null;
  materialUploadsPerDay: number | null;
  pdfExport: boolean;
  analyticsLevel: "basic" | "full";
  priorityProcessing: boolean;
  earlyFeatureAccess: boolean;
  bonusCreditsOnSignup: number;
}

export interface BillingPackage {
  _id: string;
  name: string;
  tier: PlanTier;
  durationType: PlanDuration;
  priceGHS: number;
  limits: TierLimits;
  isActive: boolean;
}

export interface CreditBundle {
  _id: string;
  name: string;
  priceGHS: number;
  credits: number;
}

export interface DailyUsage {
  date: string;
  tutorSessions: number;
  quizGenerations: number;
  flashcardSets: number;
  mindMaps: number;
  materialUploads: number;
}

export interface BillingStatus {
  planTier: PlanTier | null;
  planDuration: PlanDuration | null;
  subscriptionEndsAt: string | null;
  dailyUsage: DailyUsage;
  planLimits: TierLimits | null;
  credits: { balance: number };
  isSubscribed: boolean;
}

export interface StreakStatus {
  current: number;
  longest: number;
  lastStudyDate: string | null;
  freezesAvailable: number;
  milestoneReached: number | null;
  isActive: boolean;
}

export interface StudentVerifyStatus {
  status: "unverified" | "pending" | "verified" | "expired" | "rejected";
  studentEmail: string | null;
  expiresAt: string | null;
}

export interface InitiatePaymentResult {
  authorizationUrl: string;
  reference: string;
  accessCode: string;
}

export interface DiscountPreview {
  originalPriceGHS: number;
  finalPriceGHS: number;
  discountPercent: number;
  breakdown: Array<{ type: string; percent: number }>;
  isFreeWeek: boolean;
}

// ─── Packages ────────────────────────────────────────────────────────────────

export function usePackages() {
  return useQuery({
    queryKey: queryKeys.billing.packages(),
    queryFn: async () => {
      const res = await api.get<{ data: BillingPackage[] }>("/subscriptions/packages");
      return res.data.data ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });
}

// ─── Credit Bundles ──────────────────────────────────────────────────────────

export function useCreditBundles() {
  return useQuery({
    queryKey: queryKeys.billing.creditBundles(),
    queryFn: async () => {
      const res = await api.get<{ data: CreditBundle[] }>("/subscriptions/credits/bundles");
      return res.data.data ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });
}

// ─── Billing Status ──────────────────────────────────────────────────────────

export function useBillingStatus() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.billing.status(),
    queryFn: async () => {
      const res = await api.get<{ data: BillingStatus }>("/subscriptions/users/me/billing-status");
      return res.data.data;
    },
    enabled: !!user,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
}

// ─── Streak ──────────────────────────────────────────────────────────────────

export function useStreakStatus() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.billing.streak(),
    queryFn: async () => {
      const res = await api.get<{ data: StreakStatus }>("/subscriptions/streak/status");
      return res.data.data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStreakFreeze() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post("/subscriptions/streak/freeze");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.streak() });
    },
  });
}

// ─── Student Verification ────────────────────────────────────────────────────

export function useStudentVerifyStatus() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.billing.studentVerify(),
    queryFn: async () => {
      const res = await api.get<{ data: StudentVerifyStatus | null }>("/subscriptions/student-verify/status");
      return res.data.data ?? { status: "unverified", studentEmail: null, expiresAt: null } as StudentVerifyStatus;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}

export function useInitiateStudentVerify() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studentEmail: string) => {
      const res = await api.post("/subscriptions/student-verify/initiate", { studentEmail });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.studentVerify() });
    },
  });
}

export function useConfirmStudentVerify() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      const res = await api.get(`/subscriptions/student-verify/confirm?token=${token}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.studentVerify() });
    },
  });
}

// ─── Payments ────────────────────────────────────────────────────────────────

export function useInitiatePlanPayment() {
  return useMutation({
    mutationFn: async (input: {
      packageId: string;
      email: string;
      promoCode?: string;
      referralCode?: string;
    }) => {
      const res = await api.post<{ data: InitiatePaymentResult }>(
        "/subscriptions/payments/initiate",
        { type: "plan", ...input },
      );
      return res.data.data;
    },
  });
}

export function useInitiateCreditPayment() {
  return useMutation({
    mutationFn: async (input: { bundleId: string; email: string }) => {
      const res = await api.post<{ data: InitiatePaymentResult }>(
        "/subscriptions/credits/initiate",
        input,
      );
      return res.data.data;
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reference: string) => {
      const res = await api.get(`/subscriptions/payments/verify/${reference}`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.status() });
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.streak() });
    },
  });
}

// ─── Promo Code Validation ────────────────────────────────────────────────────

export function useValidatePromoCode() {
  return useMutation({
    mutationFn: async (input: {
      code?: string;
      referralCode?: string;
      packageId?: string;
      bundleId?: string;
    }) => {
      const res = await api.post<{ data: any }>(
        "/subscriptions/promo-codes/validate",
        input,
      );
      return res.data.data;
    },
  });
}

export interface ReferralStatus {
  code: string;
  referredCount: number;
  hasPendingDiscount: boolean;
}

// ─── Referral Status ──────────────────────────────────────────────────────────

export function useReferralStatus() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.billing.referralStatus(),
    queryFn: async () => {
      const res = await api.get<{ data: ReferralStatus }>("/subscriptions/referral/me");
      return res.data.data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 60, // 1 hour - referral code doesn't change
  });
}
