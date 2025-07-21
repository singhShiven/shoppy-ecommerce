// src/pages/CheckoutPage.jsx

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

// --- IMPORTANT: Replace with your actual Stripe Publishable Key ---
const stripePromise = loadStripe('pk_test_51RmalJ2SviMCERVhQSCoPUbn3IuXhDUAwcxDnL6IHLEzJ7Pz2QkuXhYB2T63a1lSrsY4jJcNetgLesVk3AoROpRc00RKvAZQG3');

const CheckoutForm = () => {
  const { cartItems, cartTotal, loadingCart, cartError, currentUser, authLoading } = useCart();
  const stripe = useStripe();
  const elements = useElements();

  const [shippingAddress, setShippingAddress] = useState({
    name: '', address1: '', address2: '', city: '', state: '', zip: '', country: '',
  });
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setPaymentError(null);
    setPaymentSuccess(null);

    // Authentication Checks
    if (authLoading) {
        setPaymentError("Authentication state still loading. Please wait a moment and try again.");
        setProcessing(false);
        return;
    }
    if (!currentUser) {
        setPaymentError("You must be logged in to place an order. Please log in.");
        setProcessing(false);
        return;
    }

    if (!stripe || !elements) {
      setProcessing(false);
      return;
    }

    if (cartItems.length === 0) {
      setPaymentError("Your cart is empty. Please add items before checking out.");
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: shippingAddress.name,
        address: {
            line1: shippingAddress.address1, city: shippingAddress.city,
            state: shippingAddress.state, postal_code: shippingAddress.zip, country: shippingAddress.country,
        }
      }
    });

    if (error) {
      console.error('[Stripe Error]', error);
      setPaymentError(error.message);
      setProcessing(false);
    } else {
      console.log('[PaymentMethod]', paymentMethod);

      try {
        // Get ID Token
        let idToken = null;
        if (currentUser) {
            try {
                idToken = await currentUser.getIdToken(true);
            } catch (tokenError) {
                console.error("Error fetching ID Token during checkout:", tokenError);
                setPaymentError("Authentication token error. Please log in again.");
                setProcessing(false);
                return;
            }
        }
        // Call Cloud Function for payment processing
        const response = await fetch('https://us-central1-e-commerce-77358.cloudfunctions.net/processPaymentAndCreateOrder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            paymentMethodId: paymentMethod.id,
            cartItems: cartItems,
            shippingInfo: shippingAddress,
            totalAmount: cartTotal,
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setPaymentSuccess(`Order ${result.orderId} placed successfully! Payment status: ${result.paymentStatus}`);
          toast.success(`Order ${result.orderId} placed successfully!`);
          console.log("Order placed successfully! Result:", result);

          if (auth.currentUser) {
            await setDoc(doc(db, "carts", auth.currentUser.uid), { items: [], totalAmount: 0 });
          }
        } else {
          setPaymentError(result.error || 'Order failed due to an unknown server error.');
          toast.error(`Order failed: ${result.error || 'Unknown error.'}`);
          console.error("Order processing failed:", result);
        }
        setProcessing(false);
      } catch (clientError) {
        console.error('Client-side error calling Cloud Function:', clientError);
        setPaymentError(clientError.message || 'An error occurred while connecting to the server.');
        toast.error(`Connection error: ${clientError.message || 'Check network.'}`);
        setProcessing(false);
      }
    }
  };

  if (authLoading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading authentication state...</div>;
  if (loadingCart) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading cart for checkout...</div>;
  if (cartError) return <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Error loading cart for checkout: {cartError}</div>;
  if (cartItems.length === 0) return <div style={{ textAlign: 'center', padding: '50px' }}>Your cart is empty. Please add items before checking out.</div>;

  return (
    <div style={{
      padding: 'var(--spacing-xl)',
      maxWidth: '800px',
      margin: 'var(--spacing-md) auto',
      backgroundColor: 'var(--background-white)',
      borderRadius: 'var(--border-radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      boxSizing: 'border-box'
    }}>
      <h2 style={{ fontSize: 'var(--font-size-h2)', marginBottom: 'var(--spacing-lg)', color: 'var(--primary-purple)', textAlign: 'center' }}>Checkout</h2>
      <h3>Order Summary</h3>
      {cartItems.map(item => (
        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px dotted #eee', paddingBottom: '5px' }}>
          <span>{item.name} x {item.quantity}</span>
          <span>${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      ))}
      <h3 style={{ textAlign: 'right', marginTop: '20px', fontSize: 'var(--font-size-xl)', color: 'var(--primary-purple)' }}>Total: ${cartTotal.toFixed(2)}</h3>

      <hr style={{ margin: 'var(--spacing-xl) 0', border: 'none', borderTop: '1px solid var(--border-light-gray)' }} />

      <h3 style={{ fontSize: 'var(--font-size-h3)', marginBottom: 'var(--spacing-md)', color: 'var(--text-dark-gray)' }}>Shipping Information</h3>
      <form onSubmit={handleSubmit}>
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr', /* Two columns on desktop */
            gap: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-lg)'
        }}>
            <input type="text" name="name" placeholder="Full Name" value={shippingAddress.name} onChange={handleShippingChange} style={{ gridColumn: 'span 2' }} required />
            <input type="text" name="address1" placeholder="Address Line 1" value={shippingAddress.address1} onChange={handleShippingChange} style={{ gridColumn: 'span 2' }} required />
            <input type="text" name="address2" placeholder="Address Line 2 (Optional)" value={shippingAddress.address2} onChange={handleShippingChange} style={{ gridColumn: 'span 2' }} />
            <input type="text" name="city" placeholder="City" value={shippingAddress.city} onChange={handleShippingChange} required />
            <input type="text" name="state" placeholder="State/Province" value={shippingAddress.state} onChange={handleShippingChange} required />
            <input type="text" name="zip" placeholder="Zip/Postal Code" value={shippingAddress.zip} onChange={handleShippingChange} required />
            <input type="text" name="country" placeholder="Country (2-letter code, e.g., US)" value={shippingAddress.country} onChange={handleShippingChange} required />
        </div>

        <h3 style={{ fontSize: 'var(--font-size-h3)', marginBottom: 'var(--spacing-md)', color: 'var(--text-dark-gray)' }}>Payment Information</h3>
        <div style={{ border: '1px solid var(--border-light-gray)', padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-md)', marginBottom: 'var(--spacing-lg)' }}>
            <CardElement options={{
                style: {
                    base: {
                        fontSize: 'var(--font-size-base)',
                        color: 'var(--text-dark-gray)',
                        '::placeholder': { color: 'var(--text-muted-gray)' },
                    },
                    invalid: {
                        color: 'var(--danger-color)',
                    },
                },
            }} />
        </div>

        <button type="submit" disabled={!stripe || processing || cartItems.length === 0} style={{
            padding: 'var(--spacing-md) var(--spacing-xl)', backgroundColor: 'var(--primary-purple)', color: 'white', border: 'none', borderRadius: 'var(--border-radius-md)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', boxShadow: 'var(--shadow-md)'
        }}>
          {processing ? 'Processing...' : 'Place Order'}
        </button>

        {paymentError && <div style={{ color: 'var(--danger-color)', marginTop: 'var(--spacing-md)', textAlign: 'center' }}>{paymentError}</div>}
        {paymentSuccess && <div style={{ color: 'var(--success-color)', marginTop: 'var(--spacing-md)', textAlign: 'center' }}>{paymentSuccess}</div>}
      </form>
    </div>
  );
};

const CheckoutPage = () => {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm />
        </Elements>
    );
};

export default CheckoutPage;