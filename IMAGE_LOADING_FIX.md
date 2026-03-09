# Image Loading Fix - THARA

## ✅ Issues Fixed

### 1. **Images Not Loading**
**Problem**: `PUBLIC_URL` was set to `http://YOUR_PUBLIC_IP:5000`

**Solution**: Changed to `http://localhost:5000`

### 2. **Banner URL Option Added**
Now you can either:
- **Upload Image** (stored in MongoDB)
- **Use Image URL** (external link like Imgur, Cloudinary, etc.)

## 🔧 Quick Fix Steps

### **Step 1: Restart Backend**
```bash
cd server
npm start
```

**Expected Output:**
```
Server running on port 5000
MongoDB connected
```

### **Step 2: Test Image Loading**
1. Go to any product page
2. Images should now load from: `http://localhost:5000/api/images/{id}`
3. Check browser console for errors

### **Step 3: Test Banner Creation**
1. Go to Admin → Banners
2. Click "Create Banner"
3. Choose option:
   - **Upload Image**: Select file from computer
   - **Use Image URL**: Paste external URL

## 📝 Banner Form Options

### **Option 1: Upload Image**
```
○ Upload Image  ● Use Image URL

[Select Banner Image]
```
- Uploads to MongoDB
- URL: `http://localhost:5000/api/images/abc123`

### **Option 2: Use Image URL**
```
● Upload Image  ○ Use Image URL

[Enter image URL (e.g., https://example.com/image.jpg)]
```
- Uses external URL
- Example: `https://i.imgur.com/banner.jpg`

## 🌐 For Production Deployment

### **Update `.env` when deploying:**
```env
PUBLIC_URL=https://your-backend.onrender.com
```

### **Or use environment variable in hosting:**
- Render: Set `PUBLIC_URL` in dashboard
- Railway: Add to Variables
- Heroku: `heroku config:set PUBLIC_URL=https://your-app.herokuapp.com`

## 🔍 Troubleshooting

### **Images still not loading?**

1. **Check backend is running:**
```bash
curl http://localhost:5000/api/images
```

2. **Check browser console:**
- Press F12
- Look for errors
- Should see: `GET http://localhost:5000/api/images/{id}`

3. **Verify MongoDB connection:**
- Check server logs
- Should see: "MongoDB connected"

4. **Test image upload:**
- Add new product
- Upload image
- Check if URL is generated

### **Banner images not showing?**

1. **If using Upload**: Check MongoDB has image data
2. **If using URL**: Verify URL is accessible
3. **Check image format**: JPG, PNG, WebP supported
4. **Check CORS**: External URLs must allow cross-origin

## ✅ Verification

### **Test Checklist:**
- [ ] Backend running on port 5000
- [ ] MongoDB connected
- [ ] Product images loading
- [ ] Banner upload works
- [ ] Banner URL option works
- [ ] No console errors

---

**Your images should now load correctly!** 🎉

**Restart backend if needed:**
```bash
cd server
npm start
```
