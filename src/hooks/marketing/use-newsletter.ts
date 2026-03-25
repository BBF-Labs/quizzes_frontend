"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post("/system/newsletter/subscribe", { 
        email: email.trim().toLowerCase() 
      });
      return response.data;
    },
  });
}

export function useConfirmNewsletter() {
  return useMutation({
    mutationFn: async (token: string) => {
      const response = await api.get(`/system/newsletter/confirm?token=${token}`);
      return response.data;
    },
  });
}

export function useUnsubscribeNewsletter() {
  return useMutation({
    mutationFn: async (token: string) => {
      const response = await api.get(`/system/newsletter/unsubscribe?token=${token}`);
      return response.data;
    },
  });
}
