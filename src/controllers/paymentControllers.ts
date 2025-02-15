import { AppDispatch, setPaymentDetails } from "@/lib";
import Config from "@/config";
import axios, { AxiosError } from "axios";
import { sessionSet, update } from "@/lib/reducers";

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
        if (
          error.response?.data.message ==
          "Error validating token: Multiple sessions detected. Please login again."
        ) {
          dispatch(sessionSet());
          return;
        }
        throw new Error(error.response?.data.message);
      }

      throw new Error("Something went wrong");
    }
  };

const verifyPayment =
  (accessToken: string) => async (dispatch: AppDispatch) => {
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
        const user = await getUserInfo(accessToken);

        const payload = {
          isAuthenticated: true,
          credentials: {
            accessToken: accessToken,
            refreshToken: "",
          },
          user: {
            email: user.email,
            name: user.name,
            password: "",
            credits: user.quizCredits,
            username: user.username,
            role: user.role,
          },
        };

        console.log(response.data);

        dispatch(update(payload));
        return response.data;
      }
    } catch (error: any) {
      if (error instanceof AxiosError) {
        if (
          error.response?.data.message ==
          "Error validating token: Multiple sessions detected. Please login again."
        ) {
          dispatch(sessionSet());
          return;
        }
        throw new Error(error.response?.data.message);
      }

      throw new Error("Something went wrong");
    }
  };

interface IAllPaymentsResponse {
  message: string;
  payment: any[];
}

const getAllPayments =
  (accessToken: string) => async (dispatch: AppDispatch) => {
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
        if (
          error.response?.data.message ==
          "Error validating token: Multiple sessions detected. Please login again."
        ) {
          dispatch(sessionSet());
          return;
        }
        throw new Error(error.response?.data.message);
      }

      throw new Error("Something went wrong");
    }
  };

export { createPayment, verifyPayment, getAllPayments };
