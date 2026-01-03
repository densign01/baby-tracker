// ===== Activity Store =====

import { create } from 'zustand';
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Activity, SleepActivity, FeedingActivity, DiaperActivity, ActivityType, FeedingType, FeedingSide, DailySummary } from '../types';

interface ActivityState {
    activities: Activity[];
    activeSleep: SleepActivity | null;
    isLoading: boolean;
    error: string | null;

    // Computed
    getTodayActivities: () => Activity[];
    getDailySummary: () => DailySummary;
    getRecentActivities: (type?: ActivityType) => Activity[];

    // Actions
    subscribeToActivities: (babyId: string) => () => void;

    // Sleep
    logSleep: (data: {
        babyId: string;
        userId: string;
        userName: string | null;
        durationMs: number;
        notes?: string;
    }) => Promise<string>;

    // Feeding
    logFeeding: (data: {
        babyId: string;
        userId: string;
        userName: string | null;
        feedingType: FeedingType;
        feedingSide?: FeedingSide;
        bottleAmount?: number;
        notes?: string;
    }) => Promise<string>;

    // Diaper
    logDiaper: (data: {
        babyId: string;
        userId: string;
        userName: string | null;
        diaperType: 'pee' | 'poop' | 'both';
        notes?: string;
    }) => Promise<string>;

    // Edit/Delete
    updateActivity: (activityId: string, updates: Partial<Activity>) => Promise<void>;
    deleteActivity: (activityId: string) => Promise<void>;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
    activities: [],
    activeSleep: null,
    isLoading: false,
    error: null,

    getTodayActivities: () => {
        const { activities } = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return activities.filter(activity => {
            const activityDate = new Date(activity.timestamp);
            activityDate.setHours(0, 0, 0, 0);
            return activityDate.getTime() === today.getTime();
        });
    },

    getDailySummary: (): DailySummary => {
        const todayActivities = get().getTodayActivities();

        const sleepActivities = todayActivities.filter(a => a.type === 'sleep') as SleepActivity[];
        const feedingActivities = todayActivities.filter(a => a.type === 'feeding') as FeedingActivity[];
        const diaperActivities = todayActivities.filter(a => a.type === 'diaper') as DiaperActivity[];

        // Count wet and dirty - 'both' counts toward both wet and dirty
        let wetCount = 0;
        let dirtyCount = 0;
        diaperActivities.forEach(d => {
            if (d.diaperType === 'pee' || d.diaperType === 'both') wetCount++;
            if (d.diaperType === 'poop' || d.diaperType === 'both') dirtyCount++;
        });

        return {
            date: new Date(),
            totalSleepMs: sleepActivities.reduce((sum, a) => sum + (a.duration || 0), 0),
            sleepCount: sleepActivities.length,
            feedingCount: feedingActivities.length,
            bottleTotalOz: feedingActivities
                .filter(a => a.feedingType === 'bottle')
                .reduce((sum, a) => sum + (a.bottleAmount || 0), 0),
            diaperCount: diaperActivities.length,
            wetDiaperCount: wetCount,
            dirtyDiaperCount: dirtyCount,
        };
    },

    getRecentActivities: (type?: ActivityType) => {
        const { activities } = get();
        if (type) {
            return activities.filter(a => a.type === type).slice(0, 10);
        }
        return activities.slice(0, 20);
    },

    subscribeToActivities: (babyId) => {
        set({ isLoading: true });

        // Simple query without orderBy to avoid index requirement
        const q = query(
            collection(db, 'activities'),
            where('babyId', '==', babyId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const activities = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp ? (data.timestamp as Timestamp).toDate() : new Date(),
                    endTime: data.endTime ? (data.endTime as Timestamp).toDate() : null,
                    createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
                };
            }) as Activity[];

            // Sort in memory (newest first)
            activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

            // Find active sleep
            const activeSleep = activities.find(
                a => a.type === 'sleep' && (a as SleepActivity).isActive
            ) as SleepActivity | null;

            set({ activities, activeSleep, isLoading: false });
        }, (error) => {
            console.error('Error subscribing to activities:', error);
            set({ error: 'Failed to load activities', isLoading: false });
        });

        return unsubscribe;
    },

    logSleep: async (data) => {
        try {
            const activityRef = doc(collection(db, 'activities'));
            const now = new Date();

            await setDoc(activityRef, {
                babyId: data.babyId,
                type: 'sleep',
                timestamp: Timestamp.fromDate(now),
                duration: data.durationMs,
                isActive: false,
                notes: data.notes || null,
                loggedBy: data.userId,
                loggedByName: data.userName,
                createdAt: serverTimestamp(),
            });

            return activityRef.id;
        } catch (error) {
            console.error('Error logging sleep:', error);
            throw error;
        }
    },

    logFeeding: async (data) => {
        try {
            const activityRef = doc(collection(db, 'activities'));
            const now = new Date();

            await setDoc(activityRef, {
                babyId: data.babyId,
                type: 'feeding',
                feedingType: data.feedingType,
                feedingSide: data.feedingSide || null,
                bottleAmount: data.bottleAmount || null,
                timestamp: Timestamp.fromDate(now),
                notes: data.notes || null,
                loggedBy: data.userId,
                loggedByName: data.userName,
                createdAt: serverTimestamp(),
            });

            return activityRef.id;
        } catch (error) {
            console.error('Error logging feeding:', error);
            throw error;
        }
    },

    logDiaper: async (data) => {
        try {
            const activityRef = doc(collection(db, 'activities'));
            const now = new Date();

            await setDoc(activityRef, {
                babyId: data.babyId,
                type: 'diaper',
                diaperType: data.diaperType,
                timestamp: Timestamp.fromDate(now),
                notes: data.notes || null,
                loggedBy: data.userId,
                loggedByName: data.userName,
                createdAt: serverTimestamp(),
            });

            return activityRef.id;
        } catch (error) {
            console.error('Error logging diaper:', error);
            throw error;
        }
    },

    updateActivity: async (activityId, updates) => {
        try {
            const updateData: any = { ...updates };
            if (updates.timestamp) {
                updateData.timestamp = Timestamp.fromDate(updates.timestamp as Date);
            }
            if ((updates as SleepActivity).endTime) {
                updateData.endTime = Timestamp.fromDate((updates as SleepActivity).endTime as Date);
            }

            await setDoc(doc(db, 'activities', activityId), updateData, { merge: true });
        } catch (error) {
            console.error('Error updating activity:', error);
            throw error;
        }
    },

    deleteActivity: async (activityId) => {
        try {
            await deleteDoc(doc(db, 'activities', activityId));
        } catch (error) {
            console.error('Error deleting activity:', error);
            throw error;
        }
    },
}));
