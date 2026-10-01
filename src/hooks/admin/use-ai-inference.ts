import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export type ProviderName = "openai" | "openrouter" | "google" | "groq";

export interface ProviderProbeResult {
  provider: ProviderName;
  configured: boolean;
  ok: boolean;
  status: "operational" | "degraded" | "down" | "not_configured";
  latencyMs: number | null;
  message: string;
  keyMasked: string | null;
  activeModel?: string;
  modelsCount?: number;
}

export interface InferenceRuntimeStatus {
  activeProvider: ProviderName;
  defaultModel: string;
  fallbackModel?: string;
  timeoutMs: number;
  tierOverride: "auto" | "free" | "paid";
  allowFreeUserPaid: boolean;
  providerPriority: string[];
  configuredProviders: Record<ProviderName, boolean>;
  maskedKeys?: Record<ProviderName, string | null>;
  availableModels: Record<ProviderName, string[]>;
}

export interface SwitchInferenceInput {
  provider?: ProviderName;
  defaultModel?: string;
  fallbackModel?: string;
  timeoutMs?: number;
  tierOverride?: "auto" | "free" | "paid";
  allowFreeUserPaid?: boolean;
  providerPriority?: string[];
  reason?: string;
}

export interface TestInferenceResult {
  success: boolean;
  text?: string;
  error?: string;
  modelUsed?: string;
  modelAttempted?: string;
  latencyMs: number;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Queries & Mutations
// ---------------------------------------------------------------------------

export const useInferenceStatus = () =>
  useQuery({
    queryKey: ["admin", "ai", "inference", "status"],
    queryFn: async () => {
      const { data } = await api.get<{ data: InferenceRuntimeStatus }>(
        "/admin/ai/inference",
      );
      return data.data;
    },
    staleTime: 15_000,
  });

export const useProbeInference = () => {
  return useMutation({
    mutationFn: async (provider?: ProviderName) => {
      const { data } = await api.post<{
        data:
          | ProviderProbeResult
          | { timestamp: string; results: Record<ProviderName, ProviderProbeResult> };
      }>("/admin/ai/inference/probe", provider ? { provider } : {});
      return data.data;
    },
  });
};

export const useSwitchInference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SwitchInferenceInput) => {
      const { data } = await api.post<{ data: InferenceRuntimeStatus }>(
        "/admin/ai/inference/switch",
        payload,
      );
      return data.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["admin", "ai", "inference", "status"], updated);
      toast.success(
        `AI Inference updated: Provider "${updated.activeProvider.toUpperCase()}", Model "${updated.defaultModel}"`,
      );
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || err.message || "Failed to switch provider",
      );
    },
  });
};

export const useTestInference = () => {
  return useMutation({
    mutationFn: async (payload: {
      prompt?: string;
      model?: string;
      timeoutMs?: number;
    }) => {
      const { data } = await api.post<{ data: TestInferenceResult }>(
        "/admin/ai/inference/test",
        payload,
      );
      return data.data;
    },
  });
};
