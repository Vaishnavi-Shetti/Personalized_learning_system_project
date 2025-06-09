import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDvdenHt_Yx4JMEPIX7inJ_ymwF8MAoUTk",
  authDomain: "personalized-learning-sy-8c725.firebaseapp.com",
  projectId: "personalized-learning-sy-8c725",
  storageBucket: "personalized-learning-sy-8c725.appspot.com",
  messagingSenderId: "716065615354",
  appId: "1:716065615354:web:925b24fefbcf3204904843",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Export Auth and Firestore to use in other parts of your app
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
