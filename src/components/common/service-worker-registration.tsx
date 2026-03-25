"use client";

import { useEffect } from "react";
import { ensurePushSubscription } from "@/lib/push-notifications";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    let isMounted = true;

    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then(async () => {
        if (!isMounted) return;
        // Silent sync when permission is already granted; no prompt on page load.
        await ensurePushSubscription({ promptForPermission: false });
      })
      .catch(() => {
        // Service worker registration failed silently
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
}
