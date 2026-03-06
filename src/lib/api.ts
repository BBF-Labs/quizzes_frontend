import axios from "axios";

/**
 * Storage key constants
 */
const TOKEN_KEY = "admin_token";
const REFRESH_TOKEN_KEY = "admin_refresh_token";
const REMEMBER_ME_KEY = "admin_remember_me";

/**
 * Helper to get the correct storage based on "Remember Me" preference.
 * If rememberMe is true, we use localStorage (persistent).
 * Otherwise, we use sessionStorage (tab-scoped).
 */
export const getStorage = () => {
  if (typeof window === "undefined") return null;
  const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === "true";
  return rememberMe ? localStorage : sessionStorage;
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Inject Bearer token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const storage = getStorage();
    const token = storage?.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Flag to prevent multiple refresh calls simultaneously
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.map((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    if (response?.status === 401 && typeof window !== "undefined") {
      const isAdminRoute = window.location.pathname.startsWith("/admin");
      if (!isAdminRoute) return Promise.reject(error);

      const storage = getStorage();
      const refreshToken = storage?.getItem(REFRESH_TOKEN_KEY);

      if (refreshToken && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            addRefreshSubscriber((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt refresh
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            refreshToken,
          });

          const newToken = res.data?.accessToken;
          if (newToken) {
            storage?.setItem(TOKEN_KEY, newToken);
            isRefreshing = false;
            onTokenRefreshed(newToken);
            
            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          isRefreshing = false;
          // Refresh failed -> clear everything and redirect to login
          storage?.removeItem(TOKEN_KEY);
          storage?.removeItem(REFRESH_TOKEN_KEY);
          window.location.href = "/admin/login";
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token or retry failed -> logout
        storage?.removeItem(TOKEN_KEY);
        storage?.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);
