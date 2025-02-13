import { AppDispatch, setPaymentDetails } from "@/lib";
import Config from "@/config";
import axios from "axios";

const createPayment =
  (paymentdata: any, accessToken: string) => async (dispatch: AppDispatch) => {
    try {
      const response = await axios.post(
        `${Config.API_URL}/payments/pay`,
        JSON.stringify(paymentdata),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response) {
        const payload = {
          packageId: paymentdata.packageId || "",
          amount: paymentdata.amount,
          email: paymentdata.email,
          reference: response.data.reference,
          accessCode: "",
          status: "pending",
          discountCode: paymentdata.discountCode || "",
        };
        localStorage.setItem("reference", response.data.reference);
        dispatch(setPaymentDetails(payload));
      }

      return response.data.authorization_url;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

const verifyPayment = (accessToken: string) => async () => {
  try {
    const reference = localStorage.getItem("reference");
    const response = await axios.get(
      `${Config.API_URL}/payments/${reference}/verify`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response) {
      return response.data.transaction.status;
    }
  } catch (error: any) {
    console.log(error.message);
  }
};

export { createPayment, verifyPayment };
