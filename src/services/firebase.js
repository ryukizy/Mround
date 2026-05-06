import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ============================================
// 🔥 FIREBASE CONFIG - REPLACE WITH YOUR OWN
// ============================================
// 1. Go to https://console.firebase.google.com/
// 2. Create new project (or use existing)
// 3. Enable Authentication > Sign-in method > Email/Password
// 4. Enable Firestore Database (Start in production mode or test)
// 5. Enable Storage
// 6. Copy config from Project Settings > General > Your apps > Web app
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyDTYENGIgzIylqBbK7yi7I_obNvIIqA8No",
  authDomain: "morninground.firebaseapp.com",
  projectId: "morninground",
  storageBucket: "morninground.firebasestorage.app",
  messagingSenderId: "129519103073",
  appId: "1:129519103073:web:dd34ef0378909e80d4ce20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence for Firestore (great for PWA / field use)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore persistence not supported in this browser');
  }
});

export default app;
