// src/components/Login.jsx

import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function Login({ onClose }) { // Login accepts onClose prop
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const navigate = useNavigate();

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in with email:', userCredential.user);
      setSuccessMessage('Email/Password Login successful!');
      toast.success('Login successful!');
      setEmail('');
      setPassword('');
      navigate('/');
      onClose && onClose(); // <-- CRUCIAL FIX: Call onClose ONLY if it's a function
    } catch (error) {
      console.error('Error with email/password login:', error.message);
      setError(error.message);
      toast.error(`Login failed: ${error.message}`);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    const provider = new GoogleAuthProvider();

    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      console.log('User logged in with Google:', user);
      setSuccessMessage('Google Login successful!');
      toast.success('Google Login successful!');
      navigate('/');
      onClose && onClose(); // <-- CRUCIAL FIX: Call onClose ONLY if it's a function
    } catch (error) {
      console.error('Error with Google login:', error.message);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in pop-up was closed. Please try again.');
        toast.warn('Google sign-in pop-up was closed.');
      } else {
        setError(error.message);
        toast.error(`Google login failed: ${error.message}`);
      }
    }
  };

  return (
    <div style={{
        padding: 'var(--spacing-lg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-lg)',
        boxShadow: 'var(--shadow-md)',
        backgroundColor: 'var(--background-white)',
        minWidth: '280px',
        maxWidth: '350px',
        width: '100%',
        boxSizing: 'border-box'
    }}>
      <h2>Login</h2>
      <form onSubmit={handleEmailPasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
        />
        <button type="submit" style={{
            backgroundColor: 'var(--primary-purple)',
            color: 'white',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: 'var(--font-size-md)',
            marginTop: 'var(--spacing-sm)'
        }}>
          Sign In
        </button>
      </form>

      <hr style={{ margin: 'var(--spacing-md) 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />
      <button onClick={handleGoogleSignIn} style={{
          backgroundColor: '#db4437',
          color: 'white',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          borderRadius: 'var(--border-radius-sm)',
          fontSize: 'var(--font-size-md)',
          width: '100%'
      }}>
        Sign In with Google
      </button>

      {successMessage && <p style={{ color: 'var(--success-color)', marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>{successMessage}</p>}
      {error && <p style={{ color: 'red', marginTop: '10px' }}>Error: {error}</p>}
    </div>
  );
}

export default Login;