// src/pages/OrderHistoryPage.jsx

import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const ordersCollectionRef = collection(db, "orders");
        const q = query(
          ordersCollectionRef,
          where("userId", "==", currentUser.uid),
          orderBy("orderDate", "desc")
        );

        const querySnapshot = await getDocs(q);

        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setOrders(ordersData);
        setLoading(false);
        console.log("Fetched orders for user:", currentUser.uid, ordersData);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load order history.");
        toast.error("Failed to load order history.");
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchOrders();
    }
  }, [currentUser, authLoading]);

  if (authLoading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading authentication for order history...</div>;
  }

  if (!currentUser) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Please log in to view your order history.</div>;
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading your order history...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Error: {error}</div>;
  }

  return (
    <div style={{
      padding: 'var(--spacing-xl)',
      maxWidth: '900px',
      margin: 'var(--spacing-md) auto',
      backgroundColor: 'var(--background-white)',
      borderRadius: 'var(--border-radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      boxSizing: 'border-box'
    }}>
      <h2 style={{ fontSize: 'var(--font-size-h2)', marginBottom: 'var(--spacing-lg)', color: 'var(--primary-purple)', textAlign: 'center' }}>Your Order History</h2>

      {orders.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted-gray)' }}>You have not placed any orders yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}> {/* Gap between order cards */}
          {orders.map(order => (
            <div key={order.id} style={{
              border: '1px solid var(--border-light-gray)',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--border-radius-md)',
              boxShadow: 'var(--shadow-md)',
              backgroundColor: 'var(--background-white)',
              boxSizing: 'border-box'
            }}>
              <h3 style={{ fontSize: 'var(--font-size-h3)', color: 'var(--text-dark-gray)', marginBottom: 'var(--spacing-sm)' }}>
                Order ID: {order.id.substring(0, 8)}... (Total: ${order.totalAmount.toFixed(2)})
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted-gray)', marginBottom: 'var(--spacing-xs)' }}>
                Date: {order.orderDate ? new Date(order.orderDate.seconds * 1000).toLocaleString() : 'N/A'}
              </p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted-gray)', marginBottom: 'var(--spacing-md)' }}>
                Status: <strong style={{ color: 'var(--success-color)' }}>{order.status}</strong>
              </p>
              <h4 style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-dark-gray)', marginBottom: 'var(--spacing-sm)' }}>Items:</h4>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {order.items.map((item, index) => (
                  <li key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px dotted var(--border-light-gray)',
                    paddingBottom: 'var(--spacing-xs)',
                    marginBottom: 'var(--spacing-xs)',
                    gap: 'var(--spacing-sm)',
                    flexWrap: 'wrap' /* Allow item details to wrap */
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', flexGrow: 1, minWidth: '150px' }}>
                        {item.imageUrl && (
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--border-radius-sm)' }}
                            />
                        )}
                        <span style={{ color: 'var(--text-dark-gray)' }}>{item.name} x {item.quantity}</span>
                    </div>
                    <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-dark-gray)', flexShrink: 0 }}>
                        ${item.priceAtOrder ? item.priceAtOrder.toFixed(2) : 'N/A'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistoryPage;