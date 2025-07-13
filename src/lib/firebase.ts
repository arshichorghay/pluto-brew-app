
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATg5EF8HM90NviS5r3PDtVLy1D9RWbxgU",
  authDomain: "pluto-26ec8.firebaseapp.com",
  projectId: "pluto-26ec8",
  storageBucket: "pluto-26ec8.firebasestorage.app",
  messagingSenderId: "501190872579",
  appId: "1:501190872579:web:5be410ab9753b27e500836",
  measurementId: "G-DVTWE6R1VL"
};


// Initialize Firebase for either client or server-side rendering
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
