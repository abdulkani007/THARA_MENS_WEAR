# 🚀 QUICK DEPLOYMENT GUIDE - THARA

## ✅ CHANGES COMPLETED

1. **API Configuration** - Centralized in `src/config/api.js`
2. **Backend CORS** - Enabled for all origins in `server/index.js`
3. **Environment Files** - Created `.env` with production URL

## 🎯 IMMEDIATE ACTIONS REQUIRED

### 1. Set Vercel Environment Variable (CRITICAL)

**Go to:** https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Add:**
```
Name: REACT_APP_API_URL
Value: https://thara-mens-wear.onrender.com
Environments: ✓ Production ✓ Preview ✓ Development
```

### 2. Redeploy Frontend

**Option A - Vercel CLI:**
```bash
vercel --prod
```

**Option B - Git Push:**
```bash
git add .
git commit -m "Fix API and CORS configuration"
git push origin main
```

### 3. Redeploy Backend (If Needed)

If you updated `server/index.js` CORS:
- Go to Render Dashboard
- Click "Manual Deploy" → "Deploy latest commit"

## 🧪 TEST AFTER DEPLOYMENT

### Browser Console Test:
```javascript
fetch('https://thara-mens-wear.onrender.com/api/images')
  .then(r => r.json())
  .then(console.log);
```

### Check:
- ✓ Banners load on landing page
- ✓ Product images load on home page
- ✓ Images work on mobile
- ✓ No CORS errors in console

## 📋 FILES MODIFIED

```
✅ src/config/api.js          - API configuration
✅ server/index.js             - CORS configuration
✅ .env                        - Environment variables
✅ API_FIX_CODE_SNIPPETS.md   - Complete documentation
```

## 🔗 IMPORTANT URLS

- **Frontend:** Your Vercel URL
- **Backend:** https://thara-mens-wear.onrender.com
- **MongoDB:** Atlas Cluster0

## ⚡ QUICK FIXES

### Images not loading?
1. Check Vercel env var is set
2. Redeploy frontend
3. Clear browser cache
4. Test in incognito mode

### CORS errors?
1. Backend CORS is already fixed
2. Redeploy backend on Render
3. Wait 2-3 minutes for deployment

### 404 errors?
1. Check backend is running on Render
2. Test: `curl https://thara-mens-wear.onrender.com/api/images`
3. Check MongoDB connection

## 📱 MOBILE TEST CHECKLIST

- [ ] Open site on mobile browser
- [ ] Landing page banners load
- [ ] Home page products load
- [ ] Product details images load
- [ ] No console errors
- [ ] Images are responsive

## ✨ DONE!

Your API configuration is now centralized and mobile-ready. Just set the Vercel environment variable and redeploy!
