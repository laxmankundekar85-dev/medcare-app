import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, // <-- Added here
  signOut 
} from "firebase/auth";

// Your exact web app's Firebase configuration from your console screenshot
const firebaseConfig = {
  apiKey: "AIzaSyDinq5y1Wjmq_5LR9iveaHLyXTZEWk1WhE",
  authDomain: "medcare-37177.firebaseapp.com",
  projectId: "medcare-37177",
  storageBucket: "medcare-37177.firebasestorage.app",
  messagingSenderId: "839986399884",
  appId: "1:839986399884:web:b7c609d5e353b0b90989a9",
  measurementId: "G-NWQX0P2TNY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Export Auth functions
export { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  sendPasswordResetEmail, // <-- Added here
  signOut 
};