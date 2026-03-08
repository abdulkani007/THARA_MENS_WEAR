# THARA Deployment Checklist ✅

## Before Deployment

### 1. Firebase Setup
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Add Vercel domain to Firebase authorized domains
- [ ] Test Firebase authentication locally
- [ ] Verify Firestore collections exist

### 2. MongoDB Backend
- [ ] Deploy backend to Render/Railway/Heroku
- [ ] Set `MONGODB_URI` environment variable
- [ ] Test backend API endpoints
- [ ] Copy deployed backend URL

### 3. Code Preparation
- [ ] Ensure `vercel.json` exists in root
- [ ] Create `.env.example` file
- [ ] Update all hardcoded URLs to use env variables
- [ ] Test build locally: `npm run build`
- [ ] Check for console errors

## Vercel Deployment

### 4. Deploy to Vercel
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] Deploy: `vercel`
- [ ] Or connect GitHub repo to Vercel dashboard

### 5. Environment Variables (Add in Vercel Dashboard)
- [ ] `REACT_APP_FIREBASE_API_KEY`
- [ ] `REACT_APP_FIREBASE_AUTH_DOMAIN`
- [ ] `REACT_APP_FIREBASE_PROJECT_ID`
- [ ] `REACT_APP_FIREBASE_STORAGE_BUCKET`
- [ ] `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `REACT_APP_FIREBASE_APP_ID`
- [ ] `REACT_APP_BACKEND_URL` (MongoDB backend URL)

### 6. Post-Deployment Testing
- [ ] Visit deployed URL
- [ ] Test user registration
- [ ] Test user login
- [ ] Test product browsing
- [ ] Test add to cart
- [ ] Test checkout flow
- [ ] Test admin login (thara@gmail.com / abbu007)
- [ ] Test admin product management
- [ ] Test image uploads
- [ ] Test on mobile devices
- [ ] Test on different browsers

### 7. Firebase Configuration
- [ ] Go to Firebase Console → Authentication → Settings
- [ ] Add authorized domain: `your-app.vercel.app`
- [ ] Verify authentication works on deployed site

### 8. MongoDB Atlas (if using)
- [ ] Create free cluster at mongodb.com/cloud/atlas
- [ ] Create database user
- [ ] Whitelist IP: `0.0.0.0/0` (allow all)
- [ ] Get connection string
- [ ] Update backend `MONGODB_URI`

## Quick Deploy Commands

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Build locally to test
npm run build

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

## Troubleshooting

### If images don't load:
1. Check backend is deployed
2. Verify `REACT_APP_BACKEND_URL` is correct
3. Check backend logs

### If auth doesn't work:
1. Add Vercel domain to Firebase authorized domains
2. Check Firebase config in Vercel env vars
3. Clear browser cache

### If routing breaks:
1. Ensure `vercel.json` has rewrite rule
2. Redeploy

### If build fails:
1. Check Vercel build logs
2. Test `npm run build` locally
3. Fix any errors shown

## Success Indicators

✅ Site loads at Vercel URL
✅ Can register new user
✅ Can login
✅ Products display correctly
✅ Images load properly
✅ Cart works
✅ Checkout completes
✅ Admin panel accessible
✅ Mobile responsive
✅ No console errors

## Your Deployment URLs

- **Frontend (Vercel)**: https://your-app.vercel.app
- **Backend (Render)**: https://your-backend.onrender.com
- **Firebase Console**: https://console.firebase.google.com
- **MongoDB Atlas**: https://cloud.mongodb.com

---

**Estimated Deployment Time: 15-30 minutes**

**Cost: $0/month** (using free tiers)

🚀 **Ready to deploy THARA Men's Wear!**
