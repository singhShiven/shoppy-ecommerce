// src/components/Signup.jsx

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function Signup({ onClose }) { // Signup accepts onClose prop
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [address, setAddress] = useState({
    line1: '', line2: '', city: '', state: '', zip: '', country: ''
  });
  const [dateOfBirth, setDateOfBirth] = useState('');

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const navigate = useNavigate();

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const callUpdateProfileFunction = async (uid, newDisplayName, idToken) => {
    try {
      const response = await fetch('https://us-central1-e-commerce-77358.cloudfunctions.net/updateUserProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ displayName: newDisplayName })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        console.error("Backend updateUserProfile failed:", result.error || "Unknown error");
        toast.warn("Profile display name update failed on server.");
        return false;
      } else {
        console.log("Backend updateUserProfile success:", result.message);
        return true;
      }
    } catch (err) {
      console.error("Client-side error calling updateUserProfile function:", err);
      toast.error("Failed to connect to profile update service.");
      return false;
    }
  };


  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User signed up:', user);

      let idToken = null;
      if (user) {
          try {
              idToken = await user.getIdToken(true);
          } catch (tokenError) {
              console.error("Error fetching ID Token after signup:", tokenError);
          }
      }

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        displayName: displayName,
        address: address,
        dateOfBirth: dateOfBirth,
        createdAt: new Date(),
      });

      if (displayName && idToken) {
        await callUpdateProfileFunction(user.uid, displayName, idToken);
      }

      setSuccessMessage('Sign up successful! You can now log in.');
      toast.success('Sign up successful! You can now log in.');

      setEmail('');
      setPassword('');
      setDisplayName('');
      setAddress({ line1: '', line2: '', city: '', state: '', zip: '', country: '' });
      setDateOfBirth('');

      console.log("Attempting to navigate to homepage...");
      navigate('/');
      onClose && onClose(); // <-- CRUCIAL FIX: Call onClose ONLY if it's a function

    } catch (error) {
      console.error('Error signing up:', error.message);
      setError(error.message);
      toast.error(`Sign up failed: ${error.message}`);
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
        maxWidth: '400px',
        width: '100%',
        boxSizing: 'border-box'
    }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-md)', color: 'var(--primary-purple)' }}>Sign Up</h2>
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <input type="text" placeholder="Full Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required style={{ marginBottom: 'var(--spacing-xs)' }} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ marginBottom: 'var(--spacing-xs)' }} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ marginBottom: 'var(--spacing-xs)' }} />
            <input type="text" name="line1" placeholder="Address Line 1" value={address.line1} onChange={handleAddressChange} style={{ marginBottom: 'var(--spacing-xs)' }} />
            <input type="text" name="line2" placeholder="Address Line 2 (Optional)" value={address.line2} onChange={handleAddressChange} style={{ marginBottom: 'var(--spacing-xs)' }} />
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <input type="text" name="city" placeholder="City" value={address.city} onChange={handleAddressChange} style={{ flex: 1 }} />
              <input type="text" name="state" placeholder="State" value={address.state} onChange={handleAddressChange} style={{ flex: 1 }} />
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <input type="text" name="zip" placeholder="Zip/Postal Code" value={address.zip} onChange={handleAddressChange} style={{ flex: 1 }} />
              <input type="text" name="country" placeholder="Country" value={address.country} onChange={handleAddressChange} style={{ flex: 1 }} />
            </div>
            <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted-gray)', marginTop: 'var(--spacing-xs)' }}>Date of Birth:</label>
            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} style={{ marginBottom: 'var(--spacing-xs)' }} />

            <button type="submit" style={{
                backgroundColor: 'var(--primary-purple)', color: 'white', padding: 'var(--spacing-sm) var(--spacing-md)',
                borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--font-size-md)', marginTop: 'var(--spacing-sm)'
            }}>
                Sign Up
            </button>
        </form>
        {successMessage && <p style={{ color: 'var(--success-color)', marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>{successMessage}</p>}
        {error && <p style={{ color: 'var(--danger-color)', marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>Error: {error}</p>}
    </div>
  );
}

export default Signup;