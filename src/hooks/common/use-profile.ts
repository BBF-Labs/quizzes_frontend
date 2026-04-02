import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { IUpload } from "./use-upload";

export function useProfileCheck() {
  return useMutation({
    mutationFn: async (data: {
      username?: string;
      currentPassword?: string;
    }) => {
      const response = await api.post("/users/check", data);
      return response.data.data;
    },
  });
}

export function useProfileUpdate() {
  return useMutation({
    mutationFn: async (data: {
      username?: string;
      password?: string;
      currentPassword?: string;
      profilePicture?: string | IUpload;
      notificationSettings?: any;
    }) => {
      const response = await api.put("/users/profile", data);
      return response.data.data;
    },
  });
}
