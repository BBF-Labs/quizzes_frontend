import { IPaymentState } from "@/interfaces";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: IPaymentState = {
  packageId: "",
  amount: 0,
  email: "",
  reference: "",
  accessCode: "",
  status: "pending",
  discountCode: "",
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setPaymentDetails(state, action: PayloadAction<IPaymentState>) {
      state.packageId = action.payload.packageId;
      state.amount = action.payload.amount;
      state.email = action.payload.email;
      state.reference = action.payload.reference;
      state.accessCode = action.payload.accessCode;
      state.status = action.payload.status;
      state.discountCode = action.payload.discountCode;
    },
  },
});

export const { setPaymentDetails } = paymentSlice.actions;
export default paymentSlice.reducer;
