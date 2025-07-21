// src/context/WishlistContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { db, auth } from '../firebaseConfig'; // Import db and auth
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'; // Import Firestore methods
import { onAuthStateChanged } from 'firebase/auth'; // To listen for auth state changes
import { toast } from 'react-toastify'; // For notifications

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState([]); // Stores product IDs in wishlist
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [wishlistError, setWishlistError] = useState(null);

  // Listen for Firebase Auth state changes (to get current user)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Listen to user's wishlist in Firestore
  useEffect(() => {
    let unsubscribeFirestore = () => {};

    if (!authLoading) { // Only proceed if auth state is determined
      if (currentUser) {
        const wishlistDocRef = doc(db, "wishlists", currentUser.uid); // User's specific wishlist document
        setLoadingWishlist(true);
        setWishlistError(null);

        unsubscribeFirestore = onSnapshot(wishlistDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Wishlist will store an array of product IDs
            setWishlistItems(data.productIds || []);
            console.log("Wishlist updated from Firestore:", data.productIds);
          } else {
            console.log("No wishlist found for user, initializing empty wishlist.");
            setWishlistItems([]);
            // Optional: create empty wishlist doc
            // setDoc(wishlistDocRef, { userId: currentUser.uid, productIds: [] }, { merge: true });
          }
          setLoadingWishlist(false);
        }, (error) => {
          console.error("Error listening to wishlist:", error);
          setWishlistError("Failed to load wishlist.");
          toast.error("Failed to load wishlist.");
          setLoadingWishlist(false);
        });
      } else {
        setWishlistItems([]); // Clear wishlist if no user
        setLoadingWishlist(false);
      }
    }

    return () => unsubscribeFirestore();
  }, [currentUser, authLoading]); // Re-run when current user or authLoading changes

  // Helper function to check if a product is in the wishlist
  const isProductInWishlist = (productId) => {
    return wishlistItems.includes(productId);
  };

  // Action: Add product to wishlist
  const addToWishlist = async (product) => {
    if (!currentUser) {
      toast.error("Please log in to add items to your wishlist.");
      return;
    }
    if (isProductInWishlist(product.id)) { // Prevent adding duplicate
        toast.info(`${product.name} is already in your wishlist!`);
        return;
    }

    const wishlistDocRef = doc(db, "wishlists", currentUser.uid);
    try {
      const updatedProductIds = [...wishlistItems, product.id]; // Add new product ID
      await setDoc(wishlistDocRef, { userId: currentUser.uid, productIds: updatedProductIds }, { merge: true });
      toast.success(`${product.name} added to wishlist!`);
    } catch (e) {
      console.error("Error adding to wishlist:", e);
      toast.error("Failed to add item to wishlist.");
    }
  };

  // Action: Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    if (!currentUser) return; // Should be checked by UI or parent logic

    const wishlistDocRef = doc(db, "wishlists", currentUser.uid);
    try {
      const updatedProductIds = wishlistItems.filter(id => id !== productId); // Remove product ID
      await setDoc(wishlistDocRef, { userId: currentUser.uid, productIds: updatedProductIds }, { merge: true });
      toast.info("Item removed from wishlist.");
    } catch (e) {
      console.error("Error removing from wishlist:", e);
      toast.error("Failed to remove item from wishlist.");
    }
  };

  // Action: Toggle product in wishlist (add if not there, remove if there)
  const toggleWishlist = async (product) => {
    if (!currentUser) {
        toast.error("Please log in to manage your wishlist.");
        return;
    }
    if (isProductInWishlist(product.id)) {
        await removeFromWishlist(product.id);
    } else {
        await addToWishlist(product);
    }
  };


  return (
    <WishlistContext.Provider value={{ wishlistItems, loadingWishlist, wishlistError, isProductInWishlist, addToWishlist, removeFromWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);