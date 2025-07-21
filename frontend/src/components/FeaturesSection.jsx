// src/components/FeaturesSection.jsx

import React from 'react';
import styles from './FeaturesSection.module.css';

function FeaturesSection() {
  const features = [
    {
      icon: '🚚', // Truck emoji or replace with actual icon font/SVG
      title: 'Free Shipping',
      description: 'Enjoy free shipping on all orders over $99',
      color: 'var(--primary-purple)' // From index.css variables
    },
    {
      icon: '🛡️', // Shield emoji or replace
      title: 'Secure Payment',
      description: 'Your payment information is safe with us',
      color: 'var(--accent-orange)' // From index.css variables
    },
    {
      icon: '📞', // Headphone emoji or replace
      title: '24/7 Support',
      description: 'Get help whenever you need it',
      color: 'var(--primary-purple)' // From index.css variables
    },
  ];

  return (
    <section className={styles.featuresSection}>
      <h2 className={styles.sectionTitle}>Why Choose Us?</h2> {/* Ensure this title is present and styled */}
      <div className={styles.featuresGrid}>
        {features.map((feature, index) => (
          <div key={index} className={styles.featureCard}>
            <div className={styles.iconContainer} style={{ background: `linear-gradient(45deg, ${feature.color}, ${feature.color}CC)` }}> {/* Use color-mix or rgba for lighter gradient end if needed */}
              <span className={styles.icon}>{feature.icon}</span>
            </div>
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <p className={styles.featureDescription}>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturesSection;