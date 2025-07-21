// src/components/AuthDetails.js

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { toast } from 'react-toastify';

function AuthDetails() {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    setAuthLoading(true);
    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
      } else {
        setAuthUser(null);
      }
      setAuthLoading(false);
    });

    return () => {
      listen();
    };
  }, []);

  const userSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log('Signed out successfully');
        toast.info('You have been signed out.');
      })
      .catch((error) => {
        console.error(error.message);
        toast.error(`Sign out failed: ${error.message}`);
      });
  };

  if (authLoading) {
    return (
      <div style={{ textAlign: 'left', padding: '5px', backgroundColor: 'var(--background-white)', color: 'var(--text-muted-gray)', fontSize: '0.9em' }}>
        Authenticating...
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'left', padding: '5px', backgroundColor: 'var(--background-white)', color: 'var(--text-dark-gray)', fontSize: '0.9em' }}>
      {authUser ? (
        <>
          {/* Display user's displayName if available, otherwise email */}
          <span style={{ fontWeight: 'bold' }}>Welcome, {authUser.displayName || authUser.email.split('@')[0]}!</span>
          <button onClick={userSignOut} style={{
            padding: '5px 10px',
            backgroundColor: '',
            color: 'white',
            borderRadius: '4px',
            fontSize: '0.8em',
            marginLeft: '10px'
          }}>
            Sign Out
          </button>
        </>
      ) : (
        <span style={{ color: 'var(--text-muted-gray)' }}>You are currently logged out.</span>
      )}
    </div>
  );
}

export default AuthDetails;