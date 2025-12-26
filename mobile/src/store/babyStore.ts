// ===== Baby Store =====

import { create } from 'zustand';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import type { Baby, Gender, BabyInvite } from '../types';

interface BabyState {
    babies: Baby[];
    currentBabyId: string | null;
    invites: BabyInvite[];
    isLoading: boolean;
    error: string | null;

    // Getters
    currentBaby: () => Baby | null;
    selectedBaby: Baby | null;

    // Actions
    subscribeToBabies: (userId: string) => () => void;
    subscribeToUserBabies: () => () => void;
    subscribeToInvites: (email: string) => () => void;
    createBaby: (data: { name?: string; gender?: Gender; birthDate?: Date; ownerId: string }, photoUri?: string) => Promise<string>;
    updateBaby: (babyId: string, data: Partial<Pick<Baby, 'name' | 'gender' | 'birthDate' | 'photoUrl'>>) => Promise<void>;
    deleteBaby: (babyId: string) => Promise<void>;
    setCurrentBaby: (babyId: string | null) => void;

    // Premium features
    inviteParent: (babyId: string, email: string, inviterName: string) => Promise<void>;
    invitePartner: (babyId: string, email: string) => Promise<void>;
    acceptInvite: (inviteId: string, userId: string) => Promise<void>;
    declineInvite: (inviteId: string) => Promise<void>;
    removeSharedParent: (babyId: string, userId: string) => Promise<void>;
}

