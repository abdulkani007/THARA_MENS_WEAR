# ✅ Frontend API Configuration - FIXED

## Current Configuration

Your frontend is **already configured** to use the production backend URL!

### 1. API Configuration File

**File: `src/config/api.js`**
```javascript
// API Base URL Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://thara-mens-wear.onrender.com';

// API Endpoints
export const API_ENDPOINTS = {
  // Image endpoints
  UPLOAD_IMAGE: `${API_BASE_URL}/api/upload-image`,
  GET_IMAGE: (id) => `${API_BASE_URL}/api/images/${id}`,
  DELETE_IMAGE: (id) => `${API_BASE_URL}/api/images/${id}`,
  DELETE_PRODUCT_IMAGES: (productId) => `${API_BASE_URL}/api/images/product/${productId}`,
  GET_ALL_IMAGES: `${API_BASE_URL}/api/images`,
  
  // Base API
  API: `${API_BASE_URL}/api`
};

export default API_BASE_URL;
```

### 2. Environment Variables

**File: `.env`**
```
REACT_APP_API_URL=https://thara-mens-wear.onrender.com
```

**File: `.env.production`**
```
REACT_APP_API_URL=https://thara-mens-wear.onrender.com
```

**File: `.env.local` (for local development - create this)**
```
REACT_APP_API_URL=http://localhost:5000
```

## 📝 How to Use in Your React Components

### Example 1: Display Product Image

```javascript
import { API_BASE_URL } from '../config/api';

const ProductCard = ({ product }) => {
  return (
    <div>
      <img 
        src={`${API_BASE_URL}/api/images/${product.imageId}`}
        alt={product.name}
      />
    </div>
  );
};
```

### Example 2: Display Image from URL

```javascript
import { API_BASE_URL } from '../config/api';

const ProductImage = ({ imageUrl }) => {
  // If imageUrl already contains full URL, use it directly
  // Otherwise, construct the full URL
  const fullUrl = imageUrl.startsWith('http') 
    ? imageUrl 
    : `${API_BASE_URL}${imageUrl}`;
  
  return <img src={fullUrl} alt="Product" />;
};
```

### Example 3: Upload Image

```javascript
import { API_ENDPOINTS } from '../config/api';

const uploadImage = async (file, productId) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('productId', productId);

  const response = await fetch(API_ENDPOINTS.UPLOAD_IMAGE, {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  return data.imageUrl; // Returns: https://thara-mens-wear.onrender.com/api/images/...
};
```

### Example 4: Fetch All Images

```javascript
import { API_ENDPOINTS } from '../config/api';

const fetchImages = async () => {
  const response = await fetch(API_ENDPOINTS.GET_ALL_IMAGES);
  const data = await response.json();
  return data.images;
};
```

### Example 5: Using with Axios

```javascript
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

// Upload image
const uploadImage = async (file, productId) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('productId', productId);

  const response = await axios.post(API_ENDPOINTS.UPLOAD_IMAGE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data.imageUrl;
};

// Fetch data
const fetchProducts = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/products`);
  return response.data;
};
```

### Example 6: Banner Component

```javascript
import { API_BASE_URL } from '../config/api';

const Banner = ({ banner }) => {
  // Banner imageURL can be:
  // 1. Full external URL: https://example.com/image.jpg
  // 2. MongoDB image ID: /api/images/65f8a9b2c3d4e5f6g7h8i9j0
  // 3. Relative path: /api/images/...
  
  const getImageUrl = (url) => {
    if (!url) return '/placeholder.png';
    if (url.startsWith('http')) return url; // External URL
    if (url.startsWith('/api')) return `${API_BASE_URL}${url}`; // Relative path
    return `${API_BASE_URL}/api/images/${url}`; // Image ID
  };

  return (
    <img 
      src={getImageUrl(banner.imageURL)} 
      alt={banner.title}
      style={{ width: '100%', objectFit: 'cover' }}
    />
  );
};
```

### Example 7: Product Card with Multiple Images

```javascript
import { API_BASE_URL } from '../config/api';

