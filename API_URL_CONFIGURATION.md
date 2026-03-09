# API URL Configuration - THARA Frontend

## ✅ Changes Made

### **Centralized API Configuration**
Created `src/config/api.js`:
```javascript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://thara-mens-wear.onrender.com';
```

### **Updated Files:**
1. ✅ `src/services/imageService.js` - Uses `API_ENDPOINTS`
2. ✅ `src/pages/admin/ImageGallery.js` - Uses `API_BASE_URL`
3. ✅ `.env.production` - Production backend URL
4. ✅ `.env.example` - Template for environment variables

## 🔧 Environment Configuration

### **Production (Default):**
```env
REACT_APP_API_URL=https://thara-mens-wear.onrender.com
```

### **Local Development:**
Create `.env.local`:
```env
REACT_APP_API_URL=http://localhost:5000
```

## 📝 How It Works

### **Before:**
```javascript
const API_URL = 'http://localhost:5000/api';
axios.get(`${API_URL}/products`);
```

### **After:**
```javascript
import { API_BASE_URL } from '../config/api';
axios.get(`${API_BASE_URL}/api/products`);
```

## 🚀 Deployment Steps

### **1. Update Backend PUBLIC_URL**
In `server/.env`:
```env
PUBLIC_URL=https://thara-mens-wear.onrender.com
```

### **2. Restart Backend**
```bash
cd server
npm start
```

### **3. Build Frontend**
```bash
npm run build
```

### **4. Deploy to Vercel**
```bash
vercel --prod
```

Or set environment variable in Vercel dashboard:
- Key: `REACT_APP_API_URL`
- Value: `https://thara-mens-wear.onrender.com`

## 🔍 Testing

### **Local Testing:**
1. Create `.env.local`:
```env
REACT_APP_API_URL=http://localhost:5000
```

2. Start backend:
```bash
cd server
npm start
```

3. Start frontend:
```bash
npm start
```

### **Production Testing:**
1. Build:
```bash
npm run build
```

2. Test build:
```bash
npx serve -s build
```

3. Check API calls in browser console:
- Should see: `https://thara-mens-wear.onrender.com/api/...`

## 📊 API Endpoints

All endpoints now use the centralized configuration:

```javascript
import { API_BASE_URL, API_ENDPOINTS } from './config/api';

// Image upload
axios.post(API_ENDPOINTS.UPLOAD_IMAGE, formData);

// Get image
<img src={API_ENDPOINTS.GET_IMAGE(imageId)} />

// Get all images
axios.get(API_ENDPOINTS.GET_ALL_IMAGES);

// Custom endpoint
axios.get(`${API_BASE_URL}/api/products`);
```

## ⚙️ Environment Variables Priority

1. `.env.local` (local development - not committed)
2. `.env.production` (production build)
3. `.env` (default - not recommended)
4. Hardcoded fallback in `api.js`

## 🔒 Security Notes

- Never commit `.env.local` to Git
- `.env.production` can be committed (no secrets)
- Backend URL is public, not a secret
- Keep Firebase keys in separate env vars

## ✅ Verification Checklist

- [x] `src/config/api.js` created
- [x] `imageService.js` updated
- [x] `ImageGallery.js` updated
- [x] `.env.production` created
- [x] `.env.example` created
- [ ] Backend `PUBLIC_URL` updated
- [ ] Backend restarted
- [ ] Frontend rebuilt
- [ ] Deployed to Vercel
- [ ] Tested in production

## 🐛 Troubleshooting

### **Images not loading:**
1. Check backend `PUBLIC_URL` in `server/.env`
2. Restart backend
3. Clear browser cache
4. Check browser console for API errors

### **API calls failing:**
1. Verify backend is running: `https://thara-mens-wear.onrender.com/api/images`
2. Check CORS settings in backend
3. Verify environment variable: `console.log(process.env.REACT_APP_API_URL)`

### **Local development not working:**
1. Create `.env.local` with `REACT_APP_API_URL=http://localhost:5000`
2. Restart React dev server
3. Ensure backend is running on port 5000

---

**Your frontend now uses the deployed backend URL!** 🚀

**Next Steps:**
1. Update backend `PUBLIC_URL` to `https://thara-mens-wear.onrender.com`
2. Restart backend
3. Build and deploy frontend
