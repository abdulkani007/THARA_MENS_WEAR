# THARA - API & Image Loading Fix - Code Snippets

## ✅ COMPLETED CHANGES

### 1. API Configuration File (UPDATED)

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

### 2. Backend CORS Configuration (UPDATED)

**File: `server/index.js`**
```javascript
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const Image = require('./models/Image');

const app = express();

// CORS Configuration - Allow all origins for deployed frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ... rest of the code
```

### 3. Environment Variables (CREATED)

**File: `.env`**
```
REACT_APP_API_URL=https://thara-mens-wear.onrender.com
```

**File: `.env.production`** (Already exists)
```
REACT_APP_API_URL=https://thara-mens-wear.onrender.com
```

**File: `.env.local`** (For local development - create manually)
```
REACT_APP_API_URL=http://localhost:5000
```

### 4. Backend Environment Variables

**File: `server/.env`** (Already configured)
```
PORT=5000
MONGODB_URI=mongodb+srv://thara:abbu007@cluster0.cjd2ran.mongodb.net/thara?retryWrites=true&w=majority&appName=Cluster0
PUBLIC_URL=https://thara-mens-wear.onrender.com
```

## 📝 HOW TO USE API CONFIG IN YOUR CODE

### Example 1: Image Service (Already Implemented)

**File: `src/services/imageService.js`**
```javascript
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

export const uploadImageToMongoDB = async (file, productId, productName = 'Product', fileName = null) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('productId', productId);
  formData.append('productName', productName);
  formData.append('fileName', fileName || file.name);

  const response = await axios.post(API_ENDPOINTS.UPLOAD_IMAGE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data.imageUrl;
};

export const getAllImages = async () => {
  const response = await axios.get(API_ENDPOINTS.GET_ALL_IMAGES);
  return response.data.images;
};
```

### Example 2: Fetching Data with Fetch API

```javascript
import { API_BASE_URL } from '../config/api';

// Fetch products
const fetchProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  const data = await response.json();
  return data;
};

// Fetch banners
const fetchBanners = async () => {
  const response = await fetch(`${API_BASE_URL}/api/banners`);
  const data = await response.json();
  return data;
};
```

### Example 3: Using Axios

```javascript
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Create order
const createOrder = async (orderData) => {
  const response = await axios.post(`${API_BASE_URL}/api/orders`, orderData);
  return response.data;
};

// Get user orders
const getUserOrders = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/api/orders/${userId}`);
  return response.data;
};
```

## 🖼️ IMAGE RENDERING EXAMPLES

### Example 1: MongoDB Base64 Images

```javascript
// For images stored in MongoDB as Base64
<img
  src={`data:${image.contentType};base64,${image.imageData}`}
  alt={image.productName}
  style={{ width: '100%', height: 'auto' }}
/>
```

### Example 2: Image URLs from MongoDB

```javascript
import { API_ENDPOINTS } from '../config/api';

// Product images stored as MongoDB IDs
const ProductImage = ({ imageId, alt }) => {
  return (
    <img
      src={API_ENDPOINTS.GET_IMAGE(imageId)}
      alt={alt}
      style={{ width: '100%', objectFit: 'cover' }}
      onError={(e) => { e.target.src = '/placeholder-product.png'; }}
    />
  );
};
```

### Example 3: Banner Images (Direct URLs)

```javascript
// Banners use direct imageURL field
const BannerSlider = ({ banners }) => {
  return (
    <div>
      {banners.map(banner => (
        <img
          key={banner.id}
          src={banner.imageURL}
          alt={banner.title}
          style={{ width: '100%', height: '400px', objectFit: 'cover' }}
        />
      ))}
    </div>
  );
};
```

### Example 4: Product Card with Multiple Images

```javascript
const ProductCard = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.imageURL 
    ? [product.imageURL] 
    : ['/placeholder-product.png'];

  return (
    <div className="product-card">
      <img
        src={images[currentImageIndex]}
        alt={product.name}
        className="product-image"
        onError={(e) => { e.target.src = '/placeholder-product.png'; }}
      />
    </div>
  );
};
```

## 🚀 DEPLOYMENT STEPS

### Step 1: Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select your project: THARA
3. Go to: Settings → Environment Variables
4. Add new variable:
   - **Name:** `REACT_APP_API_URL`
   - **Value:** `https://thara-mens-wear.onrender.com`
   - **Environments:** Production, Preview, Development
