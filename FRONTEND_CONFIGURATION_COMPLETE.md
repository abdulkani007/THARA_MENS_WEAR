# ✅ FRONTEND API CONFIGURATION - COMPLETE

## 📁 Project Structure Confirmed

- **Frontend:** `src/` (React - Deployed on Vercel)
- **Backend:** `server/` and `backend/` (Node.js - Deployed on Render)
- **Backend URL:** https://thara-mens-wear.onrender.com

## ✅ FRONTEND ALREADY FIXED

Your frontend code is **already configured correctly**! All API calls use the centralized configuration.

### 1. API Configuration File

**File: `src/config/api.js`** ✅ EXISTS
```javascript
// API Base URL Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://thara-mens-wear.onrender.com';
export const API_URL = API_BASE_URL; // Alias for simpler usage

// API Endpoints
export const API_ENDPOINTS = {
  UPLOAD_IMAGE: `${API_BASE_URL}/api/upload-image`,
  GET_IMAGE: (id) => `${API_BASE_URL}/api/images/${id}`,
  DELETE_IMAGE: (id) => `${API_BASE_URL}/api/images/${id}`,
  DELETE_PRODUCT_IMAGES: (productId) => `${API_BASE_URL}/api/images/product/${productId}`,
  GET_ALL_IMAGES: `${API_BASE_URL}/api/images`,
  API: `${API_BASE_URL}/api`
};

export default API_BASE_URL;
```

### 2. Service Files Already Using Config

**`src/services/imageService.js`** ✅ CORRECT
```javascript
import { API_ENDPOINTS } from '../config/api';

export const uploadImageToMongoDB = async (file, productId, productName, fileName) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('productId', productId);
  
  const response = await axios.post(API_ENDPOINTS.UPLOAD_IMAGE, formData);
  return response.data.imageUrl;
};

export const getAllImages = async () => {
  const response = await axios.get(API_ENDPOINTS.GET_ALL_IMAGES);
  return response.data.images;
};
```

**`src/services/productService.js`** ✅ Uses Firestore (no API calls)

**`src/services/orderService.js`** ✅ Uses Firestore (no API calls)

**`src/services/couponService.js`** ✅ Uses Firestore (no API calls)

## 📝 How to Use in Components

### Option 1: Using API_URL (Simple)
```javascript
import { API_URL } from '../config/api';

// Display image
<img src={`${API_URL}/api/images/${imageId}`} alt="Product" />

// Fetch data
fetch(`${API_URL}/api/products`)
```

### Option 2: Using API_BASE_URL
```javascript
import API_BASE_URL from '../config/api';

<img src={`${API_BASE_URL}/api/images/${imageId}`} alt="Product" />
```

### Option 3: Using API_ENDPOINTS (Recommended)
```javascript
import { API_ENDPOINTS } from '../config/api';

// Get image URL
const imageUrl = API_ENDPOINTS.GET_IMAGE(imageId);
<img src={imageUrl} alt="Product" />

// Upload image
await fetch(API_ENDPOINTS.UPLOAD_IMAGE, {
  method: 'POST',
  body: formData
});
```

## 🔧 Environment Variables

### Production (`.env`)
```
REACT_APP_API_URL=https://thara-mens-wear.onrender.com
```

### Production (`.env.production`)
```
REACT_APP_API_URL=https://thara-mens-wear.onrender.com
```

### Local Development (`.env.local`) - Create this file
```
REACT_APP_API_URL=http://localhost:5000
```

## 🚀 Vercel Deployment

### CRITICAL: Set Environment Variable on Vercel

1. Go to: https://vercel.com/dashboard
2. Select: **THARA** project
3. Click: **Settings** → **Environment Variables**
4. Add:
   ```
   Name: REACT_APP_API_URL
   Value: https://thara-mens-wear.onrender.com
   Environments: ✓ Production ✓ Preview ✓ Development
   ```
5. Click: **Save**
6. **Redeploy:**
   ```bash
   vercel --prod
   ```

## ✅ Verification Checklist

