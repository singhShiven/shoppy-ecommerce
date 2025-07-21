// src/components/ProductList.jsx

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import ProductCard from './ProductCard.jsx'; // Ensure ProductCard is imported
import styles from './ProductList.module.css'; // <-- NEW: Import CSS Module

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollectionRef = collection(db, "products");
        const querySnapshot = await getDocs(productsCollectionRef);

        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setProducts(productsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className={styles.productListContainer} style={{textAlign: 'center', padding: '50px'}}>Loading products...</div>; /* Apply container style */
  }

  if (error) {
    return <div className={styles.productListContainer} style={{color: 'red', textAlign: 'center', padding: '50px'}}>Error: {error}</div>; /* Apply container style */
  }

  return (
    <div className={styles.productListContainer}> {/* Apply main container class */}
      <h2 className={styles.sectionTitle}>Our Products</h2> {/* Apply section title class */}
      <div className={styles.productGrid}> {/* Apply grid class */}
        {products.length > 0 ? (
          products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className={styles.noProductsMessage}>No products available yet. Add some in your Firebase Console!</p>
        )}
      </div>
    </div>
  );
}

export default ProductList;