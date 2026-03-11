# 📧 SendGrid Email Service Setup

## ✅ Migration Complete: Resend → SendGrid

Successfully migrated email service to **SendGrid** for reliable email delivery.

---

## 🚀 Quick Setup

### Step 1: Get SendGrid API Key

1. Go to: https://app.sendgrid.com/
2. Sign up or log in
3. Navigate to: **Settings** → **API Keys**
4. Click **Create API Key**
5. Name: `THARA Backend`
6. Permissions: **Full Access** (or at least Mail Send)
7. Copy the API key (starts with `SG.`)

**Important:** Save the key immediately - you can't see it again!

---

### Step 2: Verify Sender Email

SendGrid requires you to verify the email address you'll send from.

#### Option A: Single Sender Verification (Easiest)
1. Go to: https://app.sendgrid.com/settings/sender_auth/senders
2. Click **Create New Sender**
3. Fill in your details:
   - **From Name:** Thara Mens Wear
   - **From Email:** your@email.com (use your real email)
   - **Reply To:** same email
   - **Company Address:** Your address
4. Click **Create**
5. Check your email and click verification link
6. Use this email as `SENDGRID_FROM_EMAIL`

#### Option B: Domain Authentication (Advanced)
1. Go to: https://app.sendgrid.com/settings/sender_auth/domain
2. Authenticate your domain
3. Add DNS records
4. Use any email from your domain

---

### Step 3: Update Environment Variables

#### For Local Development (`.env`):
```env
SENDGRID_API_KEY=SG.your_actual_api_key_here
SENDGRID_FROM_EMAIL=your_verified_email@example.com
```

#### For Render (Dashboard):
1. Go to: https://dashboard.render.com/
2. Click your service: **thara-mens-wear**
3. Click **Environment** tab
4. Add these variables:

```
SENDGRID_API_KEY = SG.your_actual_api_key_here
SENDGRID_FROM_EMAIL = your_verified_email@example.com
```

5. **Remove old variables:**
   - ❌ `RESEND_API_KEY`
   - ❌ `EMAIL_USER`
   - ❌ `EMAIL_PASS`

6. Click **Save Changes**

---

## 📊 What Changed

### Before (Resend):
```javascript
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Thara Mens Wear <onboarding@resend.dev>',
  to: to,
  subject: subject,
  html: html
});
```

### After (SendGrid):
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: to,
  from: process.env.SENDGRID_FROM_EMAIL,
  subject: subject,
  html: html
});
```

---

## 🔧 Configuration

### Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `SENDGRID_API_KEY` | Your SendGrid API key | `SG.abc123...` |
| `SENDGRID_FROM_EMAIL` | Verified sender email | `noreply@yourdomain.com` |

### Package Dependencies:

```json
{
  "dependencies": {
    "@sendgrid/mail": "^8.1.4"
  }
}
```

---

## 🧪 Testing

### 1. Start Server Locally:
```bash
cd server
npm start
```

**Look for:**
```
📧 Email service configured with SendGrid API
MongoDB Connected
Server running on port 5000
```

### 2. Test Email Endpoint:
```bash
curl -X POST http://localhost:5000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```

### 3. Expected Response:
```json
{
  "success": true,
  "message": "Test email sent successfully!",
  "messageId": "sent",
  "sentTo": "your@email.com"
}
```

### 4. Check Your Inbox:
- Email should arrive within seconds
- From: **Thara Mens Wear <your_verified_email@example.com>**
- Subject: **Test Email - Thara Men's Wear**

---

## 📋 API Endpoints (Unchanged)

All endpoints work exactly the same:

### 1. Test Email
```
POST /api/test-email
Body: { "email": "user@example.com" }
```

### 2. Registration Email
```
POST /api/send-registration-email
Body: { "email": "user@example.com", "name": "John Doe" }
```

### 3. Order Email
```
POST /api/send-order-email
Body: { 
  "email": "user@example.com",
  "orderId": "ORD123",
  "orderTotal": 2999,
  "items": [{"name": "Shirt", "quantity": 1}]
}
```

