import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./authSlice"
import quizReducer from "./quizSlice"
import packageReducer from "./packageSlice"
import paymentReducer from "./paymentSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    quiz: quizReducer,
    package: packageReducer,
    payment: paymentReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

