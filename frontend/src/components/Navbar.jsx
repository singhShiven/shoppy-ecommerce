// src/components/Navbar.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import styles from './Navbar.module.css';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import useIsMobile from '../hooks/useIsMobile.jsx'; // Make sure this hook file exists and is correct

const Navbar = ({ setIsAuthModalOpen }) => {
  const { cartItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const isMobile = useIsMobile(); // Use the custom hook

  useEffect(() => {
    setAuthLoading(true);
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuRef]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        toast.info('You have been signed out.');
        setIsMenuOpen(false);
        setIsProfileMenuOpen(false);
      })
      .catch((error) => {
        toast.error(`Sign out failed: ${error.message}`);
      });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsProfileMenuOpen(false); // Close profile menu if opening hamburger
  };

  const toggleProfileMenu = (event) => {
    event.stopPropagation();
    console.log("Profile menu toggled!");
    setIsProfileMenuOpen((prev) => !prev);
    setIsMenuOpen(false); // Close hamburger menu if opening profile
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      {/* Logo on Left - and Welcome Text */}
      <Link to="/" className={styles.logo}>
        <div className={styles.logoBackground}>S</div>
        <span className={styles.logoText}>Shoppy</span>
        {authLoading ? (
            <span style={{ fontSize: '0.8em', marginLeft: '10px', color: 'var(--text-muted-gray)' }}>Authenticating...</span>
        ) : currentUser ? (
            <span className={styles.welcomeText}>Welcome, <strong style={{ color: '' }}>{currentUser.displayName || currentUser.email.split('@')[0]}</strong>! 🎉</span>
        ) : null}
      </Link>

      {/* Hamburger Menu Icon (visible on mobile) */}
      <div className={styles.hamburger} onClick={toggleMenu}>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
      </div>

      {/* Center Navigation Links (This becomes the mobile slide-down menu content) */}
      <div className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksOpen : ''}`}>
        <Link to="/" className={styles.navItem} onClick={toggleMenu}>Home</Link>
        <Link to="/shop" className={styles.navItem} onClick={toggleMenu}>Products</Link>
        <Link to="/collections" className={styles.navItem} onClick={toggleMenu}>Collections</Link>
        <Link to="/about" className={styles.navItem} onClick={toggleMenu}>About</Link>
      </div>

      {/* Right Side: Search, Cart, Unified User/Sign In (Desktop & Mobile) */}
      <div className={styles.navIcons} ref={profileMenuRef}>
        <span className={styles.icon}>🔍</span>
        <Link to="/cart" className={styles.cartIcon}>
          🛒
          <span className={styles.badge}>{cartItems.length}</span>
        </Link>
        {authLoading ? (
            <span className={styles.authStatusText}>Authenticating...</span>
        ) : currentUser ? (
            
            <div className={`${styles.profileMenuContainer}`} aria-expanded={isProfileMenuOpen ? "true" : "false"}>
                <button onClick={toggleProfileMenu} className={styles.profileButton} aria-haspopup="true" aria-expanded={isProfileMenuOpen ? "true" : "false"}>
                    {/* User profile picture or default icon */}
                    {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="Profile" className={styles.profilePicture} />
                    ) : (
                        <span className={styles.profileIcon}>👤</span>
                    )}
                </button>
                {isProfileMenuOpen && (
                    <div className={styles.profileDropdown}>
                        <Link to="/profile" className={styles.dropdownItem} onClick={() => setIsProfileMenuOpen(false)}>Profile</Link>
                        <Link to="/orders" className={styles.dropdownItem} onClick={() => setIsProfileMenuOpen(false)}>Order History</Link>
                        <Link to="/wishlist" className={styles.dropdownItem} onClick={() => setIsProfileMenuOpen(false)}>Wishlist</Link>
                        <Link to="/help" className={styles.dropdownItem} onClick={() => setIsProfileMenuOpen(false)}>Help & Support</Link>
                        <hr className={styles.dropdownDivider} />
                        <button onClick={handleSignOut} className={styles.dropdownItem}>Sign Out</button>
                    </div>
                )}
            </div>
        ) : (
            
            null 
        )}
      </div>
    </nav>
  );
};

export default Navbar;