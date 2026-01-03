// ===== Type Definitions =====

export type Gender = 'boy' | 'girl' | 'neutral';
export type Theme = 'light' | 'dark';
export type ColorScheme = 'neutral' | 'boy' | 'girl';
export type SubscriptionStatus = 'free' | 'premium';

export type ActivityType = 'sleep' | 'feeding' | 'diaper';
export type DiaperType = 'pee' | 'poop' | 'both';
export type FeedingType = 'breast' | 'bottle' | 'solid';
export type FeedingSide = 'left' | 'right' | 'both';

// User
export interface User {
    id: string;
    email: string;
    displayName: string | null;
    photoUrl: string | null;
    createdAt: Date;
    subscriptionStatus: SubscriptionStatus;
    subscriptionExpiry: Date | null;
}

export interface UserSettings {
    theme: Theme;
    colorScheme: ColorScheme;
    notificationsEnabled: boolean;
}

// Baby
export interface Baby {
    id: string;
    name: string;
    gender: Gender;
    birthDate?: Date;
    photoUrl: string | null;
    ownerId: string;
    sharedWith: string[]; // userIds - premium feature
    createdAt: Date;
}

export interface BabyInvite {
    id: string;
    babyId: string;
    babyName: string;
    invitedBy: string;
    invitedByName: string;
    invitedEmail: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: Date;
}

// Activities
export interface BaseActivity {
    id: string;
    babyId: string;
    type: ActivityType;
    timestamp: Date;
    notes: string | null;
    loggedBy: string;
    loggedByName: string | null;
    createdAt: Date;
}

export interface SleepActivity extends BaseActivity {
    type: 'sleep';
    endTime: Date | null;
    duration: number | null; // milliseconds
    isActive: boolean;
}

export interface FeedingActivity extends BaseActivity {
    type: 'feeding';
    feedingType: FeedingType;
    feedingSide: FeedingSide | null; // for breast
    bottleAmount: number | null; // oz, for bottle
}

export interface DiaperActivity extends BaseActivity {
    type: 'diaper';
    diaperType: DiaperType;
}

export type Activity = SleepActivity | FeedingActivity | DiaperActivity;

// Daily Summary
export interface DailySummary {
    date: Date;
    totalSleepMs: number;
    sleepCount: number;
    feedingCount: number;
    bottleTotalOz: number;
    diaperCount: number;
    wetDiaperCount: number;
    dirtyDiaperCount: number;
}

// Navigation
export type RootStackParamList = {
    '(auth)/login': undefined;
    '(auth)/signup': undefined;
    '(auth)/forgot-password': undefined;
    '(tabs)': undefined;
    'baby/setup': undefined;
    'baby/[id]': { id: string };
    'modals/feeding': { activityId?: string };
    'modals/sleep': { activityId?: string };
    'modals/share': { babyId: string };
};
