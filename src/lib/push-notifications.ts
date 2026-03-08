import { api } from "@/lib/api";

interface PushSubscribePayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

const APPLICATION_SERVER_KEY_CACHE: { value: string | null } = { value: null };

function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

function urlBase64ToApplicationServerKey(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputBuffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(outputBuffer);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputBuffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

async function getVapidPublicKey(): Promise<string> {
  if (APPLICATION_SERVER_KEY_CACHE.value) {
    return APPLICATION_SERVER_KEY_CACHE.value;
  }

  const res = await api.get("/push/vapid-public-key");
  const key: string | undefined = res.data?.publicKey;

  if (!key) {
    throw new Error("Missing VAPID public key from backend");
  }

  APPLICATION_SERVER_KEY_CACHE.value = key;
  return key;
}

function toBackendPayload(subscription: PushSubscription): PushSubscribePayload {
  const json = subscription.toJSON();

  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;

  if (!subscription.endpoint || !p256dh || !auth) {
    throw new Error("Push subscription is missing endpoint or keys");
  }

  return {
    endpoint: subscription.endpoint,
    keys: { p256dh, auth },
  };
}

export async function getCurrentPushEndpoint(): Promise<string | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription?.endpoint ?? null;
  } catch {
    return null;
  }
}

export async function ensurePushSubscription(options?: {
  promptForPermission?: boolean;
}): Promise<string | null> {
  if (!isPushSupported()) return null;

  try {
    const shouldPrompt = options?.promptForPermission ?? false;

    if (Notification.permission === "denied") {
      return null;
    }

    if (Notification.permission === "default") {
      if (!shouldPrompt) {
        return null;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return null;
      }
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const vapidPublicKey = await getVapidPublicKey();
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToApplicationServerKey(vapidPublicKey),
      });
    }

    const payload = toBackendPayload(subscription);
    await api.post("/push/subscribe", payload);

    return payload.endpoint;
  } catch (error) {
    console.error("[push] Failed to ensure subscription", error);
    return null;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return true;
    }

    const endpoint = subscription.endpoint;

    await api.delete("/push/unsubscribe", {
      data: { endpoint },
    });

    await subscription.unsubscribe();
    return true;
  } catch (error) {
    console.error("[push] Failed to unsubscribe", error);
    return false;
  }
}

export async function resubscribeWithFreshKeys(): Promise<string | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    const existingSubscription = await registration.pushManager.getSubscription();

    if (existingSubscription) {
      await existingSubscription.unsubscribe();
    }

    const vapidPublicKey = await getVapidPublicKey();
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToApplicationServerKey(vapidPublicKey),
    });

    const payload = toBackendPayload(subscription);
    await api.post("/push/subscribe", payload);

    return payload.endpoint;
  } catch (error) {
    console.error("[push] Failed to resubscribe", error);
    return null;
  }
}

export async function sendTestPushNotification(input?: {
  title?: string;
  body?: string;
  url?: string;
}): Promise<boolean> {
  try {
    await api.post("/push/test", {
      title: input?.title,
      body: input?.body,
      url: input?.url,
    });
    return true;
  } catch (error) {
    console.error("[push] Failed to send test push notification", error);
    return false;
  }
}

export function extractPushKeysFromSubscription(subscription: PushSubscription) {
  const keyP256dh = subscription.getKey("p256dh");
  const keyAuth = subscription.getKey("auth");

  return {
    p256dh: keyP256dh ? arrayBufferToBase64(keyP256dh) : null,
    auth: keyAuth ? arrayBufferToBase64(keyAuth) : null,
  };
}
