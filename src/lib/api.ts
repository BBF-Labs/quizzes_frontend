import axios from "axios";
import { clearSession, getAccessToken, getRefreshToken, setSession } from "@/lib/session";
import type { SessionUser } from "@/lib/session";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the access token as a Bearer header on every outgoing request.
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Flag to prevent multiple concurrent refresh calls.
let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

const onTokenRefreshed = () => {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

// On 401, attempt a silent token refresh then replay the original request.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    if (response?.status === 401 && typeof window !== "undefined") {
      if (!originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            addRefreshSubscriber(() => resolve(api(originalRequest)));
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            // No point in retrying if we don't even have a refresh token
            throw new Error("UNAUTHENTICATED");
          }

          const res = await axios.post<{
            user: SessionUser;
            accessToken: string;
            refreshToken: string;
          }>(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refreshToken },
          );

          const { user, accessToken, refreshToken: newRefreshToken } = res.data;
          setSession(user, accessToken, newRefreshToken);

          isRefreshing = false;
          onTokenRefreshed();
          return api(originalRequest);
        } catch (refreshError: any) {
          isRefreshing = false;
          refreshSubscribers = [];
          clearSession();

          // If the refresh call itself failed because the token was invalid, or we had none
          if (refreshError.message === "No refresh token") {
             refreshError.message = "UNAUTHENTICATED";
          }
          
          return Promise.reject(refreshError);
        }
      } else {
        clearSession();
      }
    }

    return Promise.reject(error);
  },
);
