"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type: "success" | "info" | "error";
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type,
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          background: "#10b981",
          borderColor: "#059669",
        };
      case "error":
        return {
          background: "#ef4444",
          borderColor: "#dc2626",
        };
      case "info":
      default:
        return {
          background: "#3b82f6",
          borderColor: "#2563eb",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 50,
        transition: "all 0.3s ease",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(-0.5rem)",
      }}
    >
      <div
        style={{
          ...styles,
          color: "white",
          padding: "0.75rem 1rem",
          borderRadius: "0.5rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          border: `1px solid ${styles.borderColor}`,
          maxWidth: "20rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
            {message}
          </span>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            style={{
              marginLeft: "0.75rem",
              color: "white",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.25rem",
              lineHeight: "1",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
