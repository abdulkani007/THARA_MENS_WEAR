# 🚀 QUICK SETUP - Backend Environment Variables

## Where to Add Environment Variables

### On Render (Production):

1. **Go to:** https://dashboard.render.com
2. **Select:** Your backend service (thara-mens-wear)
3. **Click:** Environment tab (left sidebar)
4. **Click:** "Add Environment Variable" button
5. **Add these 3 variables:**

```
Key: MONGO_URI
Value: mongodb+srv://thara:abbu007@cluster0.cjd2ran.mongodb.net/thara?retryWrites=true&w=majority&appName=Cluster0

Key: BASE_URL
Value: https://thara-mens-wear.onrender.com

Key: PORT
Value: 5000
```

6. **Click:** "Save Changes"
7. **Wait:** Render will auto-redeploy

### Locally (Development):

File: `backend/.env` (already created)
```
PORT=5000
MONGO_URI=mongodb+srv://thara:abbu007@cluster0.cjd2ran.mongodb.net/thara?retryWrites=true&w=majority&appName=Cluster0
BASE_URL=http://localhost:5000
```

## ✅ What Each Variable Does

**MONGO_URI**
- Connects to MongoDB Atlas database
- Contains username, password, cluster URL, and database name

**BASE_URL**
- Used to generate image URLs in API responses
- Production: `https://thara-mens-wear.onrender.com`
- Local: `http://localhost:5000`

**PORT**
- Server listening port
- Render auto-assigns, but 5000 is fallback

## 🧪 Test After Setup

```bash
# Test backend is running
curl https://thara-mens-wear.onrender.com/api/images

# Test image upload
curl -X POST https://thara-mens-wear.onrender.com/api/upload-image \
  -F "image=@test.jpg" \
  -F "productId=test123"
```

## ✅ Checklist

- [ ] Environment variables added on Render
- [ ] Backend redeployed
- [ ] Check Render logs for "Server running on port..."
- [ ] Test API endpoints
- [ ] Image URLs return correct domain (not localhost)
