import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut 
} from "firebase/auth";

// Your Firebase configuration with dynamic Vite env variable fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDinq5y1Wjmq_5LR9iveaHLyXTZEWk1WhE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "medcare-37177.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "medcare-37177",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "medcare-37177.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "839986399884",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:839986399884:web:b7c609d5e353b0b90989a9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NWQX0P2TNY"
};

// Initialize Firebase safely (prevents re-initialization crashes during HMR / deployments)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Export Auth functions
export { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  sendPasswordResetEmail, 
  signOut 
};

export default app;