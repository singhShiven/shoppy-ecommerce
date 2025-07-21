// src/pages/CartPage.jsx

import React from 'react';
import { useCart } from '../context/CartContext.jsx';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const { cartItems, cartTotal, loadingCart, cartError, updateItemQuantity, removeFromCart } = useCart();

  if (loadingCart) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Cart...</div>;
  if (cartError) return <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Error loading cart: {cartError}</div>;

  return (
    <div style={{
      padding: 'var(--spacing-xl)', /* Consistent page padding */
      maxWidth: '900px', /* Limit width for readability */
      margin: 'var(--spacing-md) auto', /* Center content */
      backgroundColor: 'var(--background-white)',
      borderRadius: 'var(--border-radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      boxSizing: 'border-box'
    }}>
      <h2 style={{ fontSize: 'var(--font-size-h2)', marginBottom: 'var(--spacing-lg)', color: 'var(--primary-purple)', textAlign: 'center' }}>Your Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted-gray)' }}>Your cart is empty.</p>
      ) : (
        <>
          <div style={{
            border: '1px solid var(--border-light-gray)',
            padding: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-lg)',
            borderRadius: 'var(--border-radius-md)',
          }}>
            {cartItems.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 'var(--spacing-md)',
                gap: 'var(--spacing-md)',
                borderBottom: '1px dotted var(--border-light-gray)',
                paddingBottom: 'var(--spacing-md)',
                paddingTop: 'var(--spacing-md)',
                flexWrap: 'wrap', /* Allow items to wrap on small screens */
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flexGrow: 1, minWidth: '150px' }}>
                  <img src={item.imageUrl} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--border-radius-md)' }} />
                  <div>
                    <h4 style={{ fontSize: 'var(--font-size-md)', margin: 0, color: 'var(--text-dark-gray)' }}>{item.name}</h4>
                    <p style={{ fontSize: 'var(--font-size-sm)', margin: 0, color: 'var(--text-muted-gray)' }}>${item.price.toFixed(2)}</p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)',
                  flexShrink: 0, /* Prevent shrinking */
                  marginLeft: 'auto', /* Push quantity controls to right */
                  minWidth: '120px', /* Ensure enough space for buttons */
                  justifyContent: 'flex-end'
                }}>
                  <button onClick={() => updateItemQuantity(item.id, item.quantity - 1)} style={{
                    padding: 'var(--spacing-xs) var(--spacing-sm)', backgroundColor: 'var(--secondary-color)', color: 'white', borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--font-size-md)'
                  }}>-</button>
                  <span style={{
                    padding: 'var(--spacing-xs)', fontSize: 'var(--font-size-md)', color: 'var(--text-dark-gray)', fontWeight: 'var(--font-weight-bold)', minWidth: '30px', textAlign: 'center'
                  }}>
                    {item.quantity}
                  </span>
                  <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)} style={{
                    padding: 'var(--spacing-xs) var(--spacing-sm)', backgroundColor: 'var(--primary-purple)', color: 'white', borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--font-size-md)'
                  }}>+</button>
                  <button onClick={() => removeFromCart(item.id)} style={{
                    marginLeft: 'var(--spacing-sm)', background: 'none', color: 'var(--danger-color)', border: '1px solid var(--danger-color)', borderRadius: 'var(--border-radius-sm)', padding: 'var(--spacing-xs) var(--spacing-sm)'
                  }}>Remove</button>
                </div>
                <p style={{ flex: '1 1 100%', textAlign: 'right', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-dark-gray)' }}>
                    Subtotal: ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <h3 style={{ textAlign: 'right', marginTop: 'var(--spacing-md)', fontSize: 'var(--font-size-xl)', color: 'var(--primary-purple)' }}>Total: ${cartTotal.toFixed(2)}</h3>
          <Link to="/checkout" style={{ textDecoration: 'none', display: 'block', textAlign: 'right', marginTop: 'var(--spacing-lg)' }}>
            <button style={{
                padding: 'var(--spacing-md) var(--spacing-xl)', /* Larger padding */
                backgroundColor: 'var(--success-color)', /* Green for checkout */
                color: 'white',
                borderRadius: 'var(--border-radius-md)',
                fontSize: 'var(--font-size-lg)', /* Larger font */
                fontWeight: 'var(--font-weight-bold)',
                boxShadow: 'var(--shadow-md)'
            }}>
              Proceed to Checkout
            </button>
          </Link>
        </>
      )}
    </div>
  );
};

export default CartPage;