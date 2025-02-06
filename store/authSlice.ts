import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface AuthState {
  isAuthenticated: boolean
  username: string
}

const initialState: AuthState = {
  isAuthenticated: false,
  username: "",
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<AuthState>) => {
      state.isAuthenticated = action.payload.isAuthenticated
      state.username = action.payload.username
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.username = ""
    },
  },
})

export const { setAuth, logout } = authSlice.actions
export default authSlice.reducer

