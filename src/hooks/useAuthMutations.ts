"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Config from "@/config";
import { ILoginResponse } from "@/interfaces";
import { useAuth } from "@/context";
import { useRouter } from "next/navigation";
import { showToast } from "@/components";

const API_URL = Config.API_URL;

interface LoginVariables {
  username: string;
  password: string;
  rememberMe: boolean;
}

export function useAuthMutations() {
  const { login, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async ({ username, password, rememberMe }: LoginVariables) => {
      // 1. Login
      const loginResponse = await axios.post<ILoginResponse>(
        `${API_URL}/auth/login`,
        { username, password, rememberMe },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      
      const { accessToken, refreshToken } = loginResponse.data;

      // 2. Fetch Profile
      const profileResponse = await axios.get(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      return {
          accessToken,
          refreshToken,
          user: profileResponse.data.user
      };
    },
    onSuccess: (data, variables) => {
      const { rememberMe } = variables;
      const { accessToken, refreshToken, user } = data;
      
      const payload = {
          isAuthenticated: true,
          hasMultipleSessions: false,
          credentials: {
            accessToken,
            refreshToken,
          },
          user: {
            email: user.email,
            name: user.name,
            credits: user.quizCredits,
            password: "",
            username: user.username,
            role: user.role,
          },
        };
        login(payload);
        
        // 30 days if rememberMe, else 15 minutes (default session)
        const duration = rememberMe 
            ? 30 * 24 * 60 * 60 * 1000 
            : 15 * 60 * 1000; 
        
        const expiryTime = new Date(Date.now() + duration).toISOString();
        localStorage.setItem("aExpBff", expiryTime);
        
        showToast("Login Successful!", "success");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Login failed";
      showToast(message, "error");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return true; 
    },
    onSuccess: () => {
        logout();
        queryClient.clear();
        router.push("/auth/login");
        showToast("Logged out successfully", "success");
    },
  });

  return {
    login: loginMutation,
    logout: logoutMutation,
  };
}
