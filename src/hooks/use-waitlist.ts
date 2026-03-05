"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface WaitlistData {
  name: string;
  email: string;
  university?: string;
  universityId?: string;
}

export function useJoinWaitlist() {
  return useMutation({
    mutationFn: async (data: WaitlistData) => {
      data.email = data.email.trim().toLowerCase();
      const response = await api.post("/system/waitlist", data);
      return response.data;
    },
  });
}
