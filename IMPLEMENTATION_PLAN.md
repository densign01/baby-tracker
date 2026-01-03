# Baby Tracker iOS App - Implementation Plan

## Overview
Transform the baby tracker into a monetizable iOS app with user authentication, baby profiles, real-time syncing, and subscription-based premium features.

**Last Updated:** December 26, 2025

---

## Tech Stack

| Component | Technology | Status |
|-----------|------------|--------|
| Mobile Framework | **React Native + Expo** | ✅ Configured |
| Authentication | **Firebase Auth** | ✅ Working |
| Database | **Firebase Firestore** | ✅ Working |
| Subscriptions | **RevenueCat** | 🔜 Deferred |
| State Management | **Zustand** | ✅ Implemented |
| Navigation | **Expo Router** | ✅ Working |
| UI Components | **Custom + Expo** | ✅ Simplified theme |

---

## Current Status

### ✅ Completed Features
- **User Authentication** - Email/password signup, login, forgot password
- **Baby Profile Creation** - Optional fields (name, gender, birthday, photo)
- **iOS Date Picker** - Modal with Done/Cancel buttons
- **Home Screen** - Shows baby name, current date, action cards
- **Sleep Tracking** - Start/stop with timer display
- **Feeding Logging** - Breast, bottle, solid options
- **Diaper Logging** - Unified button with Wet/Dirty/Both modal
- **Daily Summary** - Sleep, feedings, diapers counts
- **Activity Log Screen** - Basic list of activities
- **Settings Screen** - User info and sign out

### 🔄 In Testing
- Activity logging to Firebase (diaper, feeding, sleep)
- Real-time counter updates
- Activity log display

### 🔜 Deferred (Post-MVP)
- RevenueCat subscription integration
- Partner sharing (Premium feature)
- Multiple babies (Premium feature)
- Apple Sign-In
- Dark mode / dynamic theming
- Push notifications

---

## Feature Breakdown

### 🆓 Free Tier Features
1. **User Authentication**
   - [x] Email/password signup & login
   - [x] Password reset
   - [ ] Apple Sign-In (required for iOS - deferred)

2. **Baby Profile**
   - [x] Name (optional)
   - [x] Gender (boy/girl/neutral) with theme colors
   - [x] Birth date (optional)
   - [x] Profile picture (optional)

3. **Activity Tracking**
   - [x] Sleep/nap tracking with timer
   - [x] Feeding tracking (breast, bottle, solid)
   - [x] Diaper tracking (wet, dirty, both)
   - [x] Notes on any activity

4. **Daily Summary**
   - [x] Total sleep time
   - [x] Feeding count
   - [x] Diaper count

5. **Activity Log**
   - [x] Chronological view
   - [ ] Filter by activity type
   - [ ] Edit/delete entries

6. **Customization**
   - [ ] Dark mode toggle (deferred)
   - [ ] Boy theme (blue palette)
   - [ ] Girl theme (pink palette)
   - [x] Neutral theme (purple - default)

### 💎 Premium Features ($2.99/month or $29.99/year)
1. **Share Baby with Partner** - Deferred
2. **Multiple Babies** - Deferred
3. **Advanced Analytics** - Deferred

---

## Data Architecture

### Firestore Collections

```
users/
  {userId}/
    email: string
    displayName: string
    createdAt: timestamp
    subscriptionStatus: 'free' | 'premium'
    subscriptionExpiry: timestamp | null
    settings: {
      theme: 'light' | 'dark'
      colorScheme: 'neutral' | 'boy' | 'girl'
    }

babies/
  {babyId}/
    name: string
    gender: 'boy' | 'girl' | 'neutral'
    birthDate: timestamp (optional)
    photoUrl: string | null
    ownerId: string (userId)
    sharedWith: string[] (userIds) - PREMIUM ONLY
    createdAt: timestamp

activities/
  {activityId}/
    babyId: string
    type: 'sleep' | 'feeding' | 'pee' | 'poop'
    timestamp: timestamp
    endTime: timestamp | null (for sleep)
    duration: number | null (ms, for sleep)
    feedingType: 'breast' | 'bottle' | 'solid' | null
    feedingSide: 'left' | 'right' | 'both' | null
    bottleAmount: number | null (oz)
    notes: string | null
    loggedBy: string (userId)
    loggedByName: string | null
    createdAt: timestamp
```

---

## File Structure (Implemented)

