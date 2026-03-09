# Backend Deployment Fix - THARA

## ✅ Changes Made

### 1. Dynamic Image URLs
**Before:**
```javascript
res.json({ imageUrl: `http://localhost:5000/api/images/${image._id}` });
```

**After:**
```javascript
const baseUrl = process.env.BASE_URL || 'https://thara-mens-wear.onrender.com';
res.json({ imageUrl: `${baseUrl}/api/images/${image._id}` });
```

### 2. MongoDB Connection
**Before:**
```javascript
mongoose.connect('mongodb+srv://username:password@cluster.mongodb.net/thara')
```

**After:**
```javascript
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

### 3. Dynamic Port
**Before:**
```javascript
app.listen(5000, () => console.log('Server on port 5000'));
```

**After:**
```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

## 🚀 Deployment Steps

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Set Environment Variables on Render

Go to Render Dashboard → Your Service → Environment

Add these variables:
```
PORT=5000
MONGO_URI=mongodb+srv://thara:abbu007@cluster0.cjd2ran.mongodb.net/thara?retryWrites=true&w=majority&appName=Cluster0
BASE_URL=https://thara-mens-wear.onrender.com
```

### Step 3: Deploy
```bash
git add .
git commit -m "Fix backend for production deployment"
git push origin main
```

Render will auto-deploy.

## 🧪 Test

```bash
# Test image upload returns correct URL
curl -X POST https://thara-mens-wear.onrender.com/api/upload-image \
  -F "image=@test.jpg" \
  -F "productId=test123"

# Expected response:
# {"imageUrl":"https://thara-mens-wear.onrender.com/api/images/..."}
```

## ✅ Verification

- [ ] `npm install` completes successfully
- [ ] Backend starts locally with `npm start`
- [ ] Environment variables set on Render
- [ ] Deployed backend returns correct image URLs
- [ ] MongoDB connection works
- [ ] Images accessible via returned URLs
