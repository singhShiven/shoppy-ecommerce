// src/pages/WishlistPage.jsx

import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc, onSnapshot } from 'firebase/firestore'; // onSnapshot for real-time updates
import { onAuthStateChanged } from 'firebase/auth';
import ProductCard from '../components/ProductCard.jsx'; // To display products
import { toast } from 'react-toastify';

function WishlistPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [wishlistProductDetails, setWishlistProductDetails] = useState([]); // Stores full product data
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [wishlistError, setWishlistError] = useState(null);

  // Listen for Auth state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Listen to user's wishlist document for product IDs
  useEffect(() => {
    let unsubscribeFirestore = () => {};

    if (!authLoading) {
      if (currentUser) {
        const wishlistDocRef = doc(db, "wishlists", currentUser.uid);
        setLoadingWishlist(true);
        setWishlistError(null);

        unsubscribeFirestore = onSnapshot(wishlistDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const productIdsInWishlist = data.productIds || [];
            console.log("Product IDs in wishlist:", productIdsInWishlist);

            // Fetch details for each product ID
            const fetchedDetails = [];
            for (const productId of productIdsInWishlist) {
              try {
                const productSnap = await getDoc(doc(db, "products", productId));
                if (productSnap.exists()) {
                  fetchedDetails.push({ id: productSnap.id, ...productSnap.data() });
                } else {
                  console.warn(`Product ${productId} not found in 'products' collection.`);
                }
              } catch (err) {
                console.error(`Error fetching details for product ${productId}:`, err);
              }
            }
            setWishlistProductDetails(fetchedDetails);
          } else {
            console.log("User has an empty wishlist document.");
            setWishlistProductDetails([]);
          }
          setLoadingWishlist(false);
        }, (error) => {
          console.error("Error listening to wishlist document:", error);
          setWishlistError("Failed to load wishlist details.");
          toast.error("Failed to load wishlist details.");
          setLoadingWishlist(false);
        });
      } else {
        setWishlistProductDetails([]); // Clear for logged out users
        setLoadingWishlist(false);
      }
    }
    return () => unsubscribeFirestore();
  }, [currentUser, authLoading]); // Re-run when currentUser or authLoading changes

  if (authLoading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading authentication for wishlist...</div>;
  }

  if (!currentUser) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Please log in to view your wishlist.</div>;
  }

  if (loadingWishlist) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading your wishlist...</div>;
  }

  if (wishlistError) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Error: {wishlistError}</div>;
  }

  return (
    <div style={{
      padding: 'var(--spacing-xl)',
      maxWidth: '1200px',
      margin: 'var(--spacing-md) auto',
      backgroundColor: 'var(--background-white)',
      borderRadius: 'var(--border-radius-lg)',
      boxShadow: 'var(--shadow-lg)'
    }}>
      <h2 style={{ fontSize: 'var(--font-size-h2)', marginBottom: 'var(--spacing-lg)', color: 'var(--primary-purple)', textAlign: 'center' }}>Your Wishlist</h2>

      {wishlistProductDetails.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted-gray)' }}>Your wishlist is empty. Start adding some products!</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--spacing-lg)',
          justifyContent: 'center'
        }}>
          {wishlistProductDetails.map(product => (
            // Use ProductCard to display each item
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;