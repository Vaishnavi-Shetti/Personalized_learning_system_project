// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAaUDZQvWimyeR1raNPEgBvIAltdGQzvAM",
  authDomain: "personalizedlearningplat-9509e.firebaseapp.com",
  projectId: "personalizedlearningplat-9509e",
  storageBucket: "personalizedlearningplat-9509e.firebasestorage.app",
  messagingSenderId: "1017648448050",
  appId: "1:1017648448050:web:c6457ed2065ba6dd0b322b",
  measurementId: "G-46KRH85WVD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Auth and Firestore to use in other parts of your app
export const auth = getAuth(app);
export const db = getFirestore(app);
