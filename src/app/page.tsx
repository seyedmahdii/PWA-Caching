"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

interface ContentData {
  features: string[];
  timestamp: string;
}

export default function Home() {
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/content/home");
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
        <p>Loading content...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Home</h1>
      <p className={styles.description}>Special home page description.</p>

      {!loading && content && (
        <>
          <div className={styles.features}>
            <h2>Key Features</h2>
            <ul>
              {content?.features.map((feature, index) => (
                <li key={index} className={styles.feature}>
                  {feature}
                </li>
              ))}
            </ul>
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
