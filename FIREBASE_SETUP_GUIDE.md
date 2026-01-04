# Firebase Setup Guide for Google Sign-In

This guide walks you through setting up Firebase Authentication with Google sign-in for HobHob.

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Project name: `hobhob` (or your preferred name)
4. **Disable Google Analytics** for now (can enable later)
5. Click **"Create project"**
6. Wait for project creation (~30 seconds)

---

## Step 2: Enable Google Authentication

### 2.1 Open Authentication

1. In Firebase Console, click **Build** → **Authentication**
2. Click **"Get Started"**

### 2.2 Add Google Provider

1. Click **"Add new provider"**
2. Select **Google**
3. Toggle **"Enable"** switch to ON
4. **Project support email**: Enter your email address
5. Click **"Save"**

---

## Step 3: Configure OAuth Consent Screen

### 3.1 For Development (Testing on localhost)

1. Still in Authentication → **Sign-in method** → **Google**
2. Click on the **Google** provider to expand settings
3. Scroll down to **Authorized domains**
4. You should see `localhost` already listed
5. For development, this is sufficient

### 3.2 For Production (Vercel/Custom Domain)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project from the top dropdown
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Choose **External** user type (for public apps)
5. Fill in required fields:
   - **App name**: HobHob
   - **User support email**: Your email
   - **Developer contact**: Your email
6. Click **"Save and Continue"** (skip scopes for now)
7. Go to **Credentials** section
8. Find your OAuth 2.0 client ID (should be created by Firebase)
9. Click to edit and add **Authorized domains**:
   - `localhost` (for development)
   - `your-project.vercel.app` (for Vercel deployment)
   - `your-custom-domain.com` (if using custom domain)
10. Click **"Save"**

---

## Step 4: Enable Realtime Database

1. Go back to [Firebase Console](https://console.firebase.google.com/)
2. Click **Build** → **Realtime Database**
3. Click **"Create Database"**
4. Select a location (choose closest to your users):
   - `us-central1` (Iowa, USA)
   - `europe-west1` (Belgium)
   - `asia-southeast1` (Singapore)
5. Start in **Test Mode** (we'll deploy proper rules next)
6. Click **"Done"**

---

## Step 5: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to **"Your apps"** section
3. Click the **web icon** `</>`
4. App nickname: `hobhob-web`
5. **Do NOT** enable Firebase Hosting for now
6. Click **"Register app"**
7. Copy the `firebaseConfig` object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "hobhob.firebaseapp.com",
  databaseURL: "https://hobhob.firebaseio.com",
  projectId: "hobhob",
  storageBucket: "hobhob.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

---

## Step 6: Configure Environment Variables

Create or edit `.env.local` in your project root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hobhob.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://hobhob.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hobhob
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hobhob.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Dev mode bypass (ONLY for development)
NEXT_PUBLIC_DEV_AUTH_BYPASS=true
```

---

## Step 7: Deploy Security Rules

1. Install Firebase CLI (first time only):
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Deploy security rules:
```bash
firebase deploy --only database:rules
```

---

## Step 8: Test Google Sign-In

### Development Test

1. Run development server:
```bash
npm run dev
```

2. Open http://localhost:3000

3. You should be redirected to `/sign-in`

4. Click **"Continue with Google"**

5. A popup window should appear with Google sign-in

6. Sign in with your Google account

7. After successful sign-in, you should be redirected to `/today`

### Troubleshooting Google Sign-In

#### Error: "auth/unauthorized-domain"

**Cause**: The domain is not authorized in Firebase Console

**Solution**:
1. Go to Firebase Console → Authentication → Sign-in method
2. Click on Google provider
3. Add the domain to **Authorized domains** list
4. For development, add: `localhost`
5. For production, add: `your-project.vercel.app`

#### Error: "auth/popup-blocked"

**Cause**: Browser is blocking the popup window

**Solution**:
1. Allow popups for localhost in your browser settings
2. Check if you have any popup blockers enabled
3. Try clicking the sign-in button again

#### Error: "auth/popup-closed-by-user"

**Cause**: User closed the popup before completing sign-in

**Solution**: Click the sign-in button again and complete the flow

#### Error: "auth/network-request-failed"

**Cause**: Network connection issue or CORS problem

**Solution**:
1. Check your internet connection
2. Make sure Firebase configuration is correct
3. Verify that `firebase.google.com` is accessible

#### Error: "auth/invalid-api-key"

**Cause**: Invalid Firebase API key

**Solution**:
1. Verify your `.env.local` file has correct values
2. Copy the config again from Firebase Console
3. Restart the development server after changing `.env.local`

#### Error: No redirect after sign-in

**Cause**: AuthProvider not detecting the auth state change

**Solution**:
1. Check browser console for errors
2. Verify Firebase credentials are correct
3. Check that `onAuthStateChanged` is working

---

## Step 9: Production Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/new)
3. Import your GitHub repository
4. Add environment variables from `.env.local` (except dev bypass)
5. Click **"Deploy"**

### After Deployment

1. Add your Vercel domain to Firebase authorized domains:
   - Firebase Console → Authentication → Sign-in method → Google
   - Add `your-project.vercel.app` to authorized domains
2. Test the live application
3. Verify Google sign-in works in production

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `hobhob.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Realtime Database URL | `https://hobhob.firebaseio.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID | `hobhob` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket (optional) | `hobhob.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID (optional) | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID | `1:123456789:web:...` |
| `NEXT_PUBLIC_DEV_AUTH_BYPASS` | Enable dev mode (dev only) | `true` |

---

## Security Best Practices

1. **Never commit `.env.local`** to git (it's already in `.gitignore`)
2. **Use different Firebase projects** for development and production
3. **Disable dev mode bypass** in production
4. **Keep security rules updated** and test them regularly
5. **Monitor Firebase Console** for suspicious activity

---

## Need Help?

- Check [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- Review [Testing Checklist](TESTING_CHECKLIST.md)
- Check browser console for detailed error messages
- Verify Firebase configuration in Firebase Console

---

**Next Steps:**

After Google sign-in is working:
1. ✅ Test habit creation
2. ✅ Test daily check-ins
3. ✅ Test statistics
4. ✅ Test settings
5. ✅ Deploy to production