```
baby-tracker/mobile/
├── app/                      # Expo Router pages
│   ├── (auth)/               # Auth screens
│   │   ├── _layout.tsx       ✅
│   │   ├── login.tsx         ✅
│   │   ├── signup.tsx        ✅
│   │   └── forgot-password.tsx ✅
│   ├── (tabs)/               # Main app tabs
│   │   ├── _layout.tsx       ✅
│   │   ├── index.tsx         ✅ (Home)
│   │   ├── log.tsx           ✅
│   │   └── settings.tsx      ✅
│   ├── baby/
│   │   └── setup.tsx         ✅
│   ├── modals/
│   │   ├── feeding.tsx       ✅
│   │   └── share.tsx         ✅ (placeholder)
│   ├── _layout.tsx           ✅
│   └── index.tsx             ✅
├── src/
│   ├── components/
│   │   ├── ui/               ✅
│   │   ├── ActionCard.tsx    ✅
│   │   ├── ActivityItem.tsx  ✅
│   │   └── SummaryCard.tsx   ✅
│   ├── lib/
│   │   └── firebase.ts       ✅
│   ├── store/
│   │   ├── authStore.ts      ✅
│   │   ├── babyStore.ts      ✅
│   │   ├── activityStore.ts  ✅
│   │   └── settingsStore.ts  ✅
│   ├── theme/
│   │   ├── simple.ts         ✅ (static theme)
│   │   ├── colors.ts         ✅
│   │   ├── spacing.ts        ✅
│   │   └── index.ts          ⚠️ (dynamic theming disabled)
│   └── types/
│       └── index.ts          ✅
├── app.json                  ✅
├── package.json              ✅
└── TODO.md                   ✅
```

---

## Development Phases - Status

### Phase 1: Core Setup ✅
- [x] Initialize Expo project with TypeScript
- [x] Set up Firebase project (baby-tracker-ea362)
- [x] Configure Firebase Auth
- [x] Set up Firestore database (test mode)
- [x] Create basic navigation structure
- [x] Implement theme system (static theme for stability)

### Phase 2: Authentication ✅
- [x] Login screen
- [x] Signup screen
- [x] Forgot password
- [ ] Apple Sign-In (deferred)
- [x] Auth state persistence

### Phase 3: Baby Profile ✅
- [x] Baby setup flow (all fields optional)
- [ ] Profile editing
- [x] Photo upload (Firebase Storage)
- [ ] Gender-based theming (deferred)

### Phase 4: Activity Tracking 🔄
- [x] Sleep timer UI
- [x] Feeding modal with all options
- [x] Diaper logging (unified with wet/dirty/both)
- [x] Notes on activities
- [x] Firestore sync
- [ ] Background timer support

### Phase 5: Dashboard & Log 🔄
- [x] Daily summary cards
- [x] Activity log view
- [ ] Edit/delete activities
- [ ] Offline support

### Phase 6: Subscriptions 🔜
- [ ] Set up RevenueCat
- [ ] Configure iOS in-app purchases
- [ ] Premium paywall
- [ ] Subscription status checking

### Phase 7: Premium Features 🔜
- [ ] Share baby via email invite
- [ ] Accept/decline invitations
- [ ] Real-time sync between parents
- [ ] Multiple baby support

### Phase 8: Polish & Launch 🔜
- [ ] UI polish and animations
- [ ] Error handling improvements
- [ ] App Store assets
- [ ] TestFlight beta
- [ ] App Store submission

---

## Known Issues & Technical Debt

1. **Dynamic Theming Disabled** - Using static theme to avoid initialization errors
2. **No Composite Index** - Simplified Firestore queries to avoid index requirements
3. **No Apple Sign-In** - Required for App Store but deferred for MVP
4. **No Offline Support** - Firebase offline persistence not configured

---

## Color Schemes

### Neutral (Default - Currently Active)
```
Primary: #7C6FEA (purple)
Background: #F8F9FE
Card: #FFFFFF
```

### Boy Theme (Deferred)
```
Primary: #4A90D9 (blue)
```

### Girl Theme (Deferred)
```
Primary: #E875A0 (pink)
```

---

## Revenue Model (Planned)

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | Single baby, all tracking features |
| Premium Monthly | $2.99/mo | + Share baby, multiple babies |
| Premium Annual | $29.99/yr | Same as monthly (17% savings) |

---

## Next Steps

1. ✅ ~~Verify core app flow works on simulator~~
2. 🔄 Test all activity logging (diaper, feeding, sleep)
3. 🔄 Verify daily summary updates correctly
4. [ ] Implement edit/delete for activities
5. [ ] Add Apple Sign-In
6. [ ] Reintroduce dynamic theming
7. [ ] Set up RevenueCat
8. [ ] Prepare for TestFlight
