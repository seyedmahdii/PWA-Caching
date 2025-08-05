"use client";

import { useEffect, useState } from "react";
import styles from "../page.module.css";
import Toast from "../../components/Toast";
import { addToCart, processPendingActionsDirectly } from "../../utils/cartSync";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface ProductsData {
  products: Product[];
  timestamp: string;
}

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

export default function Products() {
  const [content, setContent] = useState<ProductsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/content/products");
        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error("Failed to load content:", error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  const showToast = (
    message: string,
    type: "success" | "info" | "error" = "info"
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleAddToCart = async (product: Product) => {
    const isOnline = navigator.onLine;

    try {
      const success = await addToCart(product.id, product.name);

      if (success) {
        if (isOnline) {
          showToast(`${product.name} added to cart!`, "success");
        } else {
          showToast(
            `${product.name} added to cart (will sync when online)`,
            "info"
          );
        }
      } else {
        showToast("Failed to add to cart", "error");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      showToast("Failed to add to cart", "error");
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Products</h1>
      <p className={styles.description}>Special products page description.</p>

      {!loading && content && (
        <>
          <div className={styles.features}>
            <h2>Available Products</h2>
            <div
              style={{
                display: "grid",
                gap: "1.5rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              }}
            >
              {content?.products.map((product) => (
                <div
                  key={product.id}
                  style={{
                    background: "rgba(255, 255, 255, 0.7)",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(102, 126, 234, 0.2)",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    transition: "transform 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(102, 126, 234, 0.1)",
                      padding: "0.5rem 1rem",
                      borderRadius: "20px",
                      display: "inline-block",
                      marginBottom: "1rem",
                      fontSize: "0.9rem",
                      color: "#667eea",
                      fontWeight: "bold",
                    }}
                  >
                    {product.category}
                  </div>
                  <h3 style={{ marginBottom: "0.5rem", color: "#333" }}>
                    {product.name}
                  </h3>
                  <p
                    style={{
                      color: "#666",
                      lineHeight: "1.6",
                      marginBottom: "1rem",
                    }}
                  >
                    {product.description}
                  </p>
                  <div
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      color: product.price === 0 ? "#28a745" : "#333",
                      marginBottom: "1rem",
                    }}
                  >
                    {product.price === 0 ? "Free" : `$${product.price}`}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    style={{
                      background: "#667eea",
                      color: "white",
                      border: "none",
                      padding: "0.75rem 1.5rem",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#5a67d8";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#667eea";
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.demo}>
            <p className={styles.timestamp}>Content Type: Dynamic</p>
            <p className={styles.timestamp}>
              Last Updated: {content?.timestamp}
            </p>

            <button
              onClick={processPendingActionsDirectly}
              style={{
                background: "#10b981",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                cursor: "pointer",
                marginTop: "0.5rem",
              }}
            >
              Manual Sync
            </button>
          </div>
        </>
      )}

      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
