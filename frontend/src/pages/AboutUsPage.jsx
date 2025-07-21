// src/pages/AboutUsPage.jsx

import React from 'react';
import styles from './AboutUsPage.module.css'; // Import CSS Module

function AboutUsPage() {
  return (
    <div className={styles.aboutPageContainer}>
      {/* Visual Decorations */}
      <div className={styles.decorationCircle1}></div>
      <div className={styles.decorationSquare1}></div>

      <h2 className={styles.sectionTitle}>About Shoppy</h2>

      <p className={styles.introParagraph}>
        Welcome to Shoppy, your ultimate destination for premium products and a seamless shopping experience.
        We believe in curating collections that elevate your lifestyle, offering unparalleled quality, style, and innovation with every purchase.
      </p>

      <section className={styles.missionSection}>
        <h3 style={{ fontSize: 'var(--font-size-h3)', marginBottom: 'var(--spacing-md)', color: 'var(--text-dark-gray)' }}>Our Mission</h3>
        <p className={styles.missionText}>
          Our mission is to empower individuals to discover their perfect style by providing access to unique, high-quality items
          that blend aesthetics with functionality. We are committed to exceptional customer service and a delightful shopping journey from start to finish.
        </p>
      </section>

      <section className={styles.valuesSection}>
        <h3 style={{ fontSize: 'var(--font-size-h3)', marginBottom: 'var(--spacing-md)', color: 'var(--text-dark-gray)' }}>Our Values</h3>
        <ul style={{ listStyle: 'none', padding: 0, marginBottom: 'var(--spacing-lg)' }}>
          <li className={styles.valueItem}>
            <strong>Quality:</strong> We meticulously select products that meet the highest standards of craftsmanship and durability.
          </li>
          <li className={styles.valueItem}>
            <strong>Customer Focus:</strong> Your satisfaction is our priority. We strive to exceed expectations with every interaction.
          </li>
          <li className={styles.valueItem}>
            <strong>Innovation:</strong> We embrace new ideas and technologies to bring you cutting-edge products and an intuitive platform.
          </li>
          <li className={styles.valueItem}>
            <strong>Integrity:</strong> We operate with transparency, honesty, and respect in all our dealings.
          </li>
        </ul>
      </section>

      <p className={styles.closingStatement}>
        Thank you for choosing Shoppy!
        <br />
        Developed by Shivendra Singh, a B.Tech 4th-year student from Manipal University Jaipur.
      </p>
    </div>
  );
}

export default AboutUsPage;