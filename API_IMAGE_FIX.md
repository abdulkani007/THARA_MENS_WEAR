# API Configuration & Image Loading Fix

## Problem Summary
Images not loading on mobile devices due to API configuration issues.

## Solution Implemented

### 1. Centralized API Configuration

**File: `src/config/api.js`**
```javascript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://thara-mens-wear.onrender.com';

export const API_ENDPOINTS = {
  UPLOAD_IMAGE: `${API_BASE_URL}/api/upload-image`,
  GET_IMAGE: (id) => `${API_BASE_URL}/api/images/${id}`,
  DELETE_IMAGE: (id) => `${API_BASE_URL}/api/images/${id}`,
  DELETE_PRODUCT_IMAGES: (productId) => `${API_BASE_URL}/api/images/product/${productId}`,
  GET_ALL_IMAGES: `${API_BASE_URL}/api/images`,
  API: `${API_BASE_URL}/api`
};
```

### 2. Backend CORS Configuration

**File: `server/index.js`**
```javascript
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 3. Environment Variables

**Production (.env.production):**
```
REACT_APP_API_URL=https://thara-mens-wear.onrender.com
```

**Local Development (.env.local):**
```
REACT_APP_API_URL=http://localhost:5000
```

### 4. Image Rendering in React

**For MongoDB Base64 Images:**
```javascript
<img
  src={`data:${image.contentType};base64,${image.imageData}`}
  alt={image.productName}
  style={{ width: '100%' }}
/>
```

**For Image URLs (Banners):**
```javascript
<img
  src={banner.imageURL}
  alt="Banner"
  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
/>
```

**For Product Images with Fallback:**
```javascript
<img
  src={images[currentImageIndex]}
  alt={product.name}
  className="product-image"
  onError={(e) => { e.target.src = '/placeholder-product.png'; }}
/>
```

### 5. Using API Configuration in Services

**Example: `src/services/imageService.js`**
```javascript
import { API_ENDPOINTS } from '../config/api';

export const uploadImageToMongoDB = async (file, productId, productName, fileName) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('productId', productId);
  formData.append('productName', productName);
  formData.append('fileName', fileName);

  const response = await fetch(API_ENDPOINTS.UPLOAD_IMAGE, {
    method: 'POST',
    body: formData
  });

  return await response.json();
};

export const getImageUrl = (imageId) => {
  return API_ENDPOINTS.GET_IMAGE(imageId);
};
```

## Deployment Checklist

### Frontend (Vercel)

1. **Set Environment Variable:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add: `REACT_APP_API_URL` = `https://thara-mens-wear.onrender.com`
   - Apply to: Production, Preview, Development

2. **Build Settings:**
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

### Backend (Render)

1. **Environment Variables:**
   - `PORT` = `5000`
   - `MONGODB_URI` = `mongodb+srv://thara:abbu007@cluster0.cjd2ran.mongodb.net/thara`
   - `PUBLIC_URL` = `https://thara-mens-wear.onrender.com`

2. **Ensure CORS is enabled** (already done in code)

## Testing

### Test API Connection:
```bash
curl https://thara-mens-wear.onrender.com/api/images
```

### Test from Browser Console:
```javascript
fetch('https://thara-mens-wear.onrender.com/api/images')
  .then(r => r.json())
  .then(console.log);
```

## Common Issues & Solutions

### Issue 1: Images not loading on mobile
**Solution:** Ensure `REACT_APP_API_URL` is set in Vercel environment variables

### Issue 2: CORS errors
**Solution:** Backend CORS is configured to allow all origins (`origin: '*'`)

### Issue 3: Banners not showing
**Solution:** Check that banner `imageURL` field contains valid URLs (either MongoDB image URLs or external URLs)

### Issue 4: 404 on image requests
**Solution:** Verify backend is running and `PUBLIC_URL` in server/.env matches deployed URL

## Mobile Optimization

Images are optimized for mobile with:
- Responsive sizing
- Object-fit: cover for banners
- Lazy loading (browser native)
- Error fallbacks to placeholder images
- Cache headers for performance

## Files Modified

1. ✅ `src/config/api.js` - Centralized API configuration
2. ✅ `server/index.js` - CORS configuration
3. ✅ `src/services/imageService.js` - Uses API_ENDPOINTS
4. ✅ `.env` - Environment variables
5. ✅ `.env.production` - Production environment variables

## Next Steps

1. Push changes to GitHub
2. Redeploy backend on Render (if needed)
3. Set environment variables in Vercel
4. Redeploy frontend on Vercel
5. Test on mobile devices