### Before Deployment:
- [x] `src/config/api.js` exists with correct URL
- [x] `src/services/imageService.js` uses `API_ENDPOINTS`
- [x] `.env` has `REACT_APP_API_URL`
- [x] `.env.production` has `REACT_APP_API_URL`
- [x] No hardcoded `localhost:5000` in frontend code

### After Deployment:
- [ ] Vercel environment variable `REACT_APP_API_URL` is set
- [ ] Frontend redeployed after setting env var
- [ ] Test: Open browser console, check `process.env.REACT_APP_API_URL`
- [ ] Test: Inspect image URLs (should be `https://thara-mens-wear.onrender.com/api/images/...`)
- [ ] Test: Check Network tab (no `localhost:5000` requests)
- [ ] Test: No Mixed Content errors in console
- [ ] Test: Images load correctly on mobile and desktop

## 🧪 Testing

### Test 1: Check Environment Variable
Open browser console on deployed site:
```javascript
console.log('API URL:', process.env.REACT_APP_API_URL);
// Expected: https://thara-mens-wear.onrender.com
```

### Test 2: Check Image URLs
Inspect any image element:
```html
<!-- ✅ Correct: -->
<img src="https://thara-mens-wear.onrender.com/api/images/65f8a9b2c3d4e5f6g7h8i9j0">

<!-- ❌ Wrong: -->
<img src="http://localhost:5000/api/images/65f8a9b2c3d4e5f6g7h8i9j0">
```

### Test 3: Network Tab
Open DevTools → Network:
- All API requests should go to `https://thara-mens-wear.onrender.com`
- No requests to `localhost:5000`
- Status codes should be 200 OK
- No CORS errors

### Test 4: Upload Image
1. Go to admin panel
2. Upload a product image
3. Check the returned URL format
4. Verify image displays correctly

## 🐛 Troubleshooting

### Issue: Images still loading from localhost

**Cause:** Vercel environment variable not set

**Solution:**
1. Set `REACT_APP_API_URL` on Vercel dashboard
2. Redeploy frontend
3. Clear browser cache (Ctrl+Shift+R)
4. Test in incognito mode

### Issue: Mixed Content errors

**Cause:** HTTP requests on HTTPS site

**Solution:**
- Ensure `REACT_APP_API_URL` uses `https://` not `http://`
- Backend must be deployed with HTTPS (Render provides this automatically)

### Issue: Environment variable not working

**Cause:** Variable not starting with `REACT_APP_`

**Solution:**
- Must use `REACT_APP_` prefix for Create React App
- Rebuild after changing environment variables
- Restart dev server for local changes

### Issue: 404 on API requests

**Cause:** Backend not running or incorrect URL

**Solution:**
1. Test backend: `curl https://thara-mens-wear.onrender.com/`
2. Should return: `THARA backend running`
3. Check Render dashboard for backend status
4. Check Render logs for errors

## 📋 Summary

### ✅ What's Already Done:
1. ✅ `src/config/api.js` created with production URL
2. ✅ `API_URL` and `API_BASE_URL` exported
3. ✅ `API_ENDPOINTS` configured for all routes
4. ✅ `src/services/imageService.js` uses centralized config
5. ✅ Environment variables set in `.env` and `.env.production`
6. ✅ No hardcoded localhost URLs in frontend code

### 🎯 What You Need to Do:
1. ⚠️ Set `REACT_APP_API_URL` on Vercel dashboard
2. ⚠️ Redeploy frontend on Vercel
3. ⚠️ Test on deployed site
4. ⚠️ Verify images load correctly

### 🎉 Expected Result:
- ✅ All API calls use `https://thara-mens-wear.onrender.com`
- ✅ Images load from production backend
- ✅ No localhost references
- ✅ No Mixed Content errors
- ✅ Works on mobile and desktop
- ✅ Works in development and production

## 🚀 Deploy Now!

```bash
# Ensure environment variable is set on Vercel, then:
vercel --prod
```

Your frontend is ready for production! 🎉
