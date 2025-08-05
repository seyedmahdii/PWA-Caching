export const cartDB = {
  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("CartSyncDB", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("pendingActions")) {
          db.createObjectStore("pendingActions", { keyPath: "timestamp" });
        }
      };
    });
  },

  async addPendingAction(item) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["pendingActions"], "readwrite");
      const store = transaction.objectStore("pendingActions");
      const request = store.add(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getPendingActions() {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["pendingActions"], "readonly");
      const store = transaction.objectStore("pendingActions");
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async removePendingAction(timestamp) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["pendingActions"], "readwrite");
      const store = transaction.objectStore("pendingActions");
      const request = store.delete(timestamp);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
};

export const registerBackgroundSync = async (tag) => {
  if (
    !("serviceWorker" in navigator) ||
    !("sync" in window.ServiceWorkerRegistration.prototype)
  ) {
    console.log("Background sync not supported");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(tag);
    console.log("Background sync registered:", tag);
    return true;
  } catch (error) {
    console.error("Failed to register background sync:", error);
    return false;
  }
};

export const processPendingActionsDirectly = async () => {
  try {
    const pendingActions = await cartDB.getPendingActions();

    if (pendingActions.length === 0) {
      console.log("No pending actions to process");
      return;
    }

    console.log(
      `Processing ${pendingActions.length} pending actions directly...`
    );

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
            await cartDB.removePendingAction(action.timestamp);
            console.log(
              `Successfully processed cart action for ${action.productName}`
            );
          } else {
            console.error(
              `Failed to process cart action for ${action.productName}:`,
              response.status
            );
          }
        }
      } catch (error) {
        console.error(
          `Error processing cart action for ${action.productName}:`,
          error
        );
      }
    }

    console.log("Direct processing completed");
  } catch (error) {
    console.error("Failed to process pending actions directly:", error);
  }
};

export const addToCart = async (productId, productName) => {
  const isOnline = navigator.onLine;

  if (isOnline) {
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, productName }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Cart sync success:", result.message);
        return true;
      }
    } catch (error) {
      console.error("Failed to add to cart online:", error);
    }
  } else {
    try {
      const item = {
        productId,
        productName,
        timestamp: new Date().toISOString(),
        action: "add",
      };

      await cartDB.addPendingAction(item);
      await registerBackgroundSync("sync-cart");
      console.log("Cart action stored for offline sync");
      return true;
    } catch (error) {
      console.error("Failed to store cart action:", error);
    }
  }

  return false;
};
