import axios from "axios";
import { clearSession } from "@/lib/session";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // send auth_access / auth_refresh cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple refresh calls simultaneously
let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

const onTokenRefreshed = () => {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

// Auto-refresh on 401 — the auth_refresh httpOnly cookie is sent automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    if (response?.status === 401 && typeof window !== "undefined") {
      if (!originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            addRefreshSubscriber(() => {
              resolve(api(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Refresh token is in the httpOnly cookie — no body needed
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {},
            { withCredentials: true },
          );

          isRefreshing = false;
          onTokenRefreshed();
          return api(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          refreshSubscribers = [];
          clearSession();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        clearSession();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
