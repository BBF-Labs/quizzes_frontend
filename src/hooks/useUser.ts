"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Config from "@/config";
import { useAuth } from "@/context";
import { showToast } from "@/components";

const API_URL = Config.API_URL;

export function useUser() {
  const { updateUser } = useAuth();
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await axios.post(
        `${API_URL}/user/register`,
        JSON.stringify(userData),
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data;
    },
    onError: (error: any) => {
        const message = error.response?.data?.message || error.message || "Registration failed";
        showToast(message, "error");
    },
    onSuccess: () => {
        showToast("Registration successful! Please login.", "success");
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userData, accessToken }: { userData: any; accessToken: string }) => {
      const response = await axios.put(
        `${API_URL}/user/update`,
        JSON.stringify(userData),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
       if (data && data.user) {
         // Update auth context similar to legacy controller
         const payload = {
            isAuthenticated: true,
            credentials: {
              accessToken: variables.accessToken,
              refreshToken: "", 
            },
            user: {
              email: data.user.email,
              name: data.user.name,
              password: "",
              credits: data.user.quizCredits,
              username: data.user.username,
              role: data.user.role,
            },
          };
          updateUser(payload);
          showToast("Profile updated successfully", "success");
       }
    },
    onError: (error: any) => {
        const message = error.response?.data?.message || error.message || "Update failed";
        showToast(message, "error");
    }
  });

  return {
    register: registerMutation,
    updateUser: updateUserMutation,
  };
}
