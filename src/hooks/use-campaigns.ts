"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const BASE = "/newsletter-campaigns";

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

export interface ICampaign {
  _id: string;
  title: string;
  subjectLine: string;
  previewText?: string;
  promptInstruction: string;
  linkContexts: ILinkContext[];
  images?: INewsletterImage[];
  targetAudience: ("waitlist" | "newsletter" | "users" | "all")[];
  bodyMarkdown?: string;
  status: "draft" | "generating" | "approved" | "dispatching" | "done" | "failed";
  stats: { sent: number; failed: number };
  createdAt: string;
  updatedAt: string;
}

// --- Queries ---
export function useCampaigns() {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await api.get(BASE);
      return res.data?.data as ICampaign[];
    },
  });
}

export function useNewsletterImages(options: { page?: number; limit?: number; campaignId?: string; enabled?: boolean } = {}) {
  const { enabled = true, ...queryParams } = options;
  return useQuery({
    queryKey: ["newsletter-images", queryParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (queryParams.page) params.append("page", queryParams.page.toString());
      if (queryParams.limit) params.append("limit", queryParams.limit.toString());
      if (queryParams.campaignId) params.append("campaignId", queryParams.campaignId);
      
      const res = await api.get(`${BASE}/images?${params.toString()}`);
      return res.data?.data as { data: INewsletterImage[]; total: number; page: number; limit: number };
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
