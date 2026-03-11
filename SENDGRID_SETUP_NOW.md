# 🚀 SendGrid Setup - 2 Minutes

## Step 1: Get SendGrid API Key (1 min)

1. Go to: https://app.sendgrid.com/settings/api_keys
2. Click **"Create API Key"**
3. Name: `THARA-Backend`
4. Permission: **Full Access**
5. Click **"Create & View"**
6. **COPY THE KEY** (starts with `SG.`)

## Step 2: Verify Sender Email (1 min)

1. Go to: https://app.sendgrid.com/settings/sender_auth/senders
2. Click **"Create New Sender"**
3. Fill form with your details:
   - From Email: `abdulkani180607@gmail.com`
   - From Name: `THARA Men's Wear`
4. Click **"Create"**
5. **Check your email** and click verification link

## Step 3: Update .env File

Open `server/.env` and replace:

```env
SENDGRID_API_KEY=SG.paste_your_actual_key_here
SENDGRID_FROM_EMAIL=abdulkani180607@gmail.com
```

## Step 4: Test Locally

```bash
cd server
npm start
```

Should see: `📧 Email service configured with SendGrid API`

Test email:
```bash
curl -X POST http://localhost:5000/api/test-email -H "Content-Type: application/json" -d "{\"email\":\"your@email.com\"}"
```

## Step 5: Deploy to Render

1. Go to: https://dashboard.render.com/
2. Select your backend service
3. Go to **Environment** tab
4. Add/Update:
   - `SENDGRID_API_KEY` = `SG.your_actual_key`
   - `SENDGRID_FROM_EMAIL` = `abdulkani180607@gmail.com`
5. Click **"Save Changes"**
6. Service will auto-redeploy

## ✅ Done!

Your email notifications are now working! 🎉

Test on production:
```bash
curl -X POST https://thara-mens-wear.onrender.com/api/test-email -H "Content-Type: application/json" -d "{\"email\":\"your@email.com\"}"
```
