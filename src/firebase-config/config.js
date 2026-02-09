import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// Firebase configuration - ALL values from environment variables (no hardcoded secrets)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

// Validate required config — fail fast if env vars missing
const REQUIRED_KEYS = ['apiKey', 'authDomain', 'projectId', 'appId', 'databaseURL'];
const missing = REQUIRED_KEYS.filter(key => !firebaseConfig[key]);
if (missing.length > 0) {
  throw new Error(
    `Missing Firebase config: ${missing.join(', ')}. ` +
    `Create a .env file with VITE_FIREBASE_* variables. See .env.example.`
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const database = getDatabase(app);