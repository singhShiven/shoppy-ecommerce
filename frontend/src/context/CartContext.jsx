// src/context/CartContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import { db, auth } from '../firebaseConfig';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify'; // <-- NEW: Import toast

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      console.log("Auth state changed in CartContext:", user ? user.email : "Logged Out");
    });
    return () => unsubscribeAuth();
  }, []);


  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loadingCart, setLoadingCart] = useState(true);
  const [cartError, setCartError] = useState(null);


  useEffect(() => {
    let unsubscribeFirestore = () => {};

    if (!authLoading) {
      if (currentUser) {
        const cartDocRef = doc(db, "carts", currentUser.uid);
        setLoadingCart(true);
        setCartError(null);

        unsubscribeFirestore = onSnapshot(cartDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const cartData = docSnap.data();
            setCartItems(cartData.items || []);
            setCartTotal(cartData.totalAmount || 0);
            console.log("Cart updated from Firestore:", cartData);
          } else {
            console.log("No cart found for user, initializing empty cart.");
            setCartItems([]);
            setCartTotal(0);
          }
          setLoadingCart(false);
        }, (error) => {
          console.error("Error listening to cart:", error);
          setCartError("Failed to load cart.");
          toast.error("Failed to load cart."); // <-- NEW: Use toast error
          setLoadingCart(false);
        });
      } else {
        setCartItems([]);
        setCartTotal(0);
        setLoadingCart(false);
      }
    }

    return () => unsubscribeFirestore();
  }, [currentUser, authLoading]);


  const calculateLocalTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const addToCart = async (product) => {
    if (authLoading) {
        toast.warn("Authentication state still loading. Please wait a moment and try again."); // <-- NEW: Use toast warn
        return;
    }
    if (!currentUser) {
      toast.error("Please log in to add items to your cart."); // <-- NEW: Use toast error
      return;
    }

    const cartDocRef = doc(db, "carts", currentUser.uid);
    try {
      const cartSnap = await getDoc(cartDocRef);
      let updatedItems = [];

      if (cartSnap.exists()) {
        const currentCart = cartSnap.data();
        updatedItems = currentCart.items || [];
        const existingItemIndex = updatedItems.findIndex(item => item.id === product.id);

        if (existingItemIndex > -1) {
          updatedItems[existingItemIndex].quantity += 1;
        } else {
          updatedItems.push({
            id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, quantity: 1
          });
        }
      } else {
        updatedItems.push({
          id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, quantity: 1
        });
      }

      const newTotal = calculateLocalTotal(updatedItems);
      await setDoc(cartDocRef, { userId: currentUser.uid, items: updatedItems, totalAmount: newTotal }, { merge: true });
      toast.success(`${product.name} added to cart!`); // <-- NEW: Use toast success
    } catch (e) {
      console.error("Error adding to cart:", e);
      toast.error("Failed to add item to cart."); // <-- NEW: Use toast error
    }
  };

  const updateItemQuantity = async (productId, newQuantity) => {
    if (authLoading || !currentUser) return;
    if (newQuantity < 1) {
        await removeFromCart(productId);
        return;
    }

    const cartDocRef = doc(db, "carts", currentUser.uid);
    try {
      const cartSnap = await getDoc(cartDocRef);
      if (cartSnap.exists()) {
        let updatedItems = cartSnap.data().items || [];
        const itemIndex = updatedItems.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
          updatedItems[itemIndex].quantity = newQuantity;
          const newTotal = calculateLocalTotal(updatedItems);
          await setDoc(cartDocRef, { items: updatedItems, totalAmount: newTotal }, { merge: true });
          console.log(`Updated quantity for product ${productId} to ${newQuantity}`);
        }
      }
    } catch (e) {
      console.error("Error updating quantity:", e);
      toast.error("Failed to update item quantity."); // <-- NEW: Use toast error
    }
  };

  const removeFromCart = async (productId) => {
    if (authLoading || !currentUser) return;

    const cartDocRef = doc(db, "carts", currentUser.uid);
    try {
      const cartSnap = await getDoc(cartDocRef);
      if (cartSnap.exists()) {
        let updatedItems = cartSnap.data().items || [];
        updatedItems = updatedItems.filter(item => item.id !== productId);
        const newTotal = calculateLocalTotal(updatedItems);
        await setDoc(cartDocRef, { items: updatedItems, totalAmount: newTotal }, { merge: true });
        toast.info("Item removed from cart."); // <-- NEW: Use toast info
      }
    } catch (e) {
      console.error("Error removing from cart:", e);
      toast.error("Failed to remove item from cart."); // <-- NEW: Use toast error
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, cartTotal, loadingCart, cartError, addToCart, updateItemQuantity, removeFromCart, currentUser, authLoading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);