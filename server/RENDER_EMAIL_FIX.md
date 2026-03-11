# Email Service - Render Deployment Fix

## ✅ Problem Fixed

**Issue:** Nodemailer was using Gmail's default port 465 (SSL), which is blocked on Render free instances.

**Solution:** Changed to port 587 (STARTTLS) which is compatible with Render.

---

## 🔧 Changes Made

### Before (Port 465 - BLOCKED):
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Uses port 465 by default
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### After (Port 587 - WORKS):
```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,  // Use STARTTLS instead of SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});
```

---

## 🚀 Render Deployment Steps

### 1. Set Environment Variables on Render

Go to your Render dashboard → Your service → Environment:

```
EMAIL_USER=abdulkani180607@gmail.com
EMAIL_PASS=iixltzpfwshrtrbf
```

### 2. Deploy the Updated Code

```bash
git add .
git commit -m "Fix: Use port 587 for email service (Render compatible)"
git push origin main
```

Render will automatically redeploy.

### 3. Check Render Logs

After deployment, check logs for:

```
✅ Email service is ready to send emails (Port 587)
```

Instead of:

```
❌ Email transporter verification failed: connect ENETUNREACH
```

---

## 🧪 Testing on Render

### Test Endpoint:
```bash
curl -X POST https://your-app.onrender.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```

### Expected Response:
```json
{
  "success": true,
  "message": "Test email sent successfully! Check your inbox.",
  "messageId": "<abc123@gmail.com>",
  "sentTo": "your@email.com"
}
```

---

## 📊 Port Comparison

| Port | Protocol | Render Support | Status |
|------|----------|----------------|--------|
| 465  | SSL/TLS  | ❌ Blocked     | Old config |
| 587  | STARTTLS | ✅ Supported   | New config |
| 25   | Plain    | ❌ Blocked     | Not secure |

---

## 🔍 Error Handling

The updated service now handles these errors gracefully:

- **EAUTH** - Authentication failed (wrong credentials)
- **ETIMEDOUT** - Connection timeout
- **ECONNECTION** - Connection failed
- **ENETUNREACH** - Network unreachable (port blocked)

Server will NOT crash if email fails - it logs the error and continues.

---

## ✅ Verification Checklist

- [x] Changed from `service: 'gmail'` to explicit SMTP config
- [x] Using port 587 instead of 465
- [x] Set `secure: false` for STARTTLS
- [x] Added TLS configuration
- [x] Enhanced error logging
- [x] Server won't crash on email failure
- [x] Environment variables configured
- [x] Ready for Render deployment

---

## 🎯 Local Testing

Test locally before deploying:

```bash
cd server
npm start
```

Look for:
```
✅ Email service is ready to send emails (Port 587)
```

Then test with the HTML test page or cURL.

---

## 📝 Important Notes

1. **Gmail App Password Required**: Make sure you're using a Gmail App Password, not your regular password.

2. **Environment Variables**: Both `EMAIL_USER` and `EMAIL_PASS` must be set on Render.

3. **Port 587**: This is the standard SMTP submission port and works on most hosting platforms including Render.

4. **STARTTLS**: More compatible than SSL/TLS for cloud deployments.

5. **Error Handling**: All email functions have try/catch blocks to prevent server crashes.

---

## 🔗 Useful Links

- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Nodemailer Documentation](https://nodemailer.com/smtp/)

---

## 🆘 Troubleshooting

### Still getting ENETUNREACH?
- Verify port 587 is not blocked by your network
- Check Render logs for specific error messages
- Ensure environment variables are set correctly

### Authentication Failed?
- Regenerate Gmail App Password
- Remove any spaces from the password
- Update environment variables on Render

### Email not received?
- Check spam/junk folder
- Verify recipient email is correct
- Check Render logs for "Email sent successfully"

---

## ✅ Success Indicators

**Render Logs:**
```
MongoDB Connected
✅ Email service is ready to send emails (Port 587)
Server running on port 10000
```

**Test Email Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully!"
}
```

**Your Inbox:**
- Email received within 1-2 minutes
- THARA branding visible
- No errors in Render logs

---

**Status:** ✅ Ready for Render Deployment
