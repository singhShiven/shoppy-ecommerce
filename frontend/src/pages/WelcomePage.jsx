// src/pages/WelcomePage.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import ProductCard from '../components/ProductCard.jsx';
import FeaturesSection from '../components/FeaturesSection.jsx';
import TestimonialsSection from '../components/TestimonialsSection.jsx';
import { useCart } from '../context/CartContext.jsx'; // Import useCart to get auth state

function WelcomePage({ setIsAuthModalOpen }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [errorFeatured, setErrorFeatured] = useState(null);

  // --- NEW: Get auth state from CartContext ---
  const { currentUser, authLoading } = useCart();
  // --- END NEW ---

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const productsCollectionRef = collection(db, "products");
        const q = query(productsCollectionRef, limit(3));
        const querySnapshot = await getDocs(q);

        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setFeaturedProducts(productsData);
        setLoadingFeatured(false);
      } catch (err) {
        console.error("Error fetching featured products:", err);
        setErrorFeatured("Failed to load featured products.");
        setLoadingFeatured(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleJoinCommunityClick = () => {
    console.log("WelcomePage: Join Community button clicked!");
    setIsAuthModalOpen(true);
  };

  return (
    <div style={{
      padding: '0',
      backgroundColor: 'var(--light-page-bg)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: '100%',
      overflowX: 'hidden'
    }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative', width: '100%', minHeight: '100vh',
        background: 'linear-gradient(45deg, var(--primary-purple) 0%, var(--accent-orange) 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        color: 'white',
        padding: 'var(--spacing-xxxl) var(--spacing-md)',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Floating Decorative Circles - Apply unique classes and animation */}
        <div className="hero-circle hero-circle-1" style={{ position: 'absolute', top: '10%', left: '5%', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', zIndex: 0, animation: 'floatUpAndDown 10s infinite ease-in-out' }}></div>
        <div className="hero-circle hero-circle-2" style={{ position: 'absolute', bottom: '15%', right: '10%', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', zIndex: 0, animation: 'floatDownAndUp 12s infinite ease-in-out' }}></div>
        <div className="hero-circle hero-circle-3" style={{ position: 'absolute', top: '50%', right: '20%', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', zIndex: 0, animation: 'floatUpAndDown 8s infinite ease-in-out reverse' }}></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'var(--font-size-h1)', fontWeight: 'var(--font-weight-bold)', color: 'white', marginBottom: 'var(--spacing-md)', lineHeight: '1.2'
          }}>
            Discover Your <span style={{ color: 'white' }}>Perfect Style</span>
          </h1>
          <p style={{
            fontSize: 'var(--font-size-lg)', color: 'rgba(255,255,255,0.9)', marginBottom: 'var(--spacing-xxl)',
            maxWidth: '600px', margin: '0 auto'
          }}>
            Elevate your curated collections of premium products that elevate your lifestyle. Experience quality, style, and innovation in every purchase.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-md)', flexWrap: 'wrap', marginTop: 'var(--spacing-md)' }}>
            {/* Shop Collection Button (Gradient) */}
            <Link to="/shop" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: 'var(--spacing-sm) var(--spacing-lg)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', borderRadius: 'var(--border-radius-md)', background: 'linear-gradient(90deg, #FFD700, #FFA500)', color: 'white', boxShadow: '0 5px 15px rgba(255,215,0,0.4)', border: 'none'
              }}>
                Start Shopping →
              </button>
            </Link>
            {/* Conditional rendering for Join Community / Order History */}
            {authLoading ? ( /* Show Authenticating state */
                <button style={{ /* Style to match other buttons */
                    padding: 'var(--spacing-sm) var(--spacing-lg)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', borderRadius: 'var(--border-radius-md)', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                }} disabled> Authenticating... </button>
            ) : currentUser ? ( /* Show Order History if logged in */
                <Link to="/orders" style={{ textDecoration: 'none' }}>
                    <button style={{
                        padding: 'var(--spacing-sm) var(--spacing-lg)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', borderRadius: 'var(--border-radius-md)', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    }}>
                        View Orders
                    </button>
                </Link>
            ) : ( /* Show Join Community if logged out */
                <button onClick={handleJoinCommunityClick} style={{
                    padding: 'var(--spacing-sm) var(--spacing-lg)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', borderRadius: 'var(--border-radius-md)', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                }}>
                    Join Community
                </button>
            )}
          </div>
        </div>

        {/* Statistics Row */}
        <div style={{
          position: 'absolute', bottom: 'var(--spacing-xxxl)',
          width: '80%', maxWidth: '900px', display: 'flex', justifyContent: 'space-around', gap: 'var(--spacing-md)',
          color: 'white',
          fontSize: '1.2em', fontWeight: 'bold', flexWrap: 'wrap'
        }}>
          <p style={{ flex: '1 1 auto', textAlign: 'center', padding: '5px' }}>10K+ Happy Customers</p>
          <p style={{ flex: '1 1 auto', textAlign: 'center', padding: '5px' }}>500+ Premium Products</p>
          <p style={{ flex: '1 1 auto', textAlign: 'center', padding: '5px' }}>99% Satisfaction Rate</p>
        </div>

        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute', bottom: 'var(--spacing-md)', left: '50%', transform: 'translateX(-50%)',
          color: 'white', fontSize: '2em', animation: 'bounce 2s infinite',
          zIndex: 1
        }}>
          ↓
        </div>
        {/* Keyframes for bounce are in index.css */}
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Featured Products Section */}
      <section style={{
        maxWidth: '1200px', width: '100%', padding: 'var(--spacing-xl)',
        backgroundColor: 'var(--background-white)', borderRadius: 'var(--border-radius-lg)',
        boxShadow: 'var(--shadow-lg)', marginTop: 'var(--spacing-xxl)',
        position: 'relative', zIndex: 10
      }}>
        <h2 style={{ fontSize: 'var(--font-size-h2)', color: 'var(--text-dark-gray)', marginBottom: 'var(--spacing-lg)', fontWeight: 'var(--font-weight-bold)' }}>Featured Products</h2>
        {loadingFeatured ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading featured products...</div>
        ) : errorFeatured ? (
          <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>Error: {errorFeatured}</div>
        ) : featuredProducts.length > 0 ? (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-lg)', justifyContent: 'center'
          }}>
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center' }}>No featured products available.</p>
        )}
        <Link to="/shop" style={{ textDecoration: 'none', marginTop: 'var(--spacing-xl)', display: 'inline-block' }}>
          <button style={{
            padding: 'var(--spacing-sm) var(--spacing-md)', backgroundColor: '', color: 'white', fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-bold)', borderRadius: 'var(--border-radius-md)', boxShadow: 'var(--shadow-md)'
          }}>
            View All Products →
          </button>
        </Link>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Simple Footer */}
      <footer style={{
        marginTop: 'auto', padding: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted-gray)', width: '100%', textAlign: 'center', boxSizing: 'border-box'
      }}>
        &copy; {new Date().getFullYear()} Shoppy. All rights reserved.
      </footer>
    </div>
  );
}

export default WelcomePage;