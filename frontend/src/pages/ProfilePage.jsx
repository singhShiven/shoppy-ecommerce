// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

function ProfilePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    address: { line1: '', line2: '', city: '', state: '', zip: '', country: '' },
    dateOfBirth: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (!user) {
        toast.info("You've been logged out. Redirecting to home.");
        navigate('/');
      }
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) {
        setProfileData({ displayName: '', email: '', address: {}, dateOfBirth: '' });
        setLoadingProfile(false);
        return;
      }

      try {
        setLoadingProfile(true);
        setProfileError(null);
        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfileData({
            displayName: data.displayName || '',
            email: data.email || currentUser.email,
            address: data.address || { line1: '', line2: '', city: '', state: '', zip: '', country: '' },
            dateOfBirth: data.dateOfBirth || ''
          });
        } else {
          setProfileData({
            displayName: currentUser.displayName || '',
            email: currentUser.email,
            address: { line1: '', line2: '', city: '', state: '', zip: '', country: '' },
            dateOfBirth: ''
          });
          toast.warn("Your profile data is not fully populated. Please save details.");
        }
        setLoadingProfile(false);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setProfileError("Failed to load profile data.");
        toast.error("Failed to load profile data.");
        setLoadingProfile(false);
      }
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [currentUser, authLoading]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name in profileData.address) {
      setProfileData(prev => ({
        ...prev,
        address: { ...prev.address, [name]: value }
      }));
    } else {
      setProfileData(prev => ({ ...prev, [name]: value }));
    }
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
        toast.error("Failed to update display name on server.");
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


  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("You must be logged in to save your profile.");
      return;
    }
    setSavingProfile(true);
    setProfileError(null);

    try {
      let idToken = null;
      if (currentUser) {
          try {
              idToken = await currentUser.getIdToken(true);
          } catch (tokenError) {
              console.error("Error fetching ID Token for profile save:", tokenError);
              toast.error("Authentication token error. Please log in again.");
              setSavingProfile(false);
              return;
          }
      }

      let authDisplayNameUpdated = true;
      if (profileData.displayName && currentUser.displayName !== profileData.displayName) {
          authDisplayNameUpdated = await callUpdateProfileFunction(currentUser.uid, profileData.displayName, idToken);
      }

      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: profileData.displayName,
        address: profileData.address,
        dateOfBirth: profileData.dateOfBirth,
        updatedAt: new Date(),
      });

      toast.success("Profile updated successfully!");
      setSavingProfile(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      setProfileError("Failed to save profile data.");
      toast.error("Failed to save profile data.");
      setSavingProfile(false);
    }
  };

  if (authLoading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading authentication for profile...</div>;
  }

  if (!currentUser) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Please log in to view your profile.</div>;
  }

  if (loadingProfile) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading your profile...</div>;
  }

  return (
    <div style={{
      padding: 'var(--spacing-xl)',
      maxWidth: '700px',
      margin: 'var(--spacing-md) auto',
      backgroundColor: 'var(--background-white)',
      borderRadius: 'var(--border-radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      boxSizing: 'border-box'
    }}>
      <h2 style={{ fontSize: 'var(--font-size-h2)', marginBottom: 'var(--spacing-lg)', color: 'var(--primary-purple)', textAlign: 'center' }}>Your Profile</h2>

      <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted-gray)' }}>Full Name:</label>
        <input type="text" name="displayName" value={profileData.displayName} onChange={handleProfileChange} required />

        <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted-gray)' }}>Email (Not Editable):</label>
        <input type="email" value={profileData.email} disabled style={{ backgroundColor: 'var(--light-page-bg)', cursor: 'not-allowed' }} />

        <h3 style={{ fontSize: 'var(--font-size-md)', marginTop: 'var(--spacing-md)', color: 'var(--text-dark-gray)' }}>Shipping/Billing Address:</h3>
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr', /* Two columns on desktop */
            gap: 'var(--spacing-sm)',
            width: '100%'
        }}>
            <input type="text" name="line1" placeholder="Address Line 1" value={profileData.address.line1} onChange={handleProfileChange} style={{ gridColumn: 'span 2' }} />
            <input type="text" name="line2" placeholder="Address Line 2 (Optional)" value={profileData.address.line2} onChange={handleProfileChange} style={{ gridColumn: 'span 2' }} />
            <input type="text" name="city" placeholder="City" value={profileData.address.city} onChange={handleProfileChange} />
            <input type="text" name="state" placeholder="State" value={profileData.address.state} onChange={handleProfileChange} />
            <input type="text" name="zip" placeholder="Zip/Postal Code" value={profileData.address.zip} onChange={handleProfileChange} />
            <input type="text" name="country" placeholder="Country" value={profileData.address.country} onChange={handleProfileChange} />
        </div>

        <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted-gray)', marginTop: 'var(--spacing-md)' }}>Date of Birth:</label>
        <input type="date" name="dateOfBirth" value={profileData.dateOfBirth} onChange={handleProfileChange} />

        <button type="submit" disabled={savingProfile} style={{ marginTop: 'var(--spacing-lg)' }}>
          {savingProfile ? 'Saving...' : 'Save Profile'}
        </button>
        {profileError && <p style={{ color: 'var(--danger-color)', textAlign: 'center', marginTop: 'var(--spacing-md)' }}>Error: {profileError}</p>}
      </form>

      <h3 style={{ fontSize: 'var(--font-size-md)', marginTop: 'var(--spacing-xxl)', color: 'var(--text-dark-gray)' }}>Saved Payment Methods:</h3>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted-gray)' }}>No saved cards. (Implement secure Stripe Customer details saving via Cloud Functions for this)</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-xl)', marginTop: 'var(--spacing-xxl)' }}>
        <Link to="/orders" style={{ color: 'var(--primary-purple)', textDecoration: 'underline' }}>View Order History</Link>
        <Link to="/wishlist" style={{ color: 'var(--primary-purple)', textDecoration: 'underline' }}>View Wishlist</Link>
      </div>

    </div>
  );
}

export default ProfilePage;