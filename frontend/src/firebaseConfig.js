// src/firebaseConfig.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// Import specific Firebase services you'll use
import { getAuth } from "firebase/auth"; // For Authentication
import { getFirestore } from "firebase/firestore"; // For Firestore Database
import { getStorage } from "firebase/storage"; // For Cloud Storage
import { getFunctions } from "firebase/functions"; // For Cloud Functions

// You can remove getAnalytics if you don't plan to use it immediately
// import { getAnalytics } from "firebase/analytics";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "GOOGLE_API_KEY",
  authDomain: "e-commerce-77358.firebaseapp.com",
  projectId: "e-commerce-77358",
  storageBucket: "e-commerce-77358.firebasestorage.app",
  messagingSenderId: "144518304242",
  appId: "1:144518304242:web:b87b38c3e6faae978adb6b",
  measurementId: "G-1YWPFYCFXH" // Keep this if you want Analytics
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize and EXPORT the services your components will use
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// If you want to use Analytics, keep this line:
// const analytics = getAnalytics(app);
