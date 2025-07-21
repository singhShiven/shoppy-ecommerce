// src/pages/AuthPage.js

import React, { useState } from 'react';
import Signup from '../components/Signup';
import Login from '../components/Login';

function AuthPage() {
  const [showLogin, setShowLogin] = useState(true); // State to toggle between Login and Signup

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column', // Stack vertically
      alignItems: 'center',    // Center horizontally
      padding: '40px 0',       // Add some padding
      minHeight: 'calc(100vh - 100px)' // Ensure it takes up screen space
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '30px', // Space below the toggle buttons
        backgroundColor: 'var(--background-white)',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden' // To clip border-radius for buttons
      }}>
        <button
          onClick={() => setShowLogin(true)}
          style={{
            padding: '12px 25px',
            backgroundColor: showLogin ? 'var(--primary-purple)' : 'transparent',
            color: showLogin ? 'white' : 'var(--text-dark-gray)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.1em',
            transition: 'all var(--transition-speed) var(--transition-ease)'
          }}
        >
          Login
        </button>
        <button
          onClick={() => setShowLogin(false)}
          style={{
            padding: '12px 25px',
            backgroundColor: !showLogin ? 'var(--primary-purple)' : 'transparent',
            color: !showLogin ? 'white' : 'var(--text-dark-gray)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.1em',
            transition: 'all var(--transition-speed) var(--transition-ease)'
          }}
        >
          Sign Up
        </button>
      </div>

      {showLogin ? <Login /> : <Signup />} {/* Conditionally render Login or Signup */}
    </div>
  );
}

export default AuthPage;