# Business Info Setup Instructions

## Initial Firestore Setup

To set up the business information in Firestore, follow these steps:

### Option 1: Using Firebase Console (Recommended)

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your THARA project
3. Go to **Firestore Database**
4. Click **"Start collection"**
5. Collection ID: `settings`
6. Document ID: `businessInfo`
7. Add these fields:

```
address (string): "Veppur Near Bus Stand"
phone1 (string): "8838810060"
phone2 (string): "9789185062"
instagram (string): "https://www.instagram.com/thara_mens_new?igsh=MXBncGRuYm9odDM1dg=="
```

8. Click **Save**

### Option 2: Using Browser Console

1. Open your React app in browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Paste this code:

```javascript
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const setupBusinessInfo = async () => {
  await setDoc(doc(db, 'settings', 'businessInfo'), {
    address: 'Veppur Near Bus Stand',
    phone1: '8838810060',
    phone2: '9789185062',
    instagram: 'https://www.instagram.com/thara_mens_new?igsh=MXBncGRuYm9odDM1dg=='
  });
  console.log('Business info setup complete!');
};

setupBusinessInfo();
```

## How It Works

1. **Admin Profile**: Admin can edit business info (address, phones, Instagram)
2. **Firestore Storage**: Data saved in `settings/businessInfo` document
3. **Footer Component**: Automatically loads and displays updated info
4. **Real-time Updates**: Changes reflect across all pages immediately

## Features

✅ Admin can edit footer information from Profile page
✅ Logo displayed in admin profile
✅ Address, phone numbers, Instagram URL editable
✅ Changes update across all footers (Landing, User pages)
✅ Data persists in Firestore
✅ Fallback to default values if Firestore data not available
