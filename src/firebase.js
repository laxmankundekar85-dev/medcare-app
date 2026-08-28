import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeAuth,
  getAuth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";

// Your exact Firebase Web App Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDinq5y1Wjmq_5LR9iveaHLyXTZEWk1WhE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "medcare-37177.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "medcare-37177",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "medcare-37177.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "839986399884",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:839986399884:web:b7c609d5e353b0b90989a9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NWQX0P2TNY"
};

// Guarantee default app initialization synchronously
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with explicit localStorage persistence and popup resolver removed for mobile web-view stability
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: [browserLocalPersistence, indexedDBLocalPersistence],
  });
} catch (e) {
  // If already initialized (e.g., during Vite HMR reloads), reuse existing instance
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const googleProvider = new GoogleAuthProvider();

// Export Auth functions (removed redirect methods to enforce secure popup handling)
export { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut 
};

export default app;