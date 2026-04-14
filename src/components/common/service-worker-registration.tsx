"use client";

import { useEffect } from "react";
import {
  ensurePushSubscription,
  resubscribeWithFreshKeys,
} from "@/lib/push-notifications";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    let isMounted = true;

    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then(async () => {
        if (!isMounted) return;

        // One-time resubscription after the push_subscriptions collection was
        // dropped. Forces a fresh browser subscription + backend re-register for
        // every user who already has permission granted.
        const RESUB_FLAG = "push_resub_v1";
        if (
          Notification.permission === "granted" &&
          !localStorage.getItem(RESUB_FLAG)
        ) {
          await resubscribeWithFreshKeys();
          localStorage.setItem(RESUB_FLAG, "1");
        } else {
          // Silent sync when permission is already granted; no prompt on page load.
          await ensurePushSubscription({ promptForPermission: false });
        }
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
