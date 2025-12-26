# Apple Sign-In Setup Guide

## Overview
Apple Sign-In has been added to the Baby Tracker app. This guide covers the remaining configuration steps needed before you can test and deploy.

## Code Changes Made ✅
- [x] Installed `expo-apple-authentication` and `expo-crypto`  
- [x] Added `signInWithApple` method to auth store
- [x] Updated login screen with native Apple Sign-In button
- [x] Added `usesAppleSignIn: true` to app.json
- [x] Added expo-apple-authentication plugin

## Firebase Console Setup (Required)

### 1. Enable Apple Sign-In Provider
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `baby-tracker-ea362`
3. Go to **Authentication** → **Sign-in method**
4. Click **Add new provider**
5. Select **Apple**
6. Toggle **Enable**
7. Enter your **Service ID** (usually your bundle ID: `com.yourcompany.babytracker`)
8. Click **Save**

### 2. Configure Apple Developer Account
1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Go to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → Select your App ID
4. Enable **Sign in with Apple** capability
5. Click **Configure** next to Sign in with Apple
6. Add your website domain (for web redirect, optional)

### 3. Create a Service ID (for Firebase)
1. In Apple Developer → **Identifiers** → **+** button
2. Select **Services IDs** → Continue
3. Enter description: "Baby Tracker Firebase"
4. Enter Identifier: `com.yourcompany.babytracker.firebase`
5. Enable **Sign in with Apple**
6. Configure:
   - Primary App ID: Select your main app
   - Domains: Your Firebase domain
   - Return URLs: From Firebase Console

## EAS Build Setup (Required for Testing)

Apple Sign-In ONLY works in a development build, not in Expo Go.

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo
eas login

# Configure the project
eas build:configure

# Create a development build for iOS simulator
eas build --profile development --platform ios

# Or create a development build for device
eas build --profile development --platform ios --device
```

## Testing
1. Apple Sign-In won't appear in Expo Go (it checks availability first)
2. Use a development build to test Apple Sign-In
3. You can test in the iOS Simulator with iOS 13+

## Bundle Identifier
Before submitting to App Store, update the bundle identifier in `app.json`:
```json
"bundleIdentifier": "com.yourcompany.babytracker"
```
Replace `yourcompany` with your actual company/developer name.

## Troubleshooting

### "Apple Sign-In button doesn't appear"
- Expo Go doesn't support Apple Sign-In
- Create a development build with EAS

### "Sign in failed"
- Ensure Apple Sign-In is enabled in Firebase Console
- Verify Service ID configuration
- Check that bundle identifiers match

### "Invalid response from Apple"
- The nonce/hash mismatch - this is handled automatically
- Ensure expo-crypto is installed

## Next Steps
1. ⚠️ **Enable Apple Sign-In in Firebase Console** (required)
2. Set up Apple Developer Account (required for App Store)
3. Create EAS development build to test
4. Update bundle identifier before publishing
