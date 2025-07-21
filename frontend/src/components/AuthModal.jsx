// src/components/AuthModal.jsx

import React, { useState } from 'react';
import Signup from './Signup.jsx'; // Import existing Signup component
import Login from './Login.jsx';   // Import existing Login component
import styles from './AuthModal.module.css';

// AuthModal accepts an onClose prop from its parent (Modal.jsx)
function AuthModal({ onClose }) { // <-- CRUCIAL: Accept onClose prop
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div style={{ padding: 'var(--spacing-md) 0' }}>
      <div className={styles.toggleButtons}>
        <button
          onClick={() => setShowLogin(true)}
          className={`${styles.toggleButton} ${showLogin ? styles.active : ''}`}
        >
          Login
        </button>
        <button
          onClick={() => setShowLogin(false)}
          className={`${styles.toggleButton} ${!showLogin ? styles.active : ''}`}
        >
          Sign Up
        </button>
      </div>

      {/* CRUCIAL: Pass the onClose prop down to Login and Signup */}
      {showLogin ? <Login onClose={onClose} /> : <Signup onClose={onClose} />}
    </div>
  );
}

export default AuthModal;