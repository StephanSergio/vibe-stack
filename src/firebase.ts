// ============================================================
// Firebase init + exports
// ------------------------------------------------------------
// Config is read from Vite env vars (VITE_FIREBASE_*). Fill these in a
// .env.local file (locally) and as GitHub Actions secrets (deploy).
// See .env.example and README.md.
// ============================================================

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Handy warning signal if the config hasn't been filled in yet.
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
)

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Collection names in one place so hooks share them.
export const COLLECTIONS = {
  items: 'items',
} as const
