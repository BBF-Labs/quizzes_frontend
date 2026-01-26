import { useMutation } from "@tanstack/react-query";
import { waitlistService, WaitlistData } from "@/lib/services/waitlistService";
import toast from "react-hot-toast";

export const useWaitlist = () => {
  return useMutation({
    mutationFn: (data: WaitlistData) => waitlistService.addToWaitlist(data),
    onSuccess: () => {
      // Success handling can be customized by the component
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to join waitlist. Please try again.";
      toast.error(message);
    },
  });
};
