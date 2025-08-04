self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
});

self.addEventListener("fetch", (event) => {
  console.log("Service Worker fetching...");
});

self.addEventListener("sync", (event) => {
  console.log("Background sync triggered:", event.tag);
});
