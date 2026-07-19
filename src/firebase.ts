import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "device-streaming-9f143231",
  appId: "1:80942236297:web:228ee643864ac746ec7c58",
  apiKey: "AIzaSyCnBGVZd8NA-CjmvQ7RhIOxFAkKEjvIjlA",
  authDomain: "device-streaming-9f143231.firebaseapp.com",
  storageBucket: "device-streaming-9f143231.firebasestorage.app",
  messagingSenderId: "80942236297",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with force long polling and the specific database ID
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, "ai-studio-zpcruiser-da850b60-209f-4763-906e-bd78c6cb7a6f");

// Initialize Auth
export const auth = getAuth(app);
