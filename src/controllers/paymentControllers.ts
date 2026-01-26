import Config from "@/config";
import axios, { AxiosError } from "axios";

const getUserInfo = async (accessToken: string) => {
  try {
    const response = await axios.get(`${Config.API_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const createPayment = async (paymentdata: any, accessToken: string) => {
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
        // Storing reference in localStorage for verification flow
        localStorage.setItem("reference", response.data.reference);
        return response.data.authorization_url;
      } else {
        throw new Error("Try again, failed");
      }
    } catch (error: any) {
      if (error instanceof AxiosError) {
         // Handle session errors at the component level or interceptor
        throw new Error(error.response?.data.message || "Payment creation failed");
      }

      throw new Error("Something went wrong");
    }
  };

const verifyPayment = async (accessToken: string) => {
    try {
      const reference = localStorage.getItem("reference");
      if (!reference) throw new Error("No payment reference found");

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
        // Backend verification might return updated user data or just success
        // We will return response data so component can update context
        return response.data;
      }
    } catch (error: any) {
      if (error instanceof AxiosError) {
         throw new Error(error.response?.data.message || "Payment verification failed");
      }

      throw new Error("Something went wrong");
    }
  };

interface IAllPaymentsResponse {
  message: string;
  payment: any[];
}

const getAllPayments = async (accessToken: string) => {
    try {
      const response = await axios.get<IAllPaymentsResponse>(
        `${Config.API_URL}/payments/i/user`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.payment) {
        return response.data.payment;
      }
      return [];
    } catch (error: any) {
      if (error instanceof AxiosError) {
         // handle error
         throw new Error(error.response?.data.message || "Failed to fetch payments");
      }

      throw new Error("Something went wrong");
    }
  };

  export { createPayment, verifyPayment, getAllPayments };