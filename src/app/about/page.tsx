"use client";

import styles from "../page.module.css";

export default function About() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>About</h1>
      <p className={styles.description}>Special about page description.</p>

      <div className={styles.demo}>
        <p className={styles.timestamp}>Content Type: Static</p>
      </div>
    </div>
  );
}
