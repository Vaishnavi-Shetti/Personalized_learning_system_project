// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDvdenHt_Yx4JMEPIX7inJ_ymwF8MAoUTk",
  authDomain: "personalized-learning-sy-8c725.firebaseapp.com",
  projectId: "personalized-learning-sy-8c725",
  storageBucket: "personalized-learning-sy-8c725.firebasestorage.app",
  messagingSenderId: "716065615354",
  appId: "1:716065615354:web:925b24fefbcf3204904843",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
