// src/App.jsx

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductList from './components/ProductList.jsx';
import { CartProvider } from './context/CartContext.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderHistoryPage from './pages/OrderHistoryPage.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import Navbar from './components/Navbar.jsx'; // Navbar is separate, passed setIsAuthModalOpen
import AuthModal from './components/AuthModal.jsx';
import Modal from './components/Modal.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import WishlistPage from './pages/WishlistPage.jsx'; // <-- CRUCIAL: Import WishlistPage
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { WishlistProvider } from './context/WishlistContext.jsx';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <Router>
      <CartProvider>
        <WishlistProvider> {/* Ensure WishlistProvider wraps your main app content */}
          <Navbar setIsAuthModalOpen={setIsAuthModalOpen} />
          <div className="app-content-wrapper" style={{ paddingTop: '80px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-dark-gray)' }}>Your E-commerce App</h1>
            <Routes>
              <Route path="/" element={<WelcomePage setIsAuthModalOpen={setIsAuthModalOpen} />} />
              <Route path="/shop" element={
                <>
                  <h2 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--text-dark-gray)' }}>All Products</h2>
                  <ProductList />
                </>
              } />
              <Route path="/auth" element={
                <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', padding: '40px 0' }}>
                  <AuthModal />
                </div>
              } />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/collections" element={<h2 style={{ textAlign: 'center', padding: '50px' }}>Collections Page (Coming Soon!)</h2>} />
              <Route path="/about" element={<h2 style={{ textAlign: 'center', padding: '50px' }}>About Us Page (Coming Soon!)</h2>} />
              <Route path="/wishlist" element={<WishlistPage />} /> {/* <-- CRUCIAL: RENDER WishlistPage COMPONENT */}
              <Route path="/help" element={<h2 style={{ textAlign: 'center', padding: '50px' }}>Help & Support Page (Coming Soon!)</h2>} />
            </Routes>
          </div>
          <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

          <Modal isOpen={isAuthModalOpen} onClose={closeAuthModal} title="Welcome Back">
            <AuthModal />
          </Modal>
        </WishlistProvider>
      </CartProvider>
    </Router>
  );
}

export default App;