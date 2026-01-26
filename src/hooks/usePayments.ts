import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import Config from "@/config";
import { useAuth } from "@/context";
import { showToast } from "@/components";

const API_URL = Config.API_URL;

interface CreatePaymentVariables {
  paymentData: any;
  accessToken: string;
}

export function usePayments() {
  const { updateUser } = useAuth();

  // Local state for payment info can default to localStorage logic or context,
  // But legacy used Redux for `setPaymentDetails`.
  // If we just need to persist the reference, localStorage is fine.
  // Dispatch is removed.
  
  const createPaymentMutation = useMutation({
    mutationFn: async ({ paymentData, accessToken }: CreatePaymentVariables) => {
      const response = await axios.post(
        `${API_URL}/payments/pay`,
        JSON.stringify(paymentData),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      if (data.authorization_url) {
        localStorage.setItem("reference", data.reference);
        // We can't dispatch legacy `setPaymentDetails` to redux.
        // If this state is needed elsewhere, we might need to store it in Context/LocalStorage.
        // Usually redirect happens immediately.
      }
    },
    onError: (error: any) => {
        const message = error.response?.data?.message || error.message || "Payment initialization failed";
        showToast(message, "error");
    }
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (accessToken: string) => {
       const reference = localStorage.getItem("reference");
       if (!reference) throw new Error("No payment reference found");
       
       const response = await axios.get(
        `${API_URL}/payments/${reference}/verify`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: async (data, accessToken) => {
        try {
            const userRes = await axios.get(`${API_URL}/user/profile`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const user = userRes.data.user;
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
            updateUser(payload);
            showToast("Payment verified successfully", "success");
        } catch (err) {
            console.error("Failed to refresh profile after payment", err);
        }
    },
    onError: (error: any) => {
         const message = error.response?.data?.message || error.message || "Payment verification failed";
         showToast(message, "error");
    }
  });

  return {
    createPayment: createPaymentMutation,
    verifyPayment: verifyPaymentMutation,
  };
}

export function usePaymentHistory(accessToken: string, enabled: boolean = true) {
    return useQuery({
        queryKey: ['payments', accessToken],
        queryFn: async () => {
             const response = await axios.get(
                `${API_URL}/payments/i/user`,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );
              return response.data.payment || [];
        },
        enabled: !!accessToken && enabled,
    });
}
