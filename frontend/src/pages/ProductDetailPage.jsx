// src/pages/ProductDetailPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'; // <-- NEW: Import updateDoc and increment
import { db } from '../firebaseConfig';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { toast } from 'react-toastify';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, cartItems, updateItemQuantity } = useCart();
  const { isProductInWishlist, toggleWishlist } = useWishlist();
  const [currentQuantity, setCurrentQuantity] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productDocRef = doc(db, "products", id);
        const productSnap = await getDoc(productDocRef);

        if (productSnap.exists()) {
          const productData = { id: productSnap.id, ...productSnap.data() };
          setProduct(productData);

          // --- NEW: Increment view count ---
          await updateDoc(productDocRef, {
            views: increment(1) // Atomically increments the 'views' field by 1
          });
          console.log(`Product ${productData.name} views incremented.`);
          // --- END NEW ---

        } else {
          setError("Product not found.");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching or updating product views:", err);
        setError("Failed to load product details or update views.");
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    } else {
      setError("No product ID provided.");
      setLoading(false);
    }
  }, [id]); // Re-run effect if ID changes

  useEffect(() => {
    if (product) {
      const itemInCart = cartItems.find(item => item.id === product.id);
      setCurrentQuantity(itemInCart ? itemInCart.quantity : 0);
      setIsFavorited(isProductInWishlist(product.id));
    }
  }, [cartItems, product, isProductInWishlist]);


  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleIncrement = () => {
    if (product) {
      updateItemQuantity(product.id, currentQuantity + 1);
    }
  };

  const handleDecrement = () => {
    if (product && currentQuantity > 0) {
      updateItemQuantity(product.id, currentQuantity - 1);
    }
  };

  const handleToggleWishlist = () => {
    if (product) {
      toggleWishlist(product);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading product details...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Error: {error}</div>;
  }

  if (!product) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Product not available.</div>;
  }

  return (
    <div style={{
      padding: 'var(--spacing-xl)',
      maxWidth: '1000px',
      margin: 'var(--spacing-lg) auto',
      backgroundColor: 'var(--background-white)',
      borderRadius: 'var(--border-radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      boxSizing: 'border-box'
    }}>
      {/* Back Button */}
      <button onClick={handleGoBack} style={{
          padding: 'var(--spacing-sm) var(--spacing-md)',
          backgroundColor: '',
          color: 'white',
          borderRadius: 'var(--border-radius-sm)',
          fontSize: 'var(--font-size-base)',
          marginBottom: 'var(--spacing-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          boxShadow: 'var(--shadow-sm)',
          transition: 'transform var(--transition-speed) var(--transition-ease), box-shadow var(--transition-speed) var(--transition-ease)',
      }}>
          ← Back
      </button>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-xl)'
      }}>
        {/* Product Overview Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 'var(--spacing-xl)',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}>
          {/* Product Image */}
          <div style={{
            flex: '1 1 400px',
            minWidth: '300px',
            maxWidth: '450px',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 'var(--border-radius-md)',
            overflow: 'hidden',
            backgroundColor: 'var(--light-page-bg)',
            boxShadow: 'var(--shadow-md)',
          }}>
            {product.imageUrl && <img src={product.imageUrl} alt={product.name} style={{ maxWidth: '100%', height: 'auto', maxHeight: '450px', objectFit: 'contain', display: 'block' }} />}
            {/* Heart Icon on Product Image */}
            <div style={{
              position: 'absolute', top: 'var(--spacing-md)', right: 'var(--spacing-md)', zIndex: 10,
              backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '50%', padding: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
              transition: 'background-color 0.2s ease, transform 0.1s ease',
            }} onClick={handleToggleWishlist}>
              <span style={{ fontSize: '1.5em', color: isFavorited ? 'var(--danger-color)' : 'var(--text-muted-gray)' }}>
                  {isFavorited ? '❤️' : '🤍'}
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div style={{ flex: '1 1 400px', padding: 'var(--spacing-md)' }}>
            <h1 style={{ fontSize: 'var(--font-size-h1)', color: 'var(--text-dark-gray)', marginBottom: 'var(--spacing-sm)' }}>{product.name}</h1>
            <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--primary-purple)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-md)' }}>${product.price ? product.price.toFixed(2) : 'N/A'}</p>

            {/* Rating Section (Placeholder) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-md)' }}>
              <span style={{ color: 'gold', fontSize: '1.2em' }}>★★★★☆</span>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted-gray)' }}>(4.5/5.0 based on 120 reviews)</span>
            </div>

            <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-dark-gray)', lineHeight: '1.6', marginBottom: 'var(--spacing-lg)' }}>{product.description}</p>

            <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-muted-gray)', marginBottom: 'var(--spacing-md)' }}>
              Availability:
              <span style={{ color: product.stock > 0 ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 'var(--font-weight-bold)', marginLeft: 'var(--spacing-xs)' }}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </span>
            </p>

            {/* Quantity and Add to Cart */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-light-gray)', borderRadius: 'var(--border-radius-sm)' }}>
                <button onClick={handleDecrement} style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)', backgroundColor: 'var(--secondary-color)', color: 'white', border: 'none', borderTopLeftRadius: 'var(--border-radius-sm)', borderBottomLeftRadius: 'var(--border-radius-sm)', cursor: 'pointer', fontSize: 'var(--font-size-md)'
                }} disabled={currentQuantity === 0}>-</button>
                <span style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)', fontSize: 'var(--font-size-md)', color: 'var(--text-dark-gray)', fontWeight: 'var(--font-weight-bold)'
                }}>{currentQuantity}</span>
                <button onClick={handleIncrement} style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)', backgroundColor: 'var(--primary-purple)', color: 'white', border: 'none', borderTopRightRadius: 'var(--border-radius-sm)', borderBottomRightRadius: 'var(--border-radius-sm)', cursor: 'pointer', fontSize: 'var(--font-size-md)'
                }} disabled={product.stock <= currentQuantity}>+</button>
              </div>
              <button onClick={handleAddToCart} style={{
                padding: 'var(--spacing-sm) var(--spacing-lg)', backgroundColor: 'var(--primary-purple)', color: 'white', border: 'none', borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-bold)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)'
              }} disabled={product.stock <= 0}>
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Details (Tabs or Sections) */}
        <div style={{
          marginTop: 'var(--spacing-xl)',
          borderTop: '1px solid var(--border-light-gray)',
          paddingTop: 'var(--spacing-xl)'
        }}>
          <h3 style={{ fontSize: 'var(--font-size-h3)', color: 'var(--text-dark-gray)', marginBottom: 'var(--spacing-md)' }}>Product Specifications</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-base)', color: 'var(--text-muted-gray)' }}>• Material: High-quality polymer</li>
            <li style={{ marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-base)', color: 'var(--text-muted-gray)' }}>• Dimensions: 10cm x 15cm x 2cm</li>
            <li style={{ marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-base)', color: 'var(--text-muted-gray)' }}>• Weight: 250g</li>
            <li style={{ marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-base)', color: 'var(--text-muted-gray)' }}>• Manufacturer: ExampleCo</li>
          </ul>
        </div>

        {/* Customer Reviews Section (Placeholder) */}
        <div style={{
          marginTop: 'var(--spacing-xl)',
          borderTop: '1px solid var(--border-light-gray)',
          paddingTop: 'var(--spacing-xl)'
        }}>
          <h3 style={{ fontSize: 'var(--font-size-h3)', color: 'var(--text-dark-gray)', marginBottom: 'var(--spacing-md)' }}>Customer Reviews</h3>
          <div style={{
            backgroundColor: 'var(--light-page-bg)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--border-radius-md)',
            boxShadow: 'var(--shadow-sm)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-muted-gray)', marginBottom: 'var(--spacing-md)' }}>No reviews yet. Be the first to review this product!</p>
            <button style={{
              padding: 'var(--spacing-sm) var(--spacing-md)', backgroundColor: 'var(--accent-orange)', color: 'white', border: 'none', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', fontSize: 'var(--font-size-md)'
            }}>Write a Review</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;