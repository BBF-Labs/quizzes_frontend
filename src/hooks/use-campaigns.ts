"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const BASE = "/email-campaigns";

// --- Types ---
export interface ILinkContext {
  label: string;
  baseUrl: string;
  pathTemplate: string;
}

export interface INewsletterImage {
  _id?: string;
  url: string;
  altText: string;
  filename?: string;
  mimetype?: string;
  size?: number;
}

export type CampaignType =
  | "newsletter"
  | "announcement"
  | "product_update"
  | "waitlist_update"
  | "system_update"
  | "exam_reminder"
  | "quiz_available"
  | "welcome"
  | "password_reset"
  | "security_alert"
  | "account_activity"
  | "approval_status_change"
  | "program_offering_available"
  | "study_partner_request"
  | "email_verification";

export type CampaignStatus =
  | "draft"
  | "generating"
  | "approved"
  | "scheduled"
  | "dispatching"
  | "done"
  | "failed"
  | "cancelled";

export type AudienceLevel =
  | "platform"
  | "university"
  | "campus"
  | "college"
  | "school"
  | "department"
  | "course"
  | "role"
  | "individual";

export interface IAudienceFilter {
  includeContacts?: boolean;
  includeUsers?: boolean;
  contactLanes?: { waitlist?: boolean; newsletter?: boolean };
  contactStatus?: {
    waitlistStatus?: ("active" | "removed")[];
    newsletterStatus?: ("pending" | "active" | "unsubscribed" | "bounced")[];
  };
  universityId?: string;
  campusId?: string;
  collegeId?: string;
  schoolId?: string;
  departmentId?: string;
  roles?: (
    | "super_admin"
    | "uni_admin"
    | "admin"
    | "staff"
    | "moderator"
    | "student"
  )[];
  courseIds?: string[];
  contactUniversityId?: string;
  specificUserIds?: string[];
  specificEmails?: string[];
  excludeUnsubscribed?: boolean;
  excludeBounced?: boolean;
  excludeUserIds?: string[];
  excludeEmails?: string[];
  excludeRecentRecipientHours?: number;
}

export interface IAudiencePreview {
  estimatedCount: number;
  estimatedAt: string;
  exactCount?: number;
  exactCountAt?: string;
  description: string;
  level: AudienceLevel;
}

export interface ICampaign {
  _id: string;
  title: string;
  subjectLine: string;
  previewText?: string;
  promptInstruction: string;
  linkContexts: ILinkContext[];
  images?: INewsletterImage[];
  bodyMarkdown?: string;
  status: CampaignStatus;
  campaignType: CampaignType;
  audience: "single" | "broadcast";
  scheduledFor?: string;
  audienceFilter?: IAudienceFilter;
  audiencePreview?: IAudiencePreview;
  stats: {
    sent: number;
    failed: number;
    bounced: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    lastUpdated?: string;
  };
  dispatchTotal?: number;
  dispatchedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ICampaignImageGalleryResponse {
  items: INewsletterImage[];
  total: number;
  page: number;
  limit: number;
}

function normalizeCampaignsPayload(payload: unknown): ICampaign[] {
  if (Array.isArray(payload)) return payload as ICampaign[];

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return (payload as { data: ICampaign[] }).data;
  }

  return [];
}

function normalizeCampaignImagesPayload(
  payload: unknown,
  page: number,
  limit: number,
): ICampaignImageGalleryResponse {
  if (Array.isArray(payload)) {
    return {
      items: payload as INewsletterImage[],
      total: payload.length,
      page,
      limit,
    };
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    const typed = payload as {
      data: INewsletterImage[];
      total?: number;
      page?: number;
      limit?: number;
    };

    return {
      items: typed.data,
      total: typed.total ?? typed.data.length,
      page: typed.page ?? page,
      limit: typed.limit ?? limit,
    };
  }

  return {
    items: [],
    total: 0,
    page,
    limit,
  };
}

// --- Queries ---
export function useCampaigns() {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await api.get(BASE);
      return normalizeCampaignsPayload(res.data?.data);
    },
  });
}

export function useNewsletterImages(
  options: {
    page?: number;
    limit?: number;
    campaignId?: string;
    enabled?: boolean;
  } = {},
) {
  const { enabled = true, ...queryParams } = options;
  const page = queryParams.page ?? 1;
  const limit = queryParams.limit ?? 12;

  return useQuery({
    queryKey: ["newsletter-images", queryParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (queryParams.campaignId)
        params.append("campaignId", queryParams.campaignId);

      const res = await api.get(`${BASE}/images?${params.toString()}`);
      return normalizeCampaignImagesPayload(res.data?.data, page, limit);
    },
    enabled,
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const res = await api.get(`${BASE}/${id}`);
      return res.data?.data as ICampaign;
    },
    enabled: !!id,
  });
}

// --- Mutations ---
export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<ICampaign>) => {
      const res = await api.post(BASE, data);
      return res.data?.data as ICampaign;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

export function useUpdateCampaign(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<ICampaign>) => {
      const res = await api.patch(`${BASE}/${id}`, data);
      return res.data?.data as ICampaign;
    },
    onSuccess: (updatedCampaign) => {
      // Update cache directly with the returned data instead of invalidating
      qc.setQueryData(["campaign", id], updatedCampaign);
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function useGenerateCampaign(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post(`${BASE}/${id}/generate`);
      return res.data?.data as ICampaign;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaign", id] }),
  });
}

export function useApproveCampaign(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post(`${BASE}/${id}/approve`);
      return res.data?.data as ICampaign;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaign", id] });
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function useSendCampaignPreview(id: string) {
  return useMutation({
    mutationFn: async () => {
      const res = await api.post(`${BASE}/${id}/preview`);
      return res.data?.data;
    },
  });
}