const ProductCard = ({ product }) => {
  const getImageUrl = (url) => {
    if (!url) return '/placeholder-product.png';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/api')) return `${API_BASE_URL}${url}`;
    return url;
  };

  const images = product.images?.length > 0 
    ? product.images.map(getImageUrl)
    : ['/placeholder-product.png'];

  return (
    <div className="product-card">
      <img 
        src={images[0]} 
        alt={product.name}
        onError={(e) => { e.target.src = '/placeholder-product.png'; }}
      />
    </div>
  );
};
```

## 🚀 Vercel Deployment

### Step 1: Set Environment Variable

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to: Settings → Environment Variables
4. Add:
   ```
   Name: REACT_APP_API_URL
   Value: https://thara-mens-wear.onrender.com
   Environments: ✓ Production ✓ Preview ✓ Development
   ```

### Step 2: Redeploy

```bash
# Option 1: Git push (auto-deploy)
git add .
git commit -m "Ensure API URL configuration"
git push origin main

# Option 2: Vercel CLI
vercel --prod
```

### Step 3: Verify

Open browser console on deployed site:
```javascript
console.log('API URL:', process.env.REACT_APP_API_URL);
```

Should show: `https://thara-mens-wear.onrender.com`

## 🧪 Testing

### Test 1: Check Environment Variable
Add temporary console log in your component:
```javascript
console.log('API_BASE_URL:', API_BASE_URL);
```

### Test 2: Check Image URLs
Inspect image elements in browser DevTools:
```html
<!-- Should be: -->
<img src="https://thara-mens-wear.onrender.com/api/images/65f8a9b2c3d4e5f6g7h8i9j0">

<!-- NOT: -->
<img src="http://localhost:5000/api/images/65f8a9b2c3d4e5f6g7h8i9j0">
```

### Test 3: Network Tab
Open DevTools → Network tab:
- All API requests should go to `https://thara-mens-wear.onrender.com`
- No requests to `localhost:5000`
- No Mixed Content errors

## 🔧 Common Issues & Solutions

### Issue 1: Images still loading from localhost

**Cause:** Environment variable not set on Vercel

**Solution:**
1. Set `REACT_APP_API_URL` on Vercel
2. Redeploy frontend
3. Clear browser cache

### Issue 2: Mixed Content errors

**Cause:** HTTP requests on HTTPS site

**Solution:**
- Ensure `REACT_APP_API_URL` uses `https://` not `http://`
- Backend must be deployed with HTTPS (Render provides this)

### Issue 3: Images not loading at all

**Cause:** Backend not running or CORS issue

**Solution:**
1. Test backend: `curl https://thara-mens-wear.onrender.com/`
2. Check backend CORS is enabled (already done)
3. Check Render logs for errors

### Issue 4: Environment variable not working

**Cause:** Variable name doesn't start with `REACT_APP_`

**Solution:**
- Must use `REACT_APP_` prefix for Create React App
- Rebuild after changing env vars

## ✅ Verification Checklist

- [ ] `src/config/api.js` exists and exports `API_BASE_URL`
- [ ] `.env` contains `REACT_APP_API_URL=https://thara-mens-wear.onrender.com`
- [ ] `.env.production` contains same URL
- [ ] All components import from `src/config/api.js`
- [ ] No hardcoded `localhost:5000` in code
- [ ] Vercel environment variable set
- [ ] Frontend redeployed after setting env var
- [ ] Images load with correct URL in browser
- [ ] No Mixed Content errors in console
- [ ] Network tab shows requests to production backend

## 🎯 Summary

Your frontend is **already configured correctly**! 

Just ensure:
1. ✅ `REACT_APP_API_URL` is set on Vercel
2. ✅ Frontend is redeployed
3. ✅ All components use `API_BASE_URL` from config

No code changes needed - just deployment configuration!
