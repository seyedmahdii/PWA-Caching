const APP_SHELL_CACHE = "app-shell-cache-v1";
const APP_SHELL_FILES = [
  "/",
  "/about",
  "/contact",
  "/products",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/offline.html",
];

self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");

  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => {
        return cache.addAll(APP_SHELL_FILES);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Failed to cache app shell:", error);
      })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== APP_SHELL_CACHE)
            .map((cacheName) => {
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log("service worker activated");
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", (event) => {
  console.log("Service Worker fetching...");

  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
  }
});

async function handleNavigationRequest(request) {
  console.log("Handling navigation request", request.url);

  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log("Serving navigation from cache", request.url);
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(APP_SHELL_CACHE);
      cache.put(request, networkResponse.clone());
      console.log("Cached navigation response:", request.url);
    }
    return networkResponse;
  } catch (error) {
    console.error("Network failed, showing offline.html", error);
    return caches.match("/offline.html");
  }
}

self.addEventListener("sync", (event) => {
  console.log("Background sync triggered:", event.tag);
});
