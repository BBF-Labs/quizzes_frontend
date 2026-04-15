const CACHE_NAME = "qz-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/favicon.ico",
  "/favicon-16x16.png",
  "/favicon-32x32.png",
  "/apple-touch-icon.png",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

// Install: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Push: show notification unless the app is already focused.
// Test pushes can force display while focused via data.forceShow.
self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: event.data.text() };
    }
  }

  const title = data.title || "QZ Notification";
  const options = {
    body: data.body || "",
    icon: data.icon || "/icon-192x192.png",
    badge: data.badge || "/favicon-32x32.png",
    data: { url: data.url || "/", ...data.data },
    tag: data.tag || "qz-notification",
    renotify: !!data.tag,
  };

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const appIsFocused = clientList.some((client) => client.focused);
        const forceShow = Boolean(data?.data?.forceShow);
        const isSilentPing = Boolean(data?.data?.isSilentPing);
        
        // Always skip visual notifications for backend sweeper pings
        if (isSilentPing) { return; }

        if (appIsFocused && !forceShow) {
          return;
        }
        
        return self.registration.showNotification(title, options);
      })
  );
});

// NotificationClick: focus an existing tab or open a new one
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus an existing tab that has the target URL
        let targetPathname = "/";
        try {
          targetPathname = new URL(targetUrl, self.location.origin).pathname;
        } catch {
          // Fall through with default pathname
        }
        for (const client of clientList) {
          try {
            const clientPathname = new URL(client.url).pathname;
            if (clientPathname === targetPathname && "focus" in client) {
              return client.focus();
            }
          } catch {
            // Skip clients with unparseable URLs
          }
        }
        // No matching tab — open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// Fetch: network-first with cache fallback
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip API and Next.js internal routes
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        return response;
      })
      .catch(() => caches.match(event.request).then((res) => res || new Response("Not found", { status: 404 })))
  );
});