---

## ✅ Benefits of SendGrid

| Feature | Resend | SendGrid |
|---------|--------|----------|
| Free Tier | 100/day | 100/day |
| Reliability | Good | Excellent |
| Deliverability | Good | Industry-leading |
| Analytics | Basic | Advanced |
| Support | Email | Email + Docs |
| Domain Auth | Easy | Easy |
| API Stability | New | Mature |

---

## 🔍 Error Handling

The service handles these errors:

```javascript
// API key missing
if (!process.env.SENDGRID_API_KEY) {
  return { success: false, error: 'SENDGRID_API_KEY not configured' };
}

// From email missing
if (!process.env.SENDGRID_FROM_EMAIL) {
  return { success: false, error: 'SENDGRID_FROM_EMAIL not configured' };
}

// SendGrid API errors
if (error.code === 403) {
  // Authentication failed
}
if (error.code === 429) {
  // Rate limit exceeded
}
if (error.code === 400) {
  // Bad request
}
```

**Server will NOT crash on email errors!**

---

## 📝 SendGrid Dashboard

Monitor your emails at: https://app.sendgrid.com/

**Features:**
- ✅ Email activity (sent, delivered, opened)
- ✅ Bounce tracking
- ✅ Spam reports
- ✅ Click tracking
- ✅ API usage stats

---

## 🆘 Troubleshooting

### Issue: "SENDGRID_API_KEY not configured"
**Solution:** 
1. Check `.env` file has the API key
2. For Render, check Dashboard → Environment
3. Restart server after adding

### Issue: "SENDGRID_FROM_EMAIL not configured"
**Solution:**
1. Add verified email to `.env`
2. Make sure email is verified in SendGrid
3. Check Render environment variables

### Issue: "The from email does not match a verified Sender Identity"
**Solution:**
1. Go to: https://app.sendgrid.com/settings/sender_auth/senders
2. Verify your sender email
3. Check your email for verification link
4. Use the exact verified email in `SENDGRID_FROM_EMAIL`

### Issue: Email not received
**Solution:**
1. Check SendGrid dashboard for delivery status
2. Check spam folder
3. Verify recipient email is valid
4. Check SendGrid activity logs

### Issue: "403 Forbidden"
**Solution:**
1. Check API key is correct
2. Regenerate API key if needed
3. Make sure API key has "Mail Send" permission

---

## 📦 Files Modified

- ✅ `server/services/emailService.js` - SendGrid implementation
- ✅ `server/package.json` - Added @sendgrid/mail, removed resend
- ✅ `server/.env` - Updated for SendGrid
- ✅ `server/.env.example` - Updated for SendGrid

---

## 🚀 Deployment

### Push to Git:
```bash
git add .
git commit -m "Migrate to SendGrid for email service"
git push origin main
```

### Set Render Environment Variables:
```
SENDGRID_API_KEY = SG.your_api_key
SENDGRID_FROM_EMAIL = your_verified_email@example.com
```

### Deploy:
Render will auto-deploy after Git push.

---

## ✅ Checklist

- [ ] SendGrid account created
- [ ] API key generated
- [ ] Sender email verified
- [ ] Local `.env` updated
- [ ] Render environment variables set
- [ ] Old variables removed (RESEND_API_KEY)
- [ ] Code pushed to Git
- [ ] Server deployed on Render
- [ ] Test email sent successfully

---

## 📊 Expected Logs

### On Server Startup:
```
📧 Email service configured with SendGrid API
MongoDB Connected
Server running on port 5000
```

### When Sending Email:
```
✅ Email sent successfully to: user@example.com
📧 Response status: 202
```

---

## 🎉 Summary

**Migration Complete:**
- ❌ Resend API
- ✅ SendGrid API

**What You Need:**
1. SendGrid API key
2. Verified sender email
3. Update environment variables

**Status:** ✅ Ready to use SendGrid!

---

**Next Steps:**
1. Get your SendGrid API key
2. Verify your sender email
3. Update `.env` and Render variables
4. Test and deploy! 🚀