export const useBabyStore = create<BabyState>((set, get) => ({
    babies: [],
    currentBabyId: null,
    invites: [],
    isLoading: false,
    error: null,

    // selectedBaby as a derived value (use getter pattern via selector)
    selectedBaby: null as Baby | null,

    currentBaby: () => {
        const { babies, currentBabyId } = get();
        return babies.find(b => b.id === currentBabyId) || babies[0] || null;
    },

    subscribeToBabies: (userId) => {
        set({ isLoading: true });

        // Query babies where user is owner OR shared with
        const q = query(
            collection(db, 'babies'),
            where('ownerId', '==', userId)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const ownedBabies = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    birthDate: data.birthDate ? (data.birthDate as Timestamp).toDate() : undefined,
                    createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
                };
            }) as Baby[];

            // Also get babies shared with this user
            const sharedQuery = query(
                collection(db, 'babies'),
                where('sharedWith', 'array-contains', userId)
            );
            const sharedSnapshot = await getDocs(sharedQuery);
            const sharedBabies = sharedSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    birthDate: data.birthDate ? (data.birthDate as Timestamp).toDate() : undefined,
                    createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
                };
            }) as Baby[];

            const allBabies = [...ownedBabies, ...sharedBabies];
            const currentId = get().currentBabyId || allBabies[0]?.id || null;
            const selected = allBabies.find(b => b.id === currentId) || allBabies[0] || null;

            set({
                babies: allBabies,
                isLoading: false,
                currentBabyId: currentId,
                selectedBaby: selected,
            });
        }, (error) => {
            console.error('Error subscribing to babies:', error);
            set({ error: 'Failed to load babies', isLoading: false });
        });

        return unsubscribe;
    },

    // Convenience method that gets user from auth
    subscribeToUserBabies: () => {
        // This is a wrapper that the tabs layout uses
        // For now, return empty unsubscribe - the actual subscription happens via subscribeToBabies
        return () => { };
    },

    subscribeToInvites: (email) => {
        const q = query(
            collection(db, 'babyInvites'),
            where('invitedEmail', '==', email.toLowerCase()),
            where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const invites = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: (doc.data().createdAt as Timestamp).toDate(),
            })) as BabyInvite[];

            set({ invites });
        });

        return unsubscribe;
    },

    createBaby: async (data, photoUri) => {
        set({ isLoading: true, error: null });
        try {
            const babyRef = doc(collection(db, 'babies'));
            let photoUrl = null;

            // Upload photo if provided
            if (photoUri) {
                try {
                    const response = await fetch(photoUri);
                    const blob = await response.blob();
                    const photoRef = ref(storage, `babies/${babyRef.id}/profile.jpg`);
                    await uploadBytes(photoRef, blob);
                    photoUrl = await getDownloadURL(photoRef);
                } catch (photoError) {
                    console.warn('Photo upload failed:', photoError);
                    // Continue without photo
                }
            }

            const babyData: any = {
                name: data.name || 'Baby',
                gender: data.gender || 'neutral',
                photoUrl,
                ownerId: data.ownerId,
                sharedWith: [],
                createdAt: serverTimestamp(),
            };

            // Only add birthDate if provided
            if (data.birthDate) {
                babyData.birthDate = Timestamp.fromDate(data.birthDate);
            }

            await setDoc(babyRef, babyData);

            // Create the baby object to store locally
            const newBaby: Baby = {
                id: babyRef.id,
                name: babyData.name,
                gender: babyData.gender,
                birthDate: data.birthDate,
                photoUrl,
                ownerId: data.ownerId,
                sharedWith: [],
                createdAt: new Date(),
            };

            set({
                currentBabyId: babyRef.id,
                selectedBaby: newBaby,
                babies: [...get().babies, newBaby],
                isLoading: false
            });
            return babyRef.id;
        } catch (error) {
            console.error('Error creating baby:', error);
            set({ error: 'Failed to create baby profile', isLoading: false });
            throw error;
        }
    },

    updateBaby: async (babyId, data) => {
        set({ isLoading: true, error: null });
        try {
            const updateData: any = { ...data };
            if (data.birthDate) {
                updateData.birthDate = Timestamp.fromDate(data.birthDate);
            }

            await setDoc(doc(db, 'babies', babyId), updateData, { merge: true });
            set({ isLoading: false });
        } catch (error) {
            console.error('Error updating baby:', error);
            set({ error: 'Failed to update baby profile', isLoading: false });
            throw error;
        }
    },

    deleteBaby: async (babyId) => {
        set({ isLoading: true, error: null });
        try {
            await deleteDoc(doc(db, 'babies', babyId));

            const { currentBabyId, babies } = get();
            if (currentBabyId === babyId) {
                const remainingBabies = babies.filter(b => b.id !== babyId);
                set({ currentBabyId: remainingBabies[0]?.id || null });
            }

            set({ isLoading: false });
        } catch (error) {
            console.error('Error deleting baby:', error);
            set({ error: 'Failed to delete baby profile', isLoading: false });
            throw error;
        }
    },

    setCurrentBaby: (babyId) => set({ currentBabyId: babyId }),

    // Premium features
    inviteParent: async (babyId, email, inviterName) => {
        try {
            const baby = get().babies.find(b => b.id === babyId);
            if (!baby) throw new Error('Baby not found');

            const inviteRef = doc(collection(db, 'babyInvites'));
            await setDoc(inviteRef, {
                babyId,
                babyName: baby.name,
                invitedBy: baby.ownerId,
                invitedByName: inviterName,
                invitedEmail: email.toLowerCase(),
                status: 'pending',
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error inviting parent:', error);
            throw error;
        }
    },

    // Simplified invite for partner (uses baby owner as inviter)
    invitePartner: async (babyId, email) => {
        try {
            const baby = get().babies.find(b => b.id === babyId);
            if (!baby) throw new Error('Baby not found');

            const inviteRef = doc(collection(db, 'babyInvites'));
            await setDoc(inviteRef, {
                babyId,
                babyName: baby.name,
                invitedBy: baby.ownerId,
                invitedByName: 'Partner',
                invitedEmail: email.toLowerCase(),
                status: 'pending',
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error inviting partner:', error);
            throw error;
        }
    },

    acceptInvite: async (inviteId, userId) => {
        try {
            const inviteDoc = await getDoc(doc(db, 'babyInvites', inviteId));
            if (!inviteDoc.exists()) throw new Error('Invite not found');

            const invite = inviteDoc.data();

            // Add user to baby's sharedWith array
            const babyRef = doc(db, 'babies', invite.babyId);
            const babyDoc = await getDoc(babyRef);
            if (babyDoc.exists()) {
                const sharedWith = babyDoc.data().sharedWith || [];
                await setDoc(babyRef, {
                    sharedWith: [...sharedWith, userId]
                }, { merge: true });
            }

            // Update invite status
            await setDoc(doc(db, 'babyInvites', inviteId), {
                status: 'accepted'
            }, { merge: true });
        } catch (error) {
            console.error('Error accepting invite:', error);
            throw error;
        }
    },

    declineInvite: async (inviteId) => {
        try {
            await setDoc(doc(db, 'babyInvites', inviteId), {
                status: 'declined'
            }, { merge: true });
        } catch (error) {
            console.error('Error declining invite:', error);
            throw error;
        }
    },

    removeSharedParent: async (babyId, userId) => {
        try {
            const babyRef = doc(db, 'babies', babyId);
            const babyDoc = await getDoc(babyRef);
            if (babyDoc.exists()) {
                const sharedWith = babyDoc.data().sharedWith || [];
                await setDoc(babyRef, {
                    sharedWith: sharedWith.filter((id: string) => id !== userId)
                }, { merge: true });
            }
        } catch (error) {
            console.error('Error removing shared parent:', error);
            throw error;
        }
    },
}));
