// ===== Subscription Store =====
// Manages premium subscription state and feature gating

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SubscriptionTier = 'free' | 'premium';

export interface SubscriptionState {
    tier: SubscriptionTier;
    isPremium: boolean;

    // Premium features
    canShareWithPartner: boolean;
    canAddMultipleBabies: boolean;
    canExportData: boolean;
    hasPrioritySupport: boolean;

    // For future IAP integration
    subscriptionId: string | null;
    expiresAt: Date | null;

    // Actions
    upgradeToPremium: () => void;
    downgradeToFree: () => void;
    restorePurchases: () => Promise<void>;

    // Feature checks
    checkFeatureAccess: (feature: PremiumFeature) => boolean;
}

export type PremiumFeature =
    | 'share_partner'
    | 'multiple_babies'
    | 'export_data'
    | 'priority_support';

const PREMIUM_FEATURES: Record<PremiumFeature, { name: string; description: string }> = {
    share_partner: {
        name: 'Share with Partner',
        description: 'Invite your partner to view and log activities together',
    },
    multiple_babies: {
        name: 'Multiple Baby Profiles',
        description: 'Track multiple children with separate profiles',
    },
    export_data: {
        name: 'Export Data',
        description: 'Export your data as CSV or PDF reports',
    },
    priority_support: {
        name: 'Priority Support',
        description: 'Get faster responses from our support team',
    },
};

export const useSubscriptionStore = create<SubscriptionState>()(
    persist(
        (set, get) => ({
            tier: 'free',
            isPremium: false,

            canShareWithPartner: false,
            canAddMultipleBabies: false,
            canExportData: false,
            hasPrioritySupport: false,

            subscriptionId: null,
            expiresAt: null,

            upgradeToPremium: () => {
                set({
                    tier: 'premium',
                    isPremium: true,
                    canShareWithPartner: true,
                    canAddMultipleBabies: true,
                    canExportData: true,
                    hasPrioritySupport: true,
                });
            },

            downgradeToFree: () => {
                set({
                    tier: 'free',
                    isPremium: false,
                    canShareWithPartner: false,
                    canAddMultipleBabies: false,
                    canExportData: false,
                    hasPrioritySupport: false,
                    subscriptionId: null,
                    expiresAt: null,
                });
            },

            restorePurchases: async () => {
                // TODO: Implement with RevenueCat or StoreKit
                // For now, just check if user has a valid subscription
                console.log('Restore purchases - to be implemented with IAP');
            },

            checkFeatureAccess: (feature: PremiumFeature) => {
                const state = get();
                switch (feature) {
                    case 'share_partner':
                        return state.canShareWithPartner;
                    case 'multiple_babies':
                        return state.canAddMultipleBabies;
                    case 'export_data':
                        return state.canExportData;
                    case 'priority_support':
                        return state.hasPrioritySupport;
                    default:
                        return false;
                }
            },
        }),
        {
            name: 'subscription-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

export { PREMIUM_FEATURES };
