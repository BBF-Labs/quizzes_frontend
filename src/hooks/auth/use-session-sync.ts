import { useEffect } from "react";
import { AUTH_STATE_KEY } from "@/lib/session";

/**
 * Fires onSessionChange whenever another tab logs in or out.
 * We use a lightweight localStorage signal (auth_state = "active"|"inactive")
 * rather than storing tokens — httpOnly cookies are tab-shared automatically.
 */
export function useSessionSync(onSessionChange: () => void) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key === AUTH_STATE_KEY) {
        onSessionChange();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [onSessionChange]);
}
