import { AppDispatch, setPaymentDetails } from "@/lib";
import Config from "@/config";
import axios, { AxiosError } from "axios";

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

      if (response.data.authorization_url) {
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
        return response.data.authorization_url;
      } else {
        throw new Error("Try again, failed");
      }
    } catch (error: any) {
      if (error instanceof AxiosError) {
        throw new Error("Payment session could not be created");
      }

      throw new Error("Something went wrong");
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
    if (error instanceof AxiosError) {
      throw new Error("Couldn't verify payment");
    }
    throw new Error("Something went wrong");
  }
};

export { createPayment, verifyPayment };
