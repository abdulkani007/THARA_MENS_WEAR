# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: "THARA"
4. Disable Google Analytics (optional)
5. Click "Create Project"

## Step 2: Enable Authentication

1. Go to Authentication → Sign-in method
2. Enable **Email/Password**
3. Enable **Google** sign-in
4. Add authorized domain if deploying

## Step 3: Create Firestore Database

1. Go to Firestore Database
2. Click "Create Database"
3. Start in **Production Mode**
4. Choose location (closest to users)

## Step 4: Get Firebase Config

1. Go to Project Settings → General
2. Scroll to "Your apps"
3. Click Web icon (</>) to add web app
4. Register app name: "THARA Web"
5. Copy the firebaseConfig object

## Step 5: Update Firebase Config

Edit `src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 6: Deploy Firestore Rules

```bash
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

## Step 7: Create Admin User

1. Run the app: `npm start`
2. Register with email: **thara@gmail.com**
3. Password: **abbu007**
4. The app automatically assigns admin role to this email

## Firestore Collections Structure

The app will automatically create these collections:

- `users` - User profiles
- `products` - Product catalog
- `categories` - Product categories
- `cart` - Shopping carts
- `favorites` - User favorites
- `orders` - Orders
- `orderHistory` - Completed orders
- `ratings` - Product ratings
- `banners` - Homepage banners
- `coupons` - Discount coupons

## Security Rules

The `firestore.rules` file contains all necessary security rules. Deploy them using:

```bash
firebase deploy --only firestore:rules
```

## Troubleshooting

**Permission Denied Error:**
- Make sure Firestore rules are deployed
- Check if user is authenticated
- Verify admin role for admin operations

**Authentication Error:**
- Check Firebase config in `src/firebase.js`
- Verify authentication methods are enabled
- Check authorized domains in Firebase Console

---

✅ Firebase setup complete! You can now use the app.
