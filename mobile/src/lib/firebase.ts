// ===== Firebase Configuration =====
// 
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project called "Baby Tracker"
// 3. Enable Authentication (Email/Password, Apple, Google)
// 4. Enable Firestore Database
// 5. Enable Storage
// 6. Add an iOS app with your bundle identifier
// 7. Copy your config values below
//

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getAuth,
    initializeAuth,
    // @ts-ignore - React Native persistence is available but not typed correctly
    getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration from GoogleService-Info.plist
const firebaseConfig = {
    apiKey: "AIzaSyACpoy1CtOdmOqDgUuVPqREpYNumNnqR14",
    authDomain: "baby-tracker-ea362.firebaseapp.com",
    projectId: "baby-tracker-ea362",
    storageBucket: "baby-tracker-ea362.firebasestorage.app",
    messagingSenderId: "81852083724",
    appId: "1:81852083724:ios:7e1aafacda252d54a08829",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with persistence
let auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
} catch (error) {
    // Auth already initialized
    auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { app, auth, db, storage };
