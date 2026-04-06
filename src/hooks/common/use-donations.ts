import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DonationEntry {
  _id: string;
  amount: number;
  donorName?: string;
  message?: string;
  isAnonymous: boolean;
  createdAt: string;
}

export interface DonationLedger {
  donations: DonationEntry[];
  totalRaisedGHS: number;
  platformPledgeGHS: number;
}

export interface InitiateDonationInput {
  email: string;
  amountGHS: number;
  donorName?: string;
  message?: string;
  isAnonymous?: boolean;
}

export interface InitiateDonationResult {
  authorizationUrl: string;
  reference: string;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useDonationLedger() {
  return useQuery({
    queryKey: queryKeys.donations.ledger(),
    queryFn: async () => {
      const res = await api.get<{ data: DonationLedger }>("/donations/ledger");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useInitiateDonation() {
  return useMutation({
    mutationFn: async (input: InitiateDonationInput): Promise<InitiateDonationResult> => {
      const res = await api.post<{ data: InitiateDonationResult }>("/donations/initiate", input);
      return res.data.data;
    },
    onSuccess: (data) => {
      window.location.href = data.authorizationUrl;
    },
  });
}
