# Public Access Setup Guide

## Issue 1: Banners Not Showing on Phone

### Problem
Images are stored in MongoDB and served from `localhost:5000`, which is only accessible on your computer.

### Solution

#### Step 1: Update Backend .env File
Replace `YOUR_PUBLIC_IP` with your actual public IP or domain:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/thara
PUBLIC_URL=http://YOUR_PUBLIC_IP:5000
```

**Examples:**
- If using port forwarding: `PUBLIC_URL=http://123.45.67.89:5000`
- If using ngrok: `PUBLIC_URL=https://abc123.ngrok.io`
- If using domain: `PUBLIC_URL=https://api.tharawear.com`

#### Step 2: Restart Backend Server
```bash
cd server
npm start
```

#### Step 3: Update Existing Images (Optional)
If you already have banners/products with localhost URLs, you need to re-upload them or update the URLs in Firestore manually.

---

## Issue 2: Google Auth Not Working

### Problem
Firebase Google Authentication only works on authorized domains. Your public IP/domain is not authorized.

### Solution

#### Step 1: Get Your Public URL
Find your public IP or domain that you're using for port forwarding.

**Example URLs:**
- `http://123.45.67.89:3000`
- `https://abc123.ngrok.io`
- `https://tharawear.com`

#### Step 2: Add to Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **thara-e5576**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add your domain/IP:
   - For IP: `123.45.67.89` (without http:// or port)
   - For ngrok: `abc123.ngrok.io`
   - For domain: `tharawear.com`

#### Step 3: Test Google Login
Try logging in with Google from your phone. It should now work.

---

## Alternative: Use ngrok for Testing

### What is ngrok?
ngrok creates a secure tunnel to your localhost, giving you a public URL.

### Setup ngrok

1. **Install ngrok**
   - Download from: https://ngrok.com/download
   - Or use: `npm install -g ngrok`

2. **Start Backend Server**
   ```bash
   cd server
   npm start
   ```

3. **Start Frontend**
   ```bash
   npm start
   ```

4. **Create Tunnels**
   
   **Terminal 1 (Backend):**
   ```bash
   ngrok http 5000
   ```
   Copy the URL (e.g., `https://abc123.ngrok.io`)
   
   **Terminal 2 (Frontend):**
   ```bash
   ngrok http 3000
   ```
   Copy the URL (e.g., `https://xyz789.ngrok.io`)

5. **Update Configuration**
   
   **server/.env:**
   ```env
   PUBLIC_URL=https://abc123.ngrok.io
   ```
   
   **Add to Firebase Authorized Domains:**
   - `abc123.ngrok.io` (backend)
   - `xyz789.ngrok.io` (frontend)

6. **Access from Phone**
   Open `https://xyz789.ngrok.io` on your phone

---

## Production Deployment (Recommended)

For production, deploy to proper hosting:

### Backend Options:
1. **Railway** (Free tier available)
   - Deploy MongoDB + Express backend
   - Get permanent URL: `https://your-app.railway.app`

2. **Render** (Free tier available)
   - Deploy backend
   - Get URL: `https://your-app.onrender.com`

3. **Heroku** (Paid)
   - Deploy backend with MongoDB Atlas
   - Get URL: `https://your-app.herokuapp.com`

### Frontend Options:
1. **Vercel** (Free)
   - Deploy React app
   - Get URL: `https://thara.vercel.app`

2. **Netlify** (Free)
   - Deploy React app
   - Get URL: `https://thara.netlify.app`

3. **Firebase Hosting** (Free)
   - Deploy to Firebase
   - Get URL: `https://thara-e5576.web.app`

### After Deployment:
1. Update `PUBLIC_URL` in backend .env with production backend URL
2. Add production domains to Firebase Authorized Domains
3. Update CORS settings in backend to allow production frontend domain

---

## Quick Fix Checklist

### For Banners:
- [ ] Update `server/.env` with `PUBLIC_URL`
- [ ] Restart backend server
- [ ] Re-upload banners if needed

### For Google Auth:
- [ ] Get your public URL/IP
- [ ] Add to Firebase Authorized Domains
- [ ] Test login from phone

### For Testing:
- [ ] Use ngrok for temporary public URLs
- [ ] Update both backend and frontend URLs
- [ ] Add ngrok domains to Firebase

### For Production:
- [ ] Deploy backend to Railway/Render
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Update all URLs and domains
- [ ] Test thoroughly

---

## Troubleshooting

### Banners Still Not Showing?
1. Check browser console for errors
2. Verify `PUBLIC_URL` is correct in server/.env
3. Make sure backend server is accessible from phone
4. Check if MongoDB is running
5. Try re-uploading one banner to test

### Google Auth Still Not Working?
1. Check Firebase Console → Authentication → Authorized domains
2. Make sure domain is added WITHOUT `http://` or port
3. Clear browser cache on phone
4. Try incognito/private mode
5. Check browser console for Firebase errors

### Port Forwarding Issues?
1. Make sure router port forwarding is configured
2. Check firewall settings
3. Verify public IP is correct
4. Test backend URL in browser: `http://YOUR_IP:5000/api/images/test`

---

## Contact & Support

If issues persist:
1. Check browser console for errors
2. Check backend server logs
3. Verify all URLs are correct
4. Test on localhost first
5. Try ngrok for quick testing

---

**Last Updated:** 2024
