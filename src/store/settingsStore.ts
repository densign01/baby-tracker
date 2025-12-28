// ===== Settings Store =====

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Theme, ColorScheme } from '../types';

type BottleContentType = 'breast_milk' | 'formula';

interface FeedingPreferences {
    showBreast: boolean;
    showBottle: boolean;
    showSolid: boolean;
    lastBottleContent: BottleContentType;
}

interface SettingsState {
    theme: Theme;
    colorScheme: ColorScheme;
    notificationsEnabled: boolean;
    feedingPreferences: FeedingPreferences;

    // Actions
    setTheme: (theme: Theme) => void;
    setColorScheme: (scheme: ColorScheme) => void;
    toggleTheme: () => void;
    setNotificationsEnabled: (enabled: boolean) => void;
    setFeedingPreferences: (prefs: Partial<FeedingPreferences>) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            theme: 'light',
            colorScheme: 'neutral',
            notificationsEnabled: true,
            feedingPreferences: {
                showBreast: true,
                showBottle: true,
                showSolid: true,
                lastBottleContent: 'breast_milk',
            },

            setTheme: (theme) => set({ theme }),

            setColorScheme: (colorScheme) => set({ colorScheme }),

            toggleTheme: () => set((state) => ({
                theme: state.theme === 'light' ? 'dark' : 'light'
            })),

            setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),

            setFeedingPreferences: (prefs) => set((state) => ({
                feedingPreferences: { ...state.feedingPreferences, ...prefs }
            })),
        }),
        {
            name: 'baby-tracker-settings',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
