import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Types } from "mongoose"

interface IPayment {
  _id: Types.ObjectId
  userId: Types.ObjectId
  amount: number
  reference: string
  date: Date
  endsAt?: Date
  isValid: boolean
  method: string
  accessCode: string
  status: "abandoned" | "failed" | "ongoing" | "pending" | "processing" | "queued" | "success" | "reversed"
  type: "course" | "quiz" | "default"
  package: Types.ObjectId
}

interface PaymentState {
  currentPayment: IPayment | null
  paymentHistory: IPayment[]
}

const initialState: PaymentState = {
  currentPayment: null,
  paymentHistory: [],
}

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setCurrentPayment: (state, action: PayloadAction<IPayment>) => {
      state.currentPayment = action.payload
    },
    setPaymentHistory: (state, action: PayloadAction<IPayment[]>) => {
      state.paymentHistory = action.payload
    },
    addPaymentToHistory: (state, action: PayloadAction<IPayment>) => {
      state.paymentHistory.push(action.payload)
    },
  },
})

export const { setCurrentPayment, setPaymentHistory, addPaymentToHistory } = paymentSlice.actions
export default paymentSlice.reducer

