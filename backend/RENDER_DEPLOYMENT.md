# Backend Deployment Guide - THARA Men's Wear

## ✅ Code Fixed - Ready for Deployment

### Changes Implemented:

**1. Dynamic BASE_URL for Image URLs**
```javascript
const baseUrl = process.env.BASE_URL || 'https://thara-mens-wear.onrender.com';
res.json({ imageUrl: `${baseUrl}/api/images/${image._id}` });
```

**2. MongoDB Connection with Environment Variable**
```javascript
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

**3. Dynamic Port**
```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

**4. CORS Enabled for Vercel Frontend**
```javascript
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

## 🚀 Render Deployment Steps

### Step 1: Set Environment Variables on Render

1. Go to: https://dashboard.render.com
2. Select your backend service
3. Click: **Environment** tab
4. Add these variables:

```
MONGO_URI=mongodb+srv://thara:abbu007@cluster0.cjd2ran.mongodb.net/thara?retryWrites=true&w=majority&appName=Cluster0
BASE_URL=https://thara-mens-wear.onrender.com
PORT=5000
```

**Important:** 
- `PORT` is usually auto-set by Render, but you can add it for consistency
- `MONGO_URI` must match your MongoDB Atlas connection string
- `BASE_URL` must match your Render deployment URL

### Step 2: Deploy

**Option A - Auto Deploy (Recommended):**
```bash
git add .
git commit -m "Fix backend for production deployment"
git push origin main
```
Render will automatically deploy.

**Option B - Manual Deploy:**
1. Go to Render Dashboard
2. Click "Manual Deploy"
3. Select "Deploy latest commit"

### Step 3: Verify Deployment

**Test MongoDB Connection:**
Check Render logs for:
```
Server running on port 5000
MongoDB connected
```

**Test Image Upload:**
```bash
curl -X POST https://thara-mens-wear.onrender.com/api/upload-image \
  -F "image=@test.jpg" \
  -F "productId=test123"
```

**Expected Response:**
```json
{
  "imageUrl": "https://thara-mens-wear.onrender.com/api/images/65f8a9b2c3d4e5f6g7h8i9j0"
}
```

**Test Image Retrieval:**
```bash
curl https://thara-mens-wear.onrender.com/api/images/IMAGE_ID
```

## 📋 Environment Variables Explained

### MONGO_URI
- **Purpose:** MongoDB Atlas connection string
- **Format:** `mongodb+srv://username:password@cluster.mongodb.net/database`
- **Where to add:** Render Dashboard → Environment
- **Example:** `mongodb+srv://thara:abbu007@cluster0.cjd2ran.mongodb.net/thara?retryWrites=true&w=majority&appName=Cluster0`

### BASE_URL
- **Purpose:** Backend URL for generating image URLs
- **Format:** `https://your-service.onrender.com`
- **Where to add:** Render Dashboard → Environment
- **Example:** `https://thara-mens-wear.onrender.com`

### PORT
- **Purpose:** Server port (Render auto-assigns, but can be set)
- **Format:** Number (e.g., `5000`)
- **Where to add:** Render Dashboard → Environment
- **Default:** Render uses its own port, fallback is `5000`

## 🔧 Full Server Code

```javascript
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS Configuration - Allow frontend access
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Image Schema
const imageSchema = new mongoose.Schema({
  productId: String,
  filename: String,
  data: String,
  contentType: String,
  createdAt: { type: Date, default: Date.now }
});

const Image = mongoose.model('Image', imageSchema);

// Multer Configuration
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Upload Image API
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    const base64 = req.file.buffer.toString('base64');
    const image = new Image({
      productId: req.body.productId,
      filename: req.file.originalname,
      data: base64,
      contentType: req.file.mimetype
    });
    await image.save();
    const baseUrl = process.env.BASE_URL || 'https://thara-mens-wear.onrender.com';
    res.json({ imageUrl: `${baseUrl}/api/images/${image._id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Image API
app.get('/api/images/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).send('Not found');
    const buffer = Buffer.from(image.data, 'base64');
    res.set('Content-Type', image.contentType);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Image API
app.delete('/api/images/:id', async (req, res) => {
  try {
    await Image.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

## 🧪 Testing Checklist

- [ ] Environment variables set on Render
- [ ] Backend deployed successfully
- [ ] MongoDB connection working (check logs)
- [ ] Image upload returns correct URL format
- [ ] Image retrieval works
- [ ] CORS allows frontend requests
- [ ] No localhost URLs in responses

## 🐛 Troubleshooting

### Issue: MongoDB connection failed
**Solution:** 
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check username/password are correct

### Issue: Image URLs still show localhost
**Solution:**
- Verify `BASE_URL` is set on Render
- Redeploy after setting environment variables
- Check Render logs for correct BASE_URL

### Issue: CORS errors from frontend
**Solution:**
- CORS is already configured to allow all origins
- Verify backend is deployed and running
- Check frontend is using correct backend URL

### Issue: Port binding error
**Solution:**
- Render automatically assigns PORT
- Code uses `process.env.PORT || 5000`
- No action needed

## ✅ Deployment Complete

Your backend is now production-ready with:
- ✅ Dynamic image URLs
- ✅ Environment-based configuration
- ✅ CORS enabled for Vercel
- ✅ MongoDB Atlas connection
- ✅ Dynamic port binding
- ✅ Base64 image storage

Deploy and test!
