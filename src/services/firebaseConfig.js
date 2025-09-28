// Firebase configuration and initialization
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');

// Firebase configuration
// Note: In production, these should be environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "your-api-key-here",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

module.exports = { auth, db };
