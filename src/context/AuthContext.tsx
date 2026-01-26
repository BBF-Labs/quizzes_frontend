"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { IAuthState, IUser } from "@/interfaces";
import { useRouter } from "next/navigation";

// Define the shape of the Context
interface AuthContextType extends IAuthState {
  login: (payload: IAuthState) => void;
  logout: () => void;
  updateUser: (payload: Partial<IAuthState>) => void;
  setSession: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<IAuthState>({
    isAuthenticated: false,
    hasMultipleSessions: false,
    credentials: {
      accessToken: "",
      refreshToken: "",
    },
    user: {
      email: "",
      name: "",
      credits: 0,
      password: "",
      username: "",
      role: "",
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const storedAuth = localStorage.getItem("bbf_auth_state");
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          // Verify token hasn't expired
          const expiryTime = localStorage.getItem("aExpBff");
          if (expiryTime && new Date(expiryTime) > new Date()) {
            setState(parsedAuth);
          } else {
            // Clear expired auth
            localStorage.removeItem("bbf_auth_state");
            localStorage.removeItem("aExpBff");
          }
        }
      } catch (error) {
        console.error("Failed to load auth state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading && state.isAuthenticated) {
      localStorage.setItem("bbf_auth_state", JSON.stringify(state));
    } else if (!isLoading && !state.isAuthenticated) {
      localStorage.removeItem("bbf_auth_state");
    }
  }, [state, isLoading]);

  const login = (payload: IAuthState) => {
    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      credentials: payload.credentials,
      user: payload.user,
      hasMultipleSessions: false,
    }));
  };

  const logout = () => {
    setState({
      isAuthenticated: false,
      hasMultipleSessions: false,
      credentials: { accessToken: "", refreshToken: "" },
      user: {
        email: "",
        name: "",
        credits: 0,
        password: "",
        username: "",
        role: "",
      },
    });
    // Clear all auth-related localStorage
    localStorage.removeItem("bbf_auth_state");
    localStorage.removeItem("aExpBff");
  };

  const updateUser = (payload: Partial<IAuthState>) => {
    setState((prev) => ({
      ...prev,
      ...payload,
      user: payload.user ? { ...prev.user, ...payload.user } : prev.user,
    }));
  };

  const setSession = () => {
    setState((prev) => ({ ...prev, hasMultipleSessions: true }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateUser,
        setSession,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
