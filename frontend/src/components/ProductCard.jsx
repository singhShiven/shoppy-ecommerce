// src/components/ProductCard.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import styles from './ProductCard.module.css'; // <-- NEW: Import CSS Module

function ProductCard({ product }) {
  const { addToCart, cartItems, updateItemQuantity, removeFromCart } = useCart();
  const { isProductInWishlist, toggleWishlist } = useWishlist();

  const [currentQuantity, setCurrentQuantity] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const itemInCart = cartItems.find(item => item.id === product.id);
    setCurrentQuantity(itemInCart ? itemInCart.quantity : 0);
    setIsFavorited(isProductInWishlist(product.id));
  }, [cartItems, product.id, isProductInWishlist]);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    updateItemQuantity(product.id, currentQuantity + 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    updateItemQuantity(product.id, currentQuantity - 1);
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation(); // Prevent Link from triggering
    e.preventDefault(); // Prevent default link behavior if inside Link
    toggleWishlist(product);
  };

  return (
    <div className={styles.productCardItem}> {/* Apply main card class */}
      <Link to={`/product/${product.id}`} className={styles.productLink}> {/* Apply link class */}
        {/* Heart Icon (positioned absolutely for more control) */}
        <div className={styles.heartIconContainer} onClick={handleToggleWishlist}> {/* Apply heart icon container class */}
            <span className={styles.heartIcon} style={{ color: isFavorited ? 'var(--danger-color)' : 'var(--text-muted-gray)' }}>
                {isFavorited ? '❤️' : '🤍'}
            </span>
        </div>

        <h3 className={styles.productName}>{product.name}</h3> {/* Apply name class */}
        {product.imageUrl && <img src={product.imageUrl} alt={product.name} className={styles.productImage} />} {/* Apply image class */}
        <p className={styles.productDescription}>{product.description ? product.description.substring(0, 100) + '...' : ''}</p> {/* Apply description class */}
        {/* Rating Stars (Placeholder) */}
        <div className={styles.ratingStars}>★★★★☆</div> {/* Apply stars class */}
        <p className={styles.productPrice}>${product.price ? product.price.toFixed(2) : 'N/A'}</p> {/* Apply price class */}
        <p className={styles.productStock}>Stock: {product.stock}</p> {/* Apply stock class */}
      </Link>

      {/* Conditional Rendering for Add to Cart vs Quantity Controls */}
      {currentQuantity === 0 ? (
        <button onClick={handleAddToCart} className={styles.addToCartButton} disabled={product.stock <= 0}> {/* Apply button class */}
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      ) : (
        <div className={styles.quantityControls}> {/* Apply quantity controls class */}
          <button onClick={handleDecrement} className={styles.quantityButton}>-</button> {/* Apply button class */}
          <span className={styles.currentQuantity}>
            {currentQuantity}
          </span>
          <button onClick={handleIncrement} className={`${styles.quantityButton} ${styles.primary}`}>+</button> {/* Apply button class and primary variant */}
        </div>
      )}
    </div>
  );
}

export default ProductCard;