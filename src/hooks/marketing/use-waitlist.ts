"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface WaitlistData {
  name: string;
  email: string;
}

export function useJoinWaitlist() {
  return useMutation({
    mutationFn: async (data: WaitlistData) => {
      const payload: WaitlistData = {
        ...data,
        email: data.email.trim().toLowerCase(),
        name: data.name.trim(),
      };

      const response = await api.post("/system/waitlist", payload);
      return response.data;
    },
  });
}
