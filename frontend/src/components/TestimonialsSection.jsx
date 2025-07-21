// src/components/TestimonialsSection.jsx

import React from 'react';
import styles from './TestimonialsSection.module.css'; // <-- NEW: Import CSS Module

function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      customerName: "John Doe",
      avatarInitials: "JD",
      rating: 5,
      review: "Amazing quality and fast shipping! The products exceeded my expectations. Highly recommended!",
      verified: true
    },
    {
      id: 2,
      customerName: "Jane Smith",
      avatarInitials: "JS",
      rating: 5,
      review: "A seamless shopping experience. Every product is exactly as described. Will definitely shop again.",
      verified: true
    },
    {
      id: 3,
      customerName: "Alex Chen",
      avatarInitials: "AC",
      rating: 4,
      review: "Great collection and responsive support. Just wish there were more color options!",
      verified: true
    },
  ];

  const renderStars = (rating) => {
    let stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} style={{ color: i < rating ? 'gold' : 'lightgray' }}>★</span>
      );
    }
    return stars;
  };

  return (
    <section className={styles.testimonialsSection}>
      <h2 className={styles.sectionTitle}>What Our Customers Say</h2>
      <div className={styles.testimonialsGrid}>
        {testimonials.map(testimonial => (
          <div key={testimonial.id} className={styles.testimonialCard}>
            <div className={styles.ratingStars}>
              {renderStars(testimonial.rating)}
            </div>
            <p className={styles.reviewText}>"{testimonial.review}"</p>
            <div className={styles.customerInfo}>
              <div className={styles.avatar}>{testimonial.avatarInitials}</div>
              <div className={styles.customerDetails}>
                <p className={styles.customerName}>{testimonial.customerName}</p>
                {testimonial.verified && (
                  <span className={styles.verifiedBadge}>Verified Customer</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TestimonialsSection;