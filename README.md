# Baby Tracker 🍼

A beautiful iOS app for tracking your baby's sleep, feedings, and diaper changes.

## Features

### 🆓 Free Features
- **Sleep Tracking** - Start/stop timer with duration tracking
- **Feeding Logging** - Breast (left/right/both), bottle (oz), and solid food
- **Diaper Tracking** - Wet and dirty diaper logging with notes
- **Daily Summary** - Quick view of today's totals
- **Activity Log** - Chronological view with filters
- **Dark Mode** - Beautiful dark theme support
- **Color Themes** - Blue (boy), Pink (girl), and Purple (neutral) themes
- **Baby Profile** - Name, gender, birth date, and optional photo

### 💎 Premium Features ($2.99/mo or $29.99/yr)
- **Share with Partner** - Real-time sync between parents
- **Multiple Babies** - Track more than one child
- **Advanced Analytics** - Sleep patterns, feeding trends (coming soon)

## Tech Stack

- **Framework**: React Native with Expo
- **Routing**: Expo Router (file-based)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **State Management**: Zustand
- **Subscriptions**: RevenueCat
- **Styling**: Custom theme system with animations

## Project Structure

\`\`\`
mobile/
├── app/                      # Expo Router screens
│   ├── (auth)/               # Auth screens (login, signup, forgot-password)
│   ├── (tabs)/               # Main app tabs (home, log, settings)
│   ├── baby/                 # Baby profile screens
│   ├── modals/               # Modal screens (feeding, share)
│   ├── _layout.tsx           # Root layout
│   └── index.tsx             # Entry point / auth redirect
├── src/
│   ├── components/           # UI components
│   │   ├── ui/               # Base components (Button, Input, Card)
│   │   ├── ActionCard.tsx    # Activity action cards
│   │   ├── ActivityItem.tsx  # Activity log items
│   │   └── SummaryCard.tsx   # Summary statistics
│   ├── lib/                  # External service configs
│   │   └── firebase.ts       # Firebase setup
│   ├── store/                # Zustand stores
│   │   ├── authStore.ts      # Authentication state
│   │   ├── babyStore.ts      # Baby profiles
│   │   ├── activityStore.ts  # Activities
│   │   └── settingsStore.ts  # App settings
│   ├── theme/                # Styling system
│   │   ├── colors.ts         # Color palettes
│   │   ├── spacing.ts        # Layout tokens
│   │   └── index.ts          # Theme provider
│   └── types/                # TypeScript definitions
│       └── index.ts
├── app.json                  # Expo config
├── babel.config.js           # Babel config with Reanimated
├── package.json
└── tsconfig.json
\`\`\`

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator (Xcode) or physical device with Expo Go

### Installation

1. **Clone and install dependencies**
   \`\`\`bash
   cd mobile
   npm install --legacy-peer-deps
   \`\`\`

2. **Configure Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Email/Password and Apple authentication
   - Enable Firestore Database
   - Enable Storage
   - Add an iOS app
   - Copy your config to \`src/lib/firebase.ts\`

3. **Run the app**
   \`\`\`bash
   npm start
   \`\`\`
   Then press \`i\` to open iOS simulator

## Development

### Running in Development
\`\`\`bash
npm start        # Start Expo dev server
npm run ios      # Start on iOS simulator
npm run android  # Start on Android emulator
\`\`\`

### Building for Production
\`\`\`bash
npx eas build --platform ios
\`\`\`

## Firebase Configuration

Update \`src/lib/firebase.ts\` with your Firebase config:

\`\`\`typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
\`\`\`

### Firestore Rules

Deploy these security rules:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Baby access for owners and shared users
    match /babies/{babyId} {
      allow read: if request.auth != null && 
        (resource.data.ownerId == request.auth.uid || 
         request.auth.uid in resource.data.sharedWith);
      allow write: if request.auth != null && resource.data.ownerId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Activities - users can access if they have access to the baby
    match /activities/{activityId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/babies/$(resource.data.babyId)) &&
        (get(/databases/$(database)/documents/babies/$(resource.data.babyId)).data.ownerId == request.auth.uid ||
         request.auth.uid in get(/databases/$(database)/documents/babies/$(resource.data.babyId)).data.sharedWith);
    }
    
    // Baby invites
    match /babyInvites/{inviteId} {
      allow read: if request.auth != null && 
        resource.data.invitedEmail == request.auth.token.email;
      allow write: if request.auth != null;
    }
  }
}
\`\`\`

## RevenueCat Setup (Subscription)

1. Create account at https://www.revenuecat.com
2. Connect App Store Connect
3. Create products (monthly + annual)
4. Add API keys to the app
5. See \`src/lib/revenueCat.ts\` (to be created)

## License

Private - All rights reserved
