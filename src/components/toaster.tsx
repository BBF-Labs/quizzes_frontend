import { toast } from "react-hot-toast";

interface ToastOptions {
  title: string;
  description?: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

export const showToast = (
  options: ToastOptions | string,
  type?: "success" | "error"
) => {
  // Handle backward compatibility with old signature
  if (typeof options === "string") {
    const message = options;
    const toastType = type || "success";

    if (toastType === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
    return;
  }

  // Handle new signature
  const { title, description, type: toastType, duration = 4000 } = options;

  const message = description ? `${title}: ${description}` : title;

  switch (toastType) {
    case "success":
      toast.success(message, { duration });
      break;
    case "error":
      toast.error(message, { duration });
      break;
    case "info":
      toast(message, {
        duration,
        icon: "ℹ️",
        style: {
          background: "#3b82f6",
          color: "white",
        },
      });
      break;
    case "warning":
      toast(message, {
        duration,
        icon: "⚠️",
        style: {
          background: "#f59e0b",
          color: "white",
        },
      });
      break;
    default:
      toast(message, { duration });
  }
};

// Convenience functions for common toast types
export const showSuccessToast = (title: string, description?: string) => {
  showToast({ title, description, type: "success" });
};

export const showErrorToast = (title: string, description?: string) => {
  showToast({ title, description, type: "error" });
};

export const showInfoToast = (title: string, description?: string) => {
  showToast({ title, description, type: "info" });
};

export const showWarningToast = (title: string, description?: string) => {
  showToast({ title, description, type: "warning" });
};
