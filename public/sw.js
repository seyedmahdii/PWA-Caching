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
const STATIC_CACHE = "static-cache-v1";
const DYNAMIC_CACHE = "dynamic-cache-v1";

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
            .filter(
              (cacheName) =>
                cacheName !== APP_SHELL_CACHE &&
                cacheName !== STATIC_CACHE &&
                cacheName !== DYNAMIC_CACHE
            )
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
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  if (url.pathname.includes("/_next/static/")) {
    event.respondWith(handleStaticAssetRequest(request));
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(request));
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
  }
});

async function handleStaticAssetRequest(request) {
  console.log("Handling static asset request", request.url);

  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log("Serving static asset from cache", request.url);
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log("Cached static asset response:", request.url);
    }
    return networkResponse;
  } catch (error) {
    console.error("Failed to fetch static asset:", error);
    return new Response("Offline: static asset not available", {
      status: 503,
    });
  }
}

async function handleApiRequest(request) {
  console.log("Handling api request", request.url);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log("Cached api response:", request.url);
    }
    return networkResponse;
  } catch (error) {
    console.error("Failed to fetch api:", error);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log("Serving api response from cache", request.url);
      return cachedResponse;
    }

    return new Response("Offline: no cached data available", {
      status: 503,
    });
  }
}

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

  if (event.tag === "sync-cart") {
    event.waitUntil(syncCartActions());
  }
});

async function syncCartActions() {
  console.log("Performing cart background sync...");

  try {
    const pendingActions = await getPendingActions();

    if (pendingActions.length === 0) {
      console.log("No pending cart actions to sync");
      return;
    }

    console.log(`Syncing ${pendingActions.length} pending cart actions...`);

    for (const action of pendingActions) {
      try {
        if (action.action === "add") {
          const response = await fetch("/api/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: action.productId,
              productName: action.productName,
            }),
          });

          if (response.ok) {
            await removePendingAction(action.timestamp);
            console.log(
              `Successfully synced cart action for ${action.productName}`
            );
          } else {
            console.error(
              `Failed to sync cart action for ${action.productName}:`,
              response.status
            );
          }
        }
      } catch (error) {
        console.error(
          `Error syncing cart action for ${action.productName}:`,
          error
        );
      }
    }

    console.log("Cart background sync completed");
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

async function getPendingActions() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("CartSyncDB", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["pendingActions"], "readonly");
      const store = transaction.objectStore("pendingActions");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("pendingActions")) {
        db.createObjectStore("pendingActions", { keyPath: "timestamp" });
      }
    };
  });
}

async function removePendingAction(timestamp) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("CartSyncDB", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["pendingActions"], "readwrite");
      const store = transaction.objectStore("pendingActions");
      const deleteRequest = store.delete(timestamp);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}
