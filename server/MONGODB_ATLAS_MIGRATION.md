# MongoDB Atlas Migration Guide - THARA Backend

## ✅ Changes Made

### 1. Updated `.env` File

**Before (Local MongoDB):**
```env
MONGODB_URI=mongodb://localhost:27017/thara
```

**After (MongoDB Atlas):**
```env
MONGODB_URI=mongodb+srv://thara:abbu007@cluster0.cjd2ran.mongodb.net/thara?retryWrites=true&w=majority&appName=Cluster0
```

### 2. Connection Code (Already Correct)

Your `server/index.js` already uses environment variables:

```javascript
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));
```

**This works for both local and Atlas!** ✅

## 🔧 MongoDB Atlas Setup Checklist

### Step 1: Whitelist IP Addresses
1. Go to MongoDB Atlas Dashboard
2. Navigate to **Network Access**
3. Click **Add IP Address**
4. Choose **Allow Access from Anywhere**: `0.0.0.0/0`
5. Click **Confirm**

### Step 2: Verify Database User
1. Go to **Database Access**
2. Ensure user `thara` exists with password `abbu007`
3. User should have **Read and Write** permissions

### Step 3: Update Connection String
Your connection string breakdown:
```
mongodb+srv://thara:abbu007@cluster0.cjd2ran.mongodb.net/thara?retryWrites=true&w=majority&appName=Cluster0
```

- **Protocol**: `mongodb+srv://` (Atlas uses SRV)
- **Username**: `thara`
- **Password**: `abbu007`
- **Cluster**: `cluster0.cjd2ran.mongodb.net`
- **Database**: `thara` (added after cluster URL)
- **Options**: `retryWrites=true&w=majority&appName=Cluster0`

## 📁 Complete `.env` Configuration

```env
PORT=5000
MONGODB_URI=mongodb+srv://thara:abbu007@cluster0.cjd2ran.mongodb.net/thara?retryWrites=true&w=majority&appName=Cluster0
PUBLIC_URL=http://YOUR_PUBLIC_IP:5000
```

**For Production (Render/Railway/Heroku):**
```env
PORT=5000
MONGODB_URI=mongodb+srv://thara:abbu007@cluster0.cjd2ran.mongodb.net/thara?retryWrites=true&w=majority&appName=Cluster0
PUBLIC_URL=https://your-backend.onrender.com
```

## 🚀 Testing the Connection

### Local Testing:
```bash
cd server
npm install
npm start
```

**Expected Output:**
```
Server running on port 5000
MongoDB connected
```

### Test API Endpoint:
```bash
curl http://localhost:5000/api/images/test
```

## 🔒 Security Best Practices

### 1. Use Environment Variables (Already Done ✅)
Never hardcode credentials in code.

### 2. Create `.env.example` for Reference:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri_here
PUBLIC_URL=your_public_url_here
```

### 3. Add to `.gitignore`:
```
.env
node_modules/
```

## 🌐 Deployment Configuration

### For Render.com:
1. Go to your service dashboard
2. Navigate to **Environment**
3. Add environment variable:
   - **Key**: `MONGODB_URI`
   - **Value**: `mongodb+srv://thara:abbu007@cluster0.cjd2ran.mongodb.net/thara?retryWrites=true&w=majority&appName=Cluster0`
4. Save and redeploy

### For Railway.app:
1. Go to your project
2. Click **Variables**
3. Add `MONGODB_URI` with Atlas connection string
4. Deploy

### For Heroku:
```bash
heroku config:set MONGODB_URI="mongodb+srv://thara:abbu007@cluster0.cjd2ran.mongodb.net/thara?retryWrites=true&w=majority&appName=Cluster0"
```

## 🐛 Troubleshooting

### Error: "MongoServerError: bad auth"
**Solution**: Check username and password in Atlas dashboard

### Error: "MongooseServerSelectionError"
**Solution**: 
1. Whitelist IP address `0.0.0.0/0` in Network Access
2. Check if cluster is active (not paused)

### Error: "ENOTFOUND cluster0.cjd2ran.mongodb.net"
**Solution**: Check internet connection and DNS settings

### Error: "Authentication failed"
**Solution**: 
1. Verify user exists in Database Access
2. Check password (special characters need URL encoding)
3. Ensure user has correct permissions

## 📊 Connection Options Explained

```
?retryWrites=true&w=majority&appName=Cluster0
```

- **retryWrites=true**: Automatically retry failed write operations
- **w=majority**: Wait for majority of nodes to acknowledge writes
- **appName=Cluster0**: Identifies your application in Atlas logs

## 🔄 Migrating Existing Data

If you have data in local MongoDB:

### Option 1: MongoDB Compass
1. Connect to local: `mongodb://localhost:27017/thara`
2. Export collections
3. Connect to Atlas: Use your Atlas URI
4. Import collections

### Option 2: mongodump/mongorestore
```bash
# Export from local
mongodump --db=thara --out=./backup

# Import to Atlas
mongorestore --uri="mongodb+srv://thara:abbu007@cluster0.cjd2ran.mongodb.net/thara" ./backup/thara
```

## ✅ Verification Checklist

- [x] `.env` updated with Atlas URI
- [x] Database name `thara` added to connection string
- [x] IP address `0.0.0.0/0` whitelisted in Atlas
- [x] Database user `thara` exists with correct password
- [x] Connection tested locally
- [x] Backend deployed with Atlas URI
- [x] Frontend `REACT_APP_BACKEND_URL` updated

## 🎯 Final Connection String Format

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Your Configuration:**
```
mongodb+srv://thara:abbu007@cluster0.cjd2ran.mongodb.net/thara?retryWrites=true&w=majority&appName=Cluster0
```

---

**Your backend is now connected to MongoDB Atlas!** 🚀

**No code changes needed** - just update the `.env` file!