5. Click "Save"

### Step 2: Redeploy Frontend

```bash
# Option 1: Using Vercel CLI
vercel --prod

# Option 2: Using Git
git add .
git commit -m "Fix API configuration and CORS"
git push origin main
```

### Step 3: Verify Backend (Render)

1. Go to: https://dashboard.render.com
2. Select your backend service
3. Check Environment Variables:
   - `PORT` = `5000`
   - `MONGODB_URI` = `mongodb+srv://thara:abbu007@cluster0.cjd2ran.mongodb.net/thara`
   - `PUBLIC_URL` = `https://thara-mens-wear.onrender.com`
4. If you updated `server/index.js`, redeploy:
   - Click "Manual Deploy" → "Deploy latest commit"

## 🧪 TESTING

### Test 1: API Connection

Open browser console on your deployed site:
```javascript
fetch('https://thara-mens-wear.onrender.com/api/images')
  .then(r => r.json())
  .then(data => console.log('API Response:', data))
  .catch(err => console.error('API Error:', err));
```

### Test 2: Environment Variable

In your React app, add temporary console log:
```javascript
console.log('API URL:', process.env.REACT_APP_API_URL);
```

### Test 3: Image Loading

Check browser Network tab:
- Look for requests to `https://thara-mens-wear.onrender.com/api/images/*`
- Status should be 200 OK
- Response should contain image data

## ✅ VERIFICATION CHECKLIST

- [x] API config file created with centralized URLs
- [x] Backend CORS configured to allow all origins
- [x] Environment variables set in `.env` and `.env.production`
- [x] Image service uses API_ENDPOINTS
- [ ] Vercel environment variable `REACT_APP_API_URL` added
- [ ] Frontend redeployed on Vercel
- [ ] Backend redeployed on Render (if CORS was updated)
- [ ] Tested on mobile device
- [ ] Images loading correctly
- [ ] No CORS errors in console

## 🐛 TROUBLESHOOTING

### Issue: Images still not loading

**Check:**
1. Vercel environment variable is set correctly
2. Frontend was redeployed after setting env var
3. Backend is running (check Render logs)
4. CORS is enabled on backend

**Solution:**
```bash
# Rebuild and redeploy
npm run build
vercel --prod
```

### Issue: CORS errors

**Check backend logs on Render:**
- Look for CORS-related errors
- Verify `cors` package is installed

**Solution:**
```bash
cd server
npm install cors
```

### Issue: 404 on image requests

**Check:**
1. Backend `PUBLIC_URL` matches deployed URL
2. Image IDs are valid MongoDB ObjectIds
3. Images exist in MongoDB Atlas

**Test:**
```bash
curl https://thara-mens-wear.onrender.com/api/images
```

## 📱 MOBILE TESTING

Test on actual devices:
1. iPhone Safari
2. Android Chrome
3. iPad Safari
4. Android Tablet

Check:
- Banner images load
- Product images load
- Image carousel works
- No console errors
- Images are responsive

## 🎯 SUMMARY

**What was fixed:**
1. ✅ Centralized API configuration in `src/config/api.js`
2. ✅ Backend CORS enabled for all origins
3. ✅ Environment variables properly configured
4. ✅ Image service uses centralized config
5. ✅ All API calls use environment variable

**What you need to do:**
1. Set `REACT_APP_API_URL` in Vercel dashboard
2. Redeploy frontend on Vercel
3. Test on mobile devices

**Expected result:**
- All images load on desktop and mobile
- No CORS errors
- Fast image loading with caching
- Proper fallback to placeholder images
