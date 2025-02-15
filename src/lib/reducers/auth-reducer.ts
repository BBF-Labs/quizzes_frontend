import { IAuthState } from "@/interfaces";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const intialState: IAuthState = {
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
};

const authSlice = createSlice({
  name: "auth",
  initialState: intialState,
  reducers: {
    login(state, action: PayloadAction<IAuthState>) {
      state.isAuthenticated = true;
      state.credentials = action.payload.credentials;
      state.user = action.payload.user;
      state.hasMultipleSessions = false;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.hasMultipleSessions = false;
      state.credentials = {
        accessToken: "",
        refreshToken: "",
      };
      state.user = {
        email: "",
        name: "",
        credits: 0,
        password: "",
        username: "",
        role: "",
      };
    },
    update(state, action: PayloadAction<Partial<IAuthState>>) {
      state.user = action.payload.user!;
      state.credentials = action.payload.credentials!;
      state.isAuthenticated = true;
      state.hasMultipleSessions = false;
    },
    sessionSet(state) {
      state.hasMultipleSessions = true;
    },
  },
});

export const { login, logout, update, sessionSet } = authSlice.actions;

export default authSlice.reducer;
