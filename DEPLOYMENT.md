# Deployment Guide

## Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- MongoDB backend deployed (for production)
- Firebase project configured

## Deploy Frontend (React App)

### Option 1: Firebase Hosting

1. **Build the app**
```bash
npm run build
```

2. **Login to Firebase**
```bash
firebase login
```

3. **Initialize Firebase Hosting**
```bash
firebase init hosting
```

Select:
- Public directory: `build`
- Single-page app: `Yes`
- Overwrite index.html: `No`

4. **Deploy**
```bash
firebase deploy --only hosting
```

Your app will be live at: `https://your-project.firebaseapp.com`

### Option 2: Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
npm run build
vercel
```

Follow the prompts and your app will be deployed.

### Option 3: Netlify

1. Go to [netlify.com](https://www.netlify.com/)
2. Drag and drop the `build` folder
3. Or connect GitHub repository for auto-deploy

## Deploy Backend (MongoDB Server)

### Option 1: Railway

1. Go to [railway.app](https://railway.app/)
2. Create new project
3. Deploy from GitHub or upload `server` folder
4. Add environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `PORT`: 5000
5. Get deployment URL

### Option 2: Heroku

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Login and create app**
```bash
heroku login
heroku create thara-backend
```

3. **Deploy**
```bash
cd server
git init
heroku git:remote -a thara-backend
git add .
git commit -m "Deploy backend"
git push heroku master
```

4. **Set environment variables**
```bash
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
```

### Option 3: Vercel (Serverless)

1. Add `vercel.json` in server directory:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
```

2. Deploy:
```bash
cd server
vercel
```

## Update Frontend with Backend URL

After deploying backend, update `src/services/imageService.js`:

```javascript
const API_URL = 'https://your-backend-url.com/api';
```

Rebuild and redeploy frontend.

## Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## MongoDB Atlas Setup (Production)

1. Create free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist IP: `0.0.0.0/0` (allow from anywhere)
4. Get connection string
5. Update backend environment variable

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-url.com/api
```

### Backend (.env)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/thara
PORT=5000
```

## Post-Deployment Checklist

- [ ] Firebase Authentication enabled
- [ ] Firestore rules deployed
- [ ] MongoDB backend running
- [ ] Frontend can connect to backend
- [ ] Admin login works (thara@gmail.com)
- [ ] Image upload works
- [ ] Test product creation
- [ ] Test user registration
- [ ] Test order placement

## Custom Domain (Optional)

### Firebase Hosting

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow DNS configuration steps

### Vercel/Netlify

1. Go to project settings
2. Add custom domain
3. Update DNS records as instructed

---

✅ Deployment complete! Your THARA eCommerce platform is live!
