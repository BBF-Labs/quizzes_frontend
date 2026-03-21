import { useEffect } from "react";

const SESSION_KEYS = new Set([
  "auth_token",
  "auth_refresh_token",
  "auth_remember_me",
  "admin_token",
  "admin_refresh_token",
  "admin_remember_me",
]);

export function useSessionSync(onSessionChange: () => void) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || SESSION_KEYS.has(event.key)) {
        onSessionChange();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [onSessionChange]);
}
