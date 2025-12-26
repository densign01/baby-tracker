// ===== Auth Store =====

import { create } from 'zustand';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    User as FirebaseUser,
    updateProfile,
    OAuthProvider,
    signInWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { auth, db } from '../lib/firebase';
import type { User, SubscriptionStatus } from '../types';

interface AuthState {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;

    // Actions
    initialize: () => () => void;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string) => Promise<void>;
    signInWithApple: () => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    clearError: () => void;
    updateSubscriptionStatus: (status: SubscriptionStatus, expiry?: Date) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    firebaseUser: null,
    isLoading: false,
    isInitialized: false,
    error: null,

    initialize: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch user data from Firestore
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    set({
                        firebaseUser,
                        user: {
                            id: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            displayName: userData.displayName || firebaseUser.displayName,
                            photoUrl: userData.photoUrl || firebaseUser.photoURL,
                            createdAt: userData.createdAt?.toDate() || new Date(),
                            subscriptionStatus: userData.subscriptionStatus || 'free',
                            subscriptionExpiry: userData.subscriptionExpiry?.toDate() || null,
                        },
                        isInitialized: true,
                        isLoading: false,
                    });
                } else {
                    // Create user document if it doesn't exist
                    await setDoc(doc(db, 'users', firebaseUser.uid), {
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoUrl: firebaseUser.photoURL,
                        createdAt: serverTimestamp(),
                        subscriptionStatus: 'free',
                        subscriptionExpiry: null,
                    });
                    set({
                        firebaseUser,
                        user: {
                            id: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            displayName: firebaseUser.displayName,
                            photoUrl: firebaseUser.photoURL,
                            createdAt: new Date(),
                            subscriptionStatus: 'free',
                            subscriptionExpiry: null,
                        },
                        isInitialized: true,
                        isLoading: false,
                    });
                }
            } else {
                set({
                    user: null,
                    firebaseUser: null,
                    isInitialized: true,
                    isLoading: false,
                });
            }
        });

        return unsubscribe;
    },

    signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            const message = getAuthErrorMessage(error.code);
            set({ error: message, isLoading: false });
            throw error;
        }
    },

    signUp: async (email, password, displayName) => {
        set({ isLoading: true, error: null });
        try {
            const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

            // Update profile with display name
            await updateProfile(firebaseUser, { displayName });

            // Create user document
            await setDoc(doc(db, 'users', firebaseUser.uid), {
                email,
                displayName,
                photoUrl: null,
                createdAt: serverTimestamp(),
                subscriptionStatus: 'free',
                subscriptionExpiry: null,
            });
        } catch (error: any) {
            const message = getAuthErrorMessage(error.code);
            set({ error: message, isLoading: false });
            throw error;
        }
    },

    signInWithApple: async () => {
        set({ isLoading: true, error: null });
        try {
            // Generate a secure random nonce
            const nonce = Math.random().toString(36).substring(2, 10);
            const hashedNonce = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                nonce
            );

            // Request Apple authentication
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
                nonce: hashedNonce,
            });

            // Create Firebase credential
            const provider = new OAuthProvider('apple.com');
            const oAuthCredential = provider.credential({
                idToken: credential.identityToken!,
                rawNonce: nonce,
            });

            // Sign in to Firebase
            const { user: firebaseUser } = await signInWithCredential(auth, oAuthCredential);

            // Get or create user document
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (!userDoc.exists()) {
                // Apple only provides name on first sign-in
                const displayName = credential.fullName
                    ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
                    : firebaseUser.displayName || 'User';

                await setDoc(doc(db, 'users', firebaseUser.uid), {
                    email: credential.email || firebaseUser.email,
                    displayName,
                    photoUrl: null,
                    createdAt: serverTimestamp(),
                    subscriptionStatus: 'free',
                    subscriptionExpiry: null,
                    provider: 'apple',
                });

                // Update Firebase profile
                await updateProfile(firebaseUser, { displayName });
            }
        } catch (error: any) {
            if (error.code === 'ERR_REQUEST_CANCELED') {
                set({ isLoading: false });
                return; // User cancelled, not an error
            }
            set({ error: 'Apple Sign-In failed. Please try again.', isLoading: false });
            throw error;
        }
    },

    signOut: async () => {
        set({ isLoading: true, error: null });
        try {
            await firebaseSignOut(auth);
            set({ user: null, firebaseUser: null, isLoading: false });
        } catch (error: any) {
            set({ error: 'Failed to sign out', isLoading: false });
            throw error;
        }
    },

    resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            await sendPasswordResetEmail(auth, email);
            set({ isLoading: false });
        } catch (error: any) {
            const message = getAuthErrorMessage(error.code);
            set({ error: message, isLoading: false });
            throw error;
        }
    },

    clearError: () => set({ error: null }),

    updateSubscriptionStatus: async (status, expiry) => {
        const { user, firebaseUser } = get();
        if (!user || !firebaseUser) return;

        await setDoc(doc(db, 'users', firebaseUser.uid), {
            subscriptionStatus: status,
            subscriptionExpiry: expiry || null,
        }, { merge: true });

        set({
            user: {
                ...user,
                subscriptionStatus: status,
                subscriptionExpiry: expiry || null,
            },
        });
    },
}));

// Helper function to convert Firebase error codes to user-friendly messages
function getAuthErrorMessage(code: string): string {
    switch (code) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please sign in instead.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/operation-not-allowed':
            return 'Email/password sign in is not enabled.';
        case 'auth/weak-password':
            return 'Please choose a stronger password (at least 6 characters).';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        default:
            return 'An error occurred. Please try again.';
    }
}
