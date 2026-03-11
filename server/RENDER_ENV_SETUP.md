# ⚠️ IMPORTANT: Render Environment Variables Setup

## 🔴 Problem Identified

From your Render logs:
```
[dotenv@17.3.1] injecting env (0) from .env
```

This shows **0 environment variables** are being loaded!

**Why?** 
- The `.env` file is NOT deployed to Render (it's in `.gitignore`)
- You MUST set environment variables in Render Dashboard

---

## ✅ Solution: Set Environment Variables on Render

### Step 1: Go to Render Dashboard

1. Open: https://dashboard.render.com/
2. Click on your service: **thara-mens-wear**
3. Click **Environment** tab (left sidebar)

### Step 2: Add These Environment Variables

Click **Add Environment Variable** and add each one:

| Key | Value |
|-----|-------|
| `EMAIL_USER` | `abdulkani180607@gmail.com` |
| `EMAIL_PASS` | `iixltzpfwshrtrbf` |
| `MONGO_URI` | `mongodb+srv://thara:abbu007@cluster0.cjd2ran.mongodb.net/thara?retryWrites=true&w=majority&appName=Cluster0` |
| `BASE_URL` | `https://thara-mens-wear.onrender.com` |
| `PORT` | `5000` |

### Step 3: Save and Redeploy

1. Click **Save Changes**
2. Render will automatically redeploy
3. Wait for deployment to complete

---

## 📊 How to Verify

### Check Render Logs After Deployment:

**Before (Wrong):**
```
[dotenv@17.3.1] injecting env (0) from .env  ❌
❌ Email transporter verification failed: Connection timeout
```

**After (Correct):**
```
Server running on port 5000
MongoDB Connected
✅ Email service is ready to send emails (Port 587)  ✅
```

---

## 🔍 Why .env File Doesn't Work on Render

1. **`.gitignore` blocks it** - `.env` is not pushed to Git
2. **Security** - Credentials should never be in Git
3. **Render uses Environment Variables** - Set in dashboard

### Local Development vs Production:

| Environment | Uses |
|-------------|------|
| **Local** (your computer) | `server/.env` file |
| **Render** (production) | Environment Variables in Dashboard |

---

## 📝 Current Status

### ✅ Fixed in Code:
- Email service now uses port 587 (Render compatible)
- Non-blocking verification (won't delay startup)
- Timeout settings added
- Better error messages

### ⚠️ You Need to Do:
- **Set environment variables in Render Dashboard**
- This is the ONLY remaining step

---

## 🧪 Test After Setting Variables

### 1. Check Logs:
```
✅ Email service is ready to send emails (Port 587)
```

### 2. Test Email Endpoint:
```bash
curl -X POST https://thara-mens-wear.onrender.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```

### 3. Expected Response:
```json
{
  "success": true,
  "message": "Test email sent successfully!"
}
```

---

## 🎯 Quick Checklist

- [ ] Go to Render Dashboard
- [ ] Click your service → Environment tab
- [ ] Add `EMAIL_USER` = `abdulkani180607@gmail.com`
- [ ] Add `EMAIL_PASS` = `iixltzpfwshrtrbf`
- [ ] Add `MONGO_URI` (your MongoDB connection string)
- [ ] Add `BASE_URL` = `https://thara-mens-wear.onrender.com`
- [ ] Click Save Changes
- [ ] Wait for automatic redeploy
- [ ] Check logs for "✅ Email service is ready"
- [ ] Test email endpoint

---

## 📸 Visual Guide

### Where to Add Environment Variables:

```
Render Dashboard
  └── Your Service (thara-mens-wear)
      └── Environment (left sidebar)
          └── Add Environment Variable button
              ├── Key: EMAIL_USER
              ├── Value: abdulkani180607@gmail.com
              └── [Add] button
```

---

## 🆘 Still Not Working?

### Check These:

1. **Environment variables saved?**
   - Go to Render → Environment
   - Verify all 5 variables are listed

2. **Redeployed after saving?**
   - Render should auto-redeploy
   - Or manually click "Manual Deploy" → "Deploy latest commit"

3. **Gmail App Password correct?**
   - Should be 16 characters: `iixltzpfwshrtrbf`
   - No spaces

4. **Check Render logs:**
   - Look for "Email service is ready"
   - Or error messages

---

## ✅ Summary

**The Issue:** Environment variables not set on Render

**The Fix:** Add them in Render Dashboard → Environment

**Files:** 
- ✅ `server/.env` - For LOCAL development only
- ✅ Render Dashboard - For PRODUCTION (what you need to set)

---

**Next Step:** Set the environment variables in Render Dashboard and redeploy! 🚀
