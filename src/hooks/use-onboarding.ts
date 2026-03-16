"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

export function useOnboarding() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Get current onboarding status
  const { data: status, isLoading: statusLoading, error: statusError } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: async () => {
      const res = await api.get("/users/onboarding/status");
      return res.data.data;
    },
    enabled: !!user && !authLoading,
  });

  // Update onboarding step
  const updateStepMutation = useMutation({
    mutationFn: async ({ stepId, data, isSkip }: { stepId: string; data?: any; isSkip?: boolean }) => {
      const payload = isSkip ? { skipped: true } : data;
      const res = await api.patch("/users/onboarding/step", {
        step: stepId,
        data: payload,
      });
      return res.data;
    },
    onSuccess: (data) => {
      // Update local cache with new status returned from backend
      queryClient.setQueryData(["onboarding-status"], data.data);
    },
  });

  return {
    status,
    isLoading: statusLoading || authLoading,
    error: statusError,
    updateStep: updateStepMutation.mutate,
    updateStepAsync: updateStepMutation.mutateAsync,
    isUpdating: updateStepMutation.isPending,
    updateError: updateStepMutation.error,
  };
}
