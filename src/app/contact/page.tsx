"use client";

import { useEffect, useState } from "react";
import styles from "../page.module.css";

interface ContactData {
  email: string;
  github: string;
  twitter: string;
  linkedin: string;
  youtube: string;
  timestamp: string;
}

export default function Contact() {
  const [content, setContent] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/content/contact");
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

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading contact information...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Contact</h1>
      <p className={styles.description}>Special contact page description.</p>

      {!loading && content && (
        <>
          <div
            style={{
              display: "grid",
              gap: "2rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            }}
          >
            <div className={styles.demo}>
              <h2 style={{ marginBottom: "1.5rem" }}>Get In Touch</h2>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ color: "#333", marginBottom: "0.5rem" }}>
                  📺 Youtube
                </h3>
                <p style={{ color: "#666" }}>{content?.youtube}</p>
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ color: "#333", marginBottom: "0.5rem" }}>
                  💼 Linkedin
                </h3>
                <p style={{ color: "#666" }}>{content?.linkedin}</p>
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ color: "#333", marginBottom: "0.5rem" }}>
                  🐦 Twitter
                </h3>
                <p style={{ color: "#666" }}>{content?.twitter}</p>
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ color: "#333", marginBottom: "0.5rem" }}>
                  🐙 GitHub
                </h3>
                <p style={{ color: "#666" }}>{content?.github}</p>
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ color: "#333", marginBottom: "0.5rem" }}>
                  ✉️ Email
                </h3>
                <p style={{ color: "#666" }}>{content?.email}</p>
              </div>
            </div>
          </div>

          <div className={styles.demo}>
            <p className={styles.timestamp}>Content Type: Dynamic</p>
            <p className={styles.timestamp}>
              Last Updated: {content?.timestamp}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
