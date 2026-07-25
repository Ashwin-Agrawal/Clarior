import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCydGyF0LMrdvwgVUmyOJHhItR40DBQ_eQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "clarior-494409.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "clarior-494409",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "clarior-494409.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1097416028098",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1097416028098:web:69be85c42bd6469582705b",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export { RecaptchaVerifier, signInWithPhoneNumber };
