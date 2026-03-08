# THARA Men's Wear - Vercel Deployment Guide

## Prerequisites
- Vercel account (free)
- Firebase project configured
- MongoDB backend deployed separately

## Step 1: Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

## Step 2: Prepare for Vercel

### Create `vercel.json` in project root:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Step 3: Environment Variables

### In Vercel Dashboard, add these:
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`
- `REACT_APP_BACKEND_URL` (MongoDB backend URL)

## Step 4: Deploy to Vercel

### Option A: Using Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

### Option B: Using GitHub
1. Push code to GitHub
2. Go to vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Configure build settings:
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
6. Add environment variables
7. Click "Deploy"

## Step 5: MongoDB Backend Deployment

### Deploy backend to Render/Railway/Heroku:

**For Render.com (Free):**
1. Create new Web Service
2. Connect GitHub repo (server folder)
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add environment variable: `MONGODB_URI`
6. Copy the deployed URL
7. Update `REACT_APP_BACKEND_URL` in Vercel

**For Railway.app (Free):**
1. New Project → Deploy from GitHub
2. Select server folder
3. Add `MONGODB_URI` variable
4. Deploy
5. Copy URL to Vercel env

## Step 6: Update Firebase Config

### In `src/firebase.js`, ensure it reads from env:
```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

## Step 7: Update Image Upload Service

### In components that upload images, update backend URL:
```javascript
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
```

## Step 8: Test Deployment

1. Visit your Vercel URL
2. Test login/register
3. Test product browsing
4. Test cart/checkout
5. Test admin panel
6. Test image uploads
7. Test on mobile devices

## Common Issues & Fixes

### Issue 1: Images not loading
**Fix:** Ensure MongoDB backend is deployed and `REACT_APP_BACKEND_URL` is set correctly

### Issue 2: Firebase auth not working
**Fix:** Add Vercel domain to Firebase authorized domains:
- Firebase Console → Authentication → Settings → Authorized domains
- Add: `your-app.vercel.app`

### Issue 3: Routing not working
**Fix:** Ensure `vercel.json` has the rewrite rule for SPA routing

### Issue 4: Environment variables not working
**Fix:** Redeploy after adding env vars in Vercel dashboard

## MongoDB Atlas Setup (Free)

1. Go to mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist all IPs: `0.0.0.0/0`
5. Get connection string
6. Use in backend `MONGODB_URI`

## Performance Optimization

### Add to `package.json`:
```json
{
  "scripts": {
    "build": "react-scripts build && echo '/* /index.html 200' > build/_redirects"
  }
}
```

## Security Checklist

- ✅ Firestore rules deployed
- ✅ Environment variables set
- ✅ Firebase authorized domains configured
- ✅ MongoDB IP whitelist configured
- ✅ HTTPS enabled (automatic on Vercel)
- ✅ Security headers in vercel.json

## Monitoring

### Vercel Dashboard shows:
- Deployment status
- Build logs
- Analytics
- Error tracking

### Firebase Console shows:
- Authentication users
- Firestore data
- Usage metrics

## Custom Domain (Optional)

1. Buy domain (Namecheap, GoDaddy)
2. In Vercel: Settings → Domains
3. Add custom domain
4. Update DNS records as shown
5. Wait for SSL certificate (automatic)

## Continuous Deployment

Every push to main branch auto-deploys to Vercel!

## Cost Breakdown

- **Vercel**: Free (Hobby plan)
- **Firebase**: Free (Spark plan) - 50K reads/day
- **MongoDB Atlas**: Free (512MB storage)
- **Backend Hosting**: Free (Render/Railway)

**Total: $0/month** for small-medium traffic

## Support

If deployment fails:
1. Check Vercel build logs
2. Check browser console
3. Verify all env variables
4. Test Firebase connection
5. Test MongoDB connection

---

**Your THARA Men's Wear app is now live! 🚀**
